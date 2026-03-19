const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Order, Cart, Coupon } = require('../models/index');
const Product = require('../models/Product');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in order' });
  }

  // Calculate pricing
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
    }

    const price = product.effectivePrice || product.price;
    subtotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url,
      price,
      quantity: item.quantity,
      variant: item.variant
    });
  }

  // Apply coupon
  let couponDiscount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && coupon.endDate >= new Date() && subtotal >= coupon.minimumOrderAmount) {
      if (coupon.discountType === 'percentage') {
        couponDiscount = Math.round((subtotal * coupon.discountValue) / 100);
        if (coupon.maximumDiscount) couponDiscount = Math.min(couponDiscount, coupon.maximumDiscount);
      } else {
        couponDiscount = coupon.discountValue;
      }
      appliedCoupon = { code: coupon.code, discount: couponDiscount };
    }
  }

  const shippingCost = subtotal >= 999 ? 0 : 99;
  const taxRate = 0.18;
  const taxableAmount = subtotal - couponDiscount;
  const tax = Math.round(taxableAmount * taxRate);
  const total = taxableAmount + shippingCost + tax;

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    pricing: { subtotal, shippingCost, tax, discount: couponDiscount, total },
    coupon: appliedCoupon,
    payment: { method: paymentMethod, status: paymentMethod === 'cod' ? 'pending' : 'pending' },
    orderStatus: 'pending',
    notes,
    timeline: [{ status: 'pending', message: 'Order placed successfully' }]
  });

  // Update stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity }
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], coupon: null });

  // Update coupon usage
  if (appliedCoupon) {
    await Coupon.findOneAndUpdate(
      { code: appliedCoupon.code },
      { $inc: { usedCount: 1 }, $push: { usedBy: { user: req.user.id, usedAt: new Date() } } }
    );
  }

  const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

  // Send confirmation email
  try {
    const { sendEmail } = require('../utils/sendEmail');
    await sendEmail({
      email: req.user.email || populatedOrder.user.email,
      subject: `Order Confirmed - ${order.orderId}`,
      template: 'orderConfirmation',
      data: { order: populatedOrder }
    });
  } catch (err) { console.error('Order email error:', err); }

  res.status(201).json({ success: true, message: 'Order placed successfully', order: populatedOrder });
});

// @desc    Create Razorpay order
// @route   POST /api/v1/orders/razorpay/create
// @access  Private
exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  const options = {
    amount: Math.round(amount * 100),
    currency,
    receipt: `order_${Date.now()}`,
    notes: { userId: req.user.id }
  };

  const razorpayOrder = await razorpay.orders.create(options);

  res.status(200).json({
    success: true,
    order: razorpayOrder,
    key: process.env.RAZORPAY_KEY_ID
  });
});

// @desc    Verify Razorpay payment
// @route   POST /api/v1/orders/razorpay/verify
// @access  Private
exports.verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');

  if (expectedSign !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  const order = await Order.findByIdAndUpdate(orderId, {
    'payment.status': 'paid',
    'payment.razorpayOrderId': razorpay_order_id,
    'payment.razorpayPaymentId': razorpay_payment_id,
    'payment.paidAt': new Date(),
    orderStatus: 'confirmed',
    $push: { timeline: { status: 'confirmed', message: 'Payment received, order confirmed' } }
  }, { new: true });

  res.status(200).json({ success: true, message: 'Payment verified', order });
});

// @desc    Get user orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { user: req.user.id };
  if (req.query.status) filter.orderStatus = req.query.status;

  const orders = await Order.find(filter)
    .populate('items.product', 'name images slug')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({ success: true, orders, total, currentPage: page });
});

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images slug brand');

  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  // Check ownership (non-admin)
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.status(200).json({ success: true, order });
});

// @desc    Cancel order
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

  const cancellableStatuses = ['pending', 'confirmed', 'processing'];
  if (!cancellableStatuses.includes(order.orderStatus)) {
    return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
  }

  order.orderStatus = 'cancelled';
  order.cancelReason = req.body.reason || 'Cancelled by user';
  order.timeline.push({ status: 'cancelled', message: `Order cancelled: ${order.cancelReason}` });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity }
    });
  }

  await order.save();

  res.status(200).json({ success: true, message: 'Order cancelled', order });
});

// @desc    Get all orders (Admin)
// @route   GET /api/v1/orders
// @access  Admin
exports.getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.paymentStatus) filter['payment.status'] = req.query.paymentStatus;
  if (req.query.dateFrom || req.query.dateTo) {
    filter.createdAt = {};
    if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
    if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo);
  }

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({ success: true, orders, total, currentPage: page });
});

// @desc    Update order status (Admin)
// @route   PUT /api/v1/orders/:id/status
// @access  Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message, trackingNumber, carrier } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.orderStatus = status;
  order.timeline.push({ status, message: message || `Order ${status}` });

  if (status === 'delivered') order.deliveredAt = new Date();
  if (trackingNumber) {
    order.tracking = { trackingNumber, carrier };
  }

  await order.save();

  res.status(200).json({ success: true, message: 'Order status updated', order });
});
