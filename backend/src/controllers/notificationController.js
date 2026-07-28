const ApiError = require("../utils/ApiError");
const Notification = require("../models/Notification");
const PushToken = require("../models/PushToken");
const asyncHandler = require("../utils/asyncHandler");
const pick = require("../utils/pick");
const { buildPagination, getPagination } = require("../utils/pagination");
const { isExpoPushToken } = require("../utils/pushNotifications");

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

const listMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { user: req.user._id };

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: notifications.length,
    pagination: buildPagination({ page, limit, total }),
    data: notifications.map(serializeNotification),
  });
});

const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    readAt: null,
  });

  res.json({
    success: true,
    data: {
      unreadCount,
    },
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found.");
  }

  if (!notification.readAt) {
    notification.readAt = new Date();
    await notification.save();
  }

  res.json({
    success: true,
    data: serializeNotification(notification),
  });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    {
      user: req.user._id,
      readAt: null,
    },
    {
      readAt: new Date(),
    }
  );

  res.json({
    success: true,
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
});

const registerPushToken = asyncHandler(async (req, res) => {
  const values = pick(req.body, [
    "appOwnership",
    "appVersion",
    "deviceId",
    "platform",
    "token",
  ]);

  if (!isExpoPushToken(values.token)) {
    throw new ApiError(400, "Invalid Expo push token.");
  }

  const pushToken = await PushToken.findOneAndUpdate(
    { token: values.token },
    {
      $set: {
        ...values,
        isActive: true,
        lastSeenAt: new Date(),
        revokedAt: null,
        user: req.user._id,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    }
  );

  res.status(201).json({
    success: true,
    data: {
      id: pushToken._id,
      platform: pushToken.platform,
      registeredAt: pushToken.lastSeenAt,
    },
  });
});

const revokePushToken = asyncHandler(async (req, res) => {
  const result = await PushToken.updateOne(
    {
      token: req.body.token,
      user: req.user._id,
    },
    {
      $set: {
        isActive: false,
        revokedAt: new Date(),
      },
    }
  );

  res.json({
    success: true,
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
});

module.exports = {
  getUnreadNotificationCount,
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushToken,
  revokePushToken,
};
