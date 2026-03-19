const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { Category } = require('../models/index');

// Advanced query builder
class QueryBuilder {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    if (this.queryStr.keyword) {
      const keyword = {
        $or: [
          { name: { $regex: this.queryStr.keyword, $options: 'i' } },
          { description: { $regex: this.queryStr.keyword, $options: 'i' } },
          { brand: { $regex: this.queryStr.keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(this.queryStr.keyword, 'i')] } }
        ]
      };
      this.query = this.query.find(keyword);
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludeFields = ['keyword', 'page', 'limit', 'sort', 'fields'];
    excludeFields.forEach(field => delete queryObj[field]);

    // Price range
    if (queryObj.minPrice || queryObj.maxPrice) {
      queryObj.price = {};
      if (queryObj.minPrice) queryObj.price.$gte = Number(queryObj.minPrice);
      if (queryObj.maxPrice) queryObj.price.$lte = Number(queryObj.maxPrice);
      delete queryObj.minPrice;
      delete queryObj.maxPrice;
    }

    // Rating filter
    if (queryObj.minRating) {
      queryObj['ratings.average'] = { $gte: Number(queryObj.minRating) };
      delete queryObj.minRating;
    }

    // Brand filter (array)
    if (queryObj.brand) {
      const brands = queryObj.brand.split(',');
      queryObj.brand = { $in: brands };
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|nin)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryStr.page) || 1;
    const limit = parseInt(this.queryStr.limit) || 12;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }

  selectFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }
}

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const features = new QueryBuilder(
    Product.find({ isPublished: true }).populate('category', 'name slug'),
    req.query
  ).search().filter().sort().selectFields();

  const totalProducts = await Product.countDocuments(features.query._conditions);
  features.paginate();

  const products = await features.query;
  const totalPages = Math.ceil(totalProducts / (parseInt(req.query.limit) || 12));

  res.status(200).json({
    success: true,
    count: products.length,
    totalProducts,
    totalPages,
    currentPage: features.page,
    products
  });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }],
    isPublished: true
  }).populate('category', 'name slug');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Increment view count
  await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

  // Add to recently viewed if user is logged in
  if (req.user) {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (user) await user.addToRecentlyViewed(product._id);
  }

  res.status(200).json({ success: true, product });
});

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isPublished: true })
    .populate('category', 'name')
    .limit(8)
    .sort('-createdAt');

  res.status(200).json({ success: true, products });
});

// @desc    Get trending products
// @route   GET /api/v1/products/trending
// @access  Public
exports.getTrendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isTrending: true, isPublished: true })
    .populate('category', 'name')
    .limit(8)
    .sort('-soldCount');

  res.status(200).json({ success: true, products });
});

// @desc    Get new arrivals
// @route   GET /api/v1/products/new-arrivals
// @access  Public
exports.getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isPublished: true })
    .populate('category', 'name')
    .sort('-createdAt')
    .limit(8);

  res.status(200).json({ success: true, products });
});

// @desc    Get related products
// @route   GET /api/v1/products/:id/related
// @access  Public
exports.getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isPublished: true
  }).limit(6).sort('-ratings.average');

  res.status(200).json({ success: true, products: related });
});

// @desc    Search autocomplete
// @route   GET /api/v1/products/search/autocomplete
// @access  Public
exports.autocomplete = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.status(200).json({ success: true, suggestions: [] });

  const products = await Product.find({
    isPublished: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } }
    ]
  })
  .select('name brand images slug')
  .limit(8);

  const categories = await Category.find({
    name: { $regex: q, $options: 'i' },
    isActive: true
  }).select('name slug').limit(3);

  res.status(200).json({
    success: true,
    suggestions: {
      products: products.map(p => ({
        _id: p._id,
        name: p.name,
        brand: p.brand,
        image: p.images[0]?.url,
        slug: p.slug,
        type: 'product'
      })),
      categories: categories.map(c => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        type: 'category'
      }))
    }
  });
});

// @desc    Create product (Admin)
// @route   POST /api/v1/products
// @access  Admin
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, message: 'Product created successfully', product });
});

// @desc    Update product (Admin)
// @route   PUT /api/v1/products/:id
// @access  Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, message: 'Product updated', product });
});

// @desc    Delete product (Admin)
// @route   DELETE /api/v1/products/:id
// @access  Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  // Soft delete
  await Product.findByIdAndUpdate(req.params.id, { isDeleted: true, isPublished: false });

  res.status(200).json({ success: true, message: 'Product deleted' });
});

// @desc    Get product reviews
// @route   GET /api/v1/products/:id/reviews
// @access  Public
exports.getProductReviews = asyncHandler(async (req, res) => {
  const { Review } = require('../models/index');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ product: req.params.id, isApproved: true })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({ product: req.params.id, isApproved: true });

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId(req.params.id), isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);

  res.status(200).json({ success: true, reviews, total, currentPage: page, distribution });
});

// @desc    Create review
// @route   POST /api/v1/products/:id/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res) => {
  const { Review } = require('../models/index');
  const { rating, title, comment } = req.body;

  // Check if already reviewed
  const existing = await Review.findOne({ product: req.params.id, user: req.user.id });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
  }

  const review = await Review.create({
    product: req.params.id,
    user: req.user.id,
    rating,
    title,
    comment
  });

  const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

  res.status(201).json({ success: true, message: 'Review added', review: populatedReview });
});
