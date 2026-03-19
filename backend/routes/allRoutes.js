const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

// ====== WISHLIST ROUTES ======
const wishlistRouter = express.Router();
wishlistRouter.use(protect);

wishlistRouter.get('/', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name images price effectivePrice ratings brand slug');
  res.json({ success: true, wishlist: user.wishlist });
}));

wishlistRouter.post('/toggle', asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user.id);
  const index = user.wishlist.findIndex(id => id.toString() === productId);
  let added;
  if (index > -1) {
    user.wishlist.splice(index, 1);
    added = false;
  } else {
    user.wishlist.push(productId);
    added = true;
  }
  await user.save();
  res.json({ success: true, added, message: added ? 'Added to wishlist' : 'Removed from wishlist', wishlist: user.wishlist });
}));

// ====== COUPON ROUTES ======
const couponRouter = express.Router();
const { Coupon } = require('../models/index');

couponRouter.post('/validate', protect, asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  if (coupon.endDate < new Date()) return res.status(400).json({ success: false, message: 'Coupon has expired' });
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
  }
  if (orderAmount && orderAmount < coupon.minimumOrderAmount) {
    return res.status(400).json({ success: false, message: `Minimum order amount ₹${coupon.minimumOrderAmount}` });
  }
  let discount = 0;
  if (orderAmount) {
    if (coupon.discountType === 'percentage') {
      discount = Math.round((orderAmount * coupon.discountValue) / 100);
      if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
    } else {
      discount = coupon.discountValue;
    }
  }
  res.json({ success: true, coupon: { ...coupon.toObject(), calculatedDiscount: discount } });
}));

// ====== ADMIN ROUTES ======
const adminRouter = express.Router();
adminRouter.use(protect, authorize('admin', 'superadmin'));
const {
  getDashboardAnalytics, getUsers, updateUser,
  getBanners, createBanner, updateBanner, deleteBanner,
  getCoupons, createCoupon, updateCoupon, deleteCoupon
} = require('../controllers/adminController');

adminRouter.get('/analytics', getDashboardAnalytics);
adminRouter.get('/users', getUsers);
adminRouter.put('/users/:id', updateUser);
adminRouter.route('/banners').get(getBanners).post(createBanner);
adminRouter.route('/banners/:id').put(updateBanner).delete(deleteBanner);
adminRouter.route('/coupons').get(getCoupons).post(createCoupon);
adminRouter.route('/coupons/:id').put(updateCoupon).delete(deleteCoupon);

// ====== REVIEW ROUTES ======
const reviewRouter = express.Router();
const { Review } = require('../models/index');

reviewRouter.get('/', asyncHandler(async (req, res) => {
  const { product } = req.query;
  const filter = { isApproved: true };
  if (product) filter.product = product;
  const reviews = await Review.find(filter).populate('user', 'name avatar').sort('-createdAt').limit(20);
  res.json({ success: true, reviews });
}));
reviewRouter.put('/:id/helpful', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  const index = review.helpful.indexOf(req.user.id);
  if (index > -1) review.helpful.splice(index, 1);
  else review.helpful.push(req.user.id);
  await review.save();
  res.json({ success: true, helpfulCount: review.helpful.length });
}));
reviewRouter.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
}));

// ====== UPLOAD ROUTES ======
const uploadRouter = express.Router();
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

uploadRouter.post('/', protect, upload.array('images', 10), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded' });
  const files = req.files.map(file => ({
    url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${file.filename}`,
    filename: file.filename
  }));
  res.json({ success: true, files });
}));

// ====== PAYMENT ROUTES ======
const paymentRouter = express.Router();
paymentRouter.get('/razorpay-key', (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
});

module.exports = {
  wishlistRouter, couponRouter, adminRouter, reviewRouter, uploadRouter, paymentRouter
};
