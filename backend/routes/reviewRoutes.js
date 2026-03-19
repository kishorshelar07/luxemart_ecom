const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/auth');
const { Review } = require('../models/index');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const filter = { isApproved: true };
  if (req.query.product) filter.product = req.query.product;
  const reviews = await Review.find(filter).populate('user', 'name avatar').sort('-createdAt').limit(20);
  res.json({ success: true, reviews });
}));

router.put('/:id/helpful', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  const idx = review.helpful.indexOf(req.user.id);
  if (idx > -1) review.helpful.splice(idx, 1); else review.helpful.push(req.user.id);
  await review.save();
  res.json({ success: true, helpfulCount: review.helpful.length });
}));

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized' });
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
}));

module.exports = router;
