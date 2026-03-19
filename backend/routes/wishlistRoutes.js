const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name images price effectivePrice ratings brand slug');
  res.json({ success: true, wishlist: user.wishlist });
}));

router.post('/toggle', asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user.id);
  const index = user.wishlist.findIndex(id => id.toString() === productId);
  let added;
  if (index > -1) { user.wishlist.splice(index, 1); added = false; }
  else { user.wishlist.push(productId); added = true; }
  await user.save();
  res.json({ success: true, added, message: added ? 'Added to wishlist' : 'Removed from wishlist', wishlist: user.wishlist });
}));

module.exports = router;
