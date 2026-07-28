const express = require("express");
const {
  deleteMe,
  getMe,
  listUsers,
  updateMe,
  updateUserStatus,
} = require("../controllers/userController");
const { ROLES } = require("../constants/roles");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { userSchemas } = require("../validators/schemas");

const router = express.Router();

router.get("/me", protect, getMe);
router.patch("/me", protect, validateRequest(userSchemas.updateMe), updateMe);
router.delete("/me", protect, deleteMe);

router.get(
  "/",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(userSchemas.listUsers),
  listUsers
);
router.patch(
  "/:id/status",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(userSchemas.updateStatus),
  updateUserStatus
);

module.exports = router;
