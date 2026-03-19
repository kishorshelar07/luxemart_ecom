const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getFeaturedProducts, getTrendingProducts,
  getNewArrivals, getRelatedProducts, autocomplete, createProduct,
  updateProduct, deleteProduct, getProductReviews, createReview
} = require('../controllers/productController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/search/autocomplete', autocomplete);

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'superadmin'), createProduct);

router.route('/:id')
  .get(optionalAuth, getProduct)
  .put(protect, authorize('admin', 'superadmin'), updateProduct)
  .delete(protect, authorize('admin', 'superadmin'), deleteProduct);

router.get('/:id/related', getRelatedProducts);
router.route('/:id/reviews')
  .get(getProductReviews)
  .post(protect, createReview);

module.exports = router;
