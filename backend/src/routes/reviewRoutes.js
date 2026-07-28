const express = require("express");
const {
  createReview,
  getBookingReview,
  getProviderReviews,
} = require("../controllers/reviewController");
const { ROLES } = require("../constants/roles");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { reviewSchemas } = require("../validators/schemas");

const router = express.Router();

router.get(
  "/booking/:bookingId",
  protect,
  validateRequest(reviewSchemas.byBooking),
  getBookingReview
);
router.get(
  "/provider/:providerId",
  validateRequest(reviewSchemas.listProvider),
  getProviderReviews
);
router.post(
  "/",
  protect,
  allowRoles(ROLES.CLIENT),
  validateRequest(reviewSchemas.create),
  createReview
);

module.exports = router;
