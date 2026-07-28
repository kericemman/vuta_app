const Notification = require("../models/Notification");
const { sendPushNotificationToUser } = require("./pushNotifications");
const { EVENTS, emitToUser } = require("../realtime/socket");

const serializeNotification = (notification) => ({
  id: notification._id.toString(),
  title: notification.title,
  body: notification.body,
  type: notification.type,
  metadata: notification.metadata || {},
  readAt: notification.readAt,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

const createNotification = async ({
  body,
  metadata = {},
  title,
  type = "system",
  user,
}) => {
  if (!user || !title) {
    return null;
  }

  try {
    const notification = await Notification.create({
      body,
      metadata,
      title,
      type,
      user,
    });

    emitToUser(user, EVENTS.NOTIFICATION_CREATED, {
      notification: serializeNotification(notification),
    });

    sendPushNotificationToUser({
      body,
      data: {
        metadata,
        notificationId: notification._id,
        type,
      },
      title,
      user,
    }).catch((error) => {
      console.warn("Push notification failed:", error.message);
    });

    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};
