const express = require("express");
const {
  getUnreadNotificationCount,
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushToken,
  revokePushToken,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { notificationSchemas } = require("../validators/schemas");

const router = express.Router();

router.use(protect);

router.get("/", validateRequest(notificationSchemas.list), listMyNotifications);
router.get("/unread-count", getUnreadNotificationCount);
router.post(
  "/push-tokens",
  validateRequest(notificationSchemas.registerPushToken),
  registerPushToken
);
router.delete(
  "/push-tokens",
  validateRequest(notificationSchemas.revokePushToken),
  revokePushToken
);
router.patch("/read-all", markAllNotificationsRead);
router.patch(
  "/:id/read",
  validateRequest(notificationSchemas.byId),
  markNotificationRead
);

module.exports = router;
