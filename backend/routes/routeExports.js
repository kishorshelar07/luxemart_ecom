const { wishlistRouter, couponRouter, adminRouter, reviewRouter, uploadRouter, paymentRouter } = require('./allRoutes');

// These are re-exported individually for server.js
module.exports = {
  wishlistRouter,
  couponRouter,
  adminRouter,
  reviewRouter,
  uploadRouter,
  paymentRouter
};
