const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const { Coupon } = require('../models/index');

const router = express.Router();

router.post('/validate', protect, asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  if (coupon.endDate < new Date()) return res.status(400).json({ success: false, message: 'Coupon has expired' });
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
    return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
  if (orderAmount && orderAmount < coupon.minimumOrderAmount)
    return res.status(400).json({ success: false, message: `Minimum order amount ₹${coupon.minimumOrderAmount}` });

  let discount = 0;
  if (orderAmount) {
    if (coupon.discountType === 'percentage') {
      discount = Math.round((orderAmount * coupon.discountValue) / 100);
      if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
    } else { discount = coupon.discountValue; }
  }
  res.json({ success: true, coupon: { ...coupon.toObject(), calculatedDiscount: discount } });
}));

module.exports = router;
