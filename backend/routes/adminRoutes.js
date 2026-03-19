const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardAnalytics, getUsers, updateUser,
  getBanners, createBanner, updateBanner, deleteBanner,
  getCoupons, createCoupon, updateCoupon, deleteCoupon
} = require('../controllers/adminController');

const router = express.Router();
router.use(protect, authorize('admin', 'superadmin'));

router.get('/analytics', getDashboardAnalytics);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.route('/banners').get(getBanners).post(createBanner);
router.route('/banners/:id').put(updateBanner).delete(deleteBanner);
router.route('/coupons').get(getCoupons).post(createCoupon);
router.route('/coupons/:id').put(updateCoupon).delete(deleteCoupon);

module.exports = router;
