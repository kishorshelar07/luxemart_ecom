const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const { Cart } = require('../models/index');
const Product = require('../models/Product');

const router = express.Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name images price effectivePrice stock brand slug');
  res.json({ success: true, cart: cart || { items: [], coupon: null } });
}));

router.post('/add', asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

  const existingIdx = cart.items.findIndex(i =>
    i.product.toString() === productId &&
    JSON.stringify(i.variant) === JSON.stringify(variant)
  );
  if (existingIdx > -1) {
    cart.items[existingIdx].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, variant, price: product.effectivePrice || product.price });
  }
  await cart.save();
  const updated = await Cart.findById(cart._id).populate('items.product', 'name images price effectivePrice stock brand slug');
  res.json({ success: true, message: 'Added to cart', cart: updated });
}));

router.put('/update/:itemId', asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  if (quantity <= 0) cart.items.pull(req.params.itemId);
  else item.quantity = quantity;
  await cart.save();
  const updated = await Cart.findById(cart._id).populate('items.product', 'name images price effectivePrice stock brand slug');
  res.json({ success: true, cart: updated });
}));

router.delete('/remove/:itemId', asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  cart.items.pull(req.params.itemId);
  await cart.save();
  const updated = await Cart.findById(cart._id).populate('items.product', 'name images price effectivePrice stock brand slug');
  res.json({ success: true, cart: updated });
}));

router.delete('/clear', asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], coupon: null });
  res.json({ success: true, message: 'Cart cleared' });
}));

module.exports = router;
