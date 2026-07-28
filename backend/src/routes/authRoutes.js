const express = require("express");
const {
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { authSchemas } = require("../validators/schemas");

const router = express.Router();

router.post("/register", validateRequest(authSchemas.register), register);
router.post("/login", validateRequest(authSchemas.login), login);
router.post(
  "/forgot-password",
  validateRequest(authSchemas.forgotPassword),
  requestPasswordReset
);
router.post(
  "/reset-password",
  validateRequest(authSchemas.resetPassword),
  resetPassword
);
router.post("/refresh", validateRequest(authSchemas.refresh), refreshToken);
router.post("/logout", validateRequest(authSchemas.logout), logout);
router.post("/logout-all", protect, logoutAll);

module.exports = router;
