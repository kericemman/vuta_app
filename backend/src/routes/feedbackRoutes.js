const express = require("express");
const { ROLES } = require("../constants/roles");
const {
  createFeedback,
  deleteFeedback,
  listFeedback,
  updateFeedback,
} = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { feedbackSchemas } = require("../validators/schemas");

const router = express.Router();

router.post("/", protect, validateRequest(feedbackSchemas.create), createFeedback);
router.get(
  "/admin",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(feedbackSchemas.adminList),
  listFeedback
);
router.patch(
  "/admin/:id",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(feedbackSchemas.adminUpdate),
  updateFeedback
);
router.delete(
  "/admin/:id",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(feedbackSchemas.byId),
  deleteFeedback
);

module.exports = router;
