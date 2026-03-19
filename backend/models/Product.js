const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema({
  name: String,
  options: [{
    value: String,
    stock: { type: Number, default: 0 },
    price: Number,
    sku: String
  }]
});

const imageSchema = new mongoose.Schema({
  public_id: String,
  url: { type: String, required: true },
  alt: String,
  isMain: { type: Boolean, default: false }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: { type: String, unique: true },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative'],
    select: false
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: String,
  brand: { type: String, trim: true },
  images: [imageSchema],
  variants: [variantSchema],
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [String],
  attributes: [{
    key: String,
    value: String
  }],
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  discount: {
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    amount: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: false }
  },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm' }
  },
  returnPolicy: { type: String, default: '30 days return policy' },
  warranty: String,
  shippingInfo: {
    freeShipping: { type: Boolean, default: false },
    shippingCost: { type: Number, default: 0 },
    estimatedDays: { type: String, default: '3-7 business days' }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  viewCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance (slug index auto-created by unique:true, sku by sparse unique)
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isTrending: 1 });
productSchema.index({ isPublished: 1, isDeleted: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

// Virtual for effective price (after discount)
productSchema.virtual('effectivePrice').get(function() {
  if (this.discount?.isActive && this.discount?.percentage > 0) {
    const now = new Date();
    if ((!this.discount.startDate || this.discount.startDate <= now) &&
        (!this.discount.endDate || this.discount.endDate >= now)) {
      return Math.round(this.price * (1 - this.discount.percentage / 100));
    }
  }
  if (this.discount?.amount > 0) return Math.max(0, this.price - this.discount.amount);
  return this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return this.discount?.percentage || 0;
});

// Virtual for in stock
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Pre-save: generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

// Query middleware to exclude deleted products
productSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

module.exports = mongoose.model('Product', productSchema);
