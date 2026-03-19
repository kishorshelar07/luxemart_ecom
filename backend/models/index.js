const mongoose = require('mongoose');
const slugify = require('slugify');

// ====================== CATEGORY MODEL ======================
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  slug: { type: String, unique: true },
  description: String,
  image: {
    public_id: String,
    url: String
  },
  icon: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  seo: { title: String, description: String }
}, { timestamps: true, toJSON: { virtuals: true } });

categorySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// ====================== ORDER MODEL ======================
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: {
    size: String,
    color: String,
    sku: String
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  pricing: {
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  coupon: {
    code: String,
    discount: Number
  },
  payment: {
    method: { type: String, enum: ['cod', 'razorpay', 'stripe', 'wallet'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    stripePaymentIntentId: String,
    paidAt: Date
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'],
    default: 'pending'
  },
  timeline: [{
    status: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    location: String
  }],
  tracking: {
    carrier: String,
    trackingNumber: String,
    url: String,
    estimatedDelivery: Date
  },
  notes: String,
  cancelReason: String,
  returnReason: String,
  refundAmount: Number,
  refundedAt: Date,
  deliveredAt: Date,
  isReviewed: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
// orderId index auto-created by unique:true in schema field
orderSchema.index({ 'payment.status': 1 });

orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderId) {
    this.orderId = 'LUX' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// ====================== REVIEW MODEL ======================
const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
  images: [{ public_id: String, url: String }],
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerifiedPurchase: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  reply: {
    message: String,
    repliedAt: Date,
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, rating: -1 });

// Update product ratings after review save
reviewSchema.post('save', async function() {
  const Product = mongoose.model('Product');
  const stats = await this.constructor.aggregate([
    { $match: { product: this.product, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      'ratings.average': Math.round(stats[0].avgRating * 10) / 10,
      'ratings.count': stats[0].count
    });
  }
});

// ====================== COUPON MODEL ======================
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minimumOrderAmount: { type: Number, default: 0 },
  maximumDiscount: Number,
  usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  userLimit: { type: Number, default: 1 },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  usedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, usedAt: Date }]
}, { timestamps: true });

// code index auto-created by unique:true in schema field
couponSchema.index({ endDate: 1 });
couponSchema.index({ isActive: 1 });

// ====================== CART MODEL ======================
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    variant: { size: String, color: String },
    price: Number
  }],
  coupon: {
    code: String,
    discount: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// ====================== BANNER MODEL ======================
const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  image: { public_id: String, url: { type: String, required: true } },
  link: String,
  buttonText: String,
  position: { type: String, enum: ['hero', 'banner', 'sidebar'], default: 'hero' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date
}, { timestamps: true });

module.exports = {
  Category: mongoose.model('Category', categorySchema),
  Order: mongoose.model('Order', orderSchema),
  Review: mongoose.model('Review', reviewSchema),
  Coupon: mongoose.model('Coupon', couponSchema),
  Cart: mongoose.model('Cart', cartSchema),
  Banner: mongoose.model('Banner', bannerSchema)
};
