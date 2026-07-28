const mongoose = require("mongoose");

const PLATFORMS = ["android", "ios", "unknown", "web"];

const pushTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: PLATFORMS,
      default: "unknown",
    },
    deviceId: {
      type: String,
      trim: true,
    },
    appVersion: {
      type: String,
      trim: true,
    },
    appOwnership: {
      type: String,
      trim: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

pushTokenSchema.index({ user: 1, isActive: 1, lastSeenAt: -1 });

module.exports = mongoose.model("PushToken", pushTokenSchema);
