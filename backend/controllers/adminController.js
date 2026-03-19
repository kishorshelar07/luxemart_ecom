const asyncHandler = require('express-async-handler');
const { Order, Category, Coupon, Banner } = require('../models/index');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard analytics
// @route   GET /api/v1/admin/analytics
// @access  Admin
exports.getDashboardAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Aggregate stats
  const [
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    totalOrders,
    monthOrders,
    pendingOrders,
    totalUsers,
    newUsersMonth,
    totalProducts,
    lowStockProducts
  ] = await Promise.all([
    Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' }, count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ orderStatus: { $in: ['pending', 'confirmed', 'processing'] } }),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
    Product.countDocuments({ isPublished: true }),
    Product.countDocuments({ stock: { $lte: 10 }, isPublished: true })
  ]);

  // Monthly revenue chart (last 12 months)
  const monthlyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) }, 'payment.status': 'paid' } },
    { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 }
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $project: { name: '$product.name', image: { $arrayElemAt: ['$product.images.url', 0] }, totalSold: 1, revenue: 1 } }
  ]);

  // Category sales distribution
  const categorySales = await Order.aggregate([
    { $unwind: '$items' },
    { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $group: { _id: '$product.category', totalSales: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $project: { name: '$category.name', totalSales: 1, revenue: 1 } },
    { $sort: { revenue: -1 } },
    { $limit: 6 }
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(5)
    .select('orderId orderStatus pricing.total createdAt user');

  // Order status distribution
  const orderStatusDist = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ]);

  const revenueGrowth = lastMonthRevenue[0]?.total > 0
    ? (((monthRevenue[0]?.total || 0) - lastMonthRevenue[0].total) / lastMonthRevenue[0].total) * 100
    : 0;

  res.status(200).json({
    success: true,
    analytics: {
      overview: {
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        monthOrders: monthOrders,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        totalOrders,
        pendingOrders,
        totalUsers,
        newUsersMonth,
        totalProducts,
        lowStockProducts
      },
      monthlyRevenue,
      topProducts,
      categorySales,
      recentOrders,
      orderStatusDist
    }
  });
});

// @desc    Get all users (Admin)
// @route   GET /api/v1/admin/users
// @access  Admin
exports.getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.status(200).json({ success: true, users, total, currentPage: page });
});

// @desc    Update user status (Admin)
// @route   PUT /api/v1/admin/users/:id
// @access  Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ['role', 'isActive'];
  const updates = {};
  allowedFields.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  res.status(200).json({ success: true, message: 'User updated', user });
});

// @desc    Manage banners (Admin)
// @route   GET/POST/PUT/DELETE /api/v1/admin/banners
// @access  Admin
exports.getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort('sortOrder');
  res.status(200).json({ success: true, banners });
});

exports.createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, banner });
});

exports.updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
  res.status(200).json({ success: true, banner });
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Banner deleted' });
});

// @desc    Coupon CRUD (Admin)
exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.status(200).json({ success: true, coupons });
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, message: 'Coupon created', coupon });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
  res.status(200).json({ success: true, message: 'Coupon updated', coupon });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Coupon deleted' });
});

exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });

  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  if (coupon.endDate < new Date()) return res.status(400).json({ success: false, message: 'Coupon has expired' });
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
  }
  if (orderAmount < coupon.minimumOrderAmount) {
    return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minimumOrderAmount}` });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((orderAmount * coupon.discountValue) / 100);
    if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
  } else {
    discount = coupon.discountValue;
  }

  res.status(200).json({ success: true, coupon: { code: coupon.code, discount, discountType: coupon.discountType, discountValue: coupon.discountValue } });
});
