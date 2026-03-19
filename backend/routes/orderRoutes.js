// orderRoutes.js
const express = require('express');
const orderRouter = express.Router();
const {
  createOrder, createRazorpayOrder, verifyRazorpayPayment,
  getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

orderRouter.use(protect);
orderRouter.post('/', createOrder);
orderRouter.post('/razorpay/create', createRazorpayOrder);
orderRouter.post('/razorpay/verify', verifyRazorpayPayment);
orderRouter.get('/my-orders', getMyOrders);
orderRouter.get('/:id', getOrder);
orderRouter.put('/:id/cancel', cancelOrder);
orderRouter.get('/', authorize('admin', 'superadmin'), getAllOrders);
orderRouter.put('/:id/status', authorize('admin', 'superadmin'), updateOrderStatus);

module.exports = orderRouter;
