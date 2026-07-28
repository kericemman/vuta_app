const mongoose = require("mongoose");

const appUpdateReadSchema = new mongoose.Schema(
  {
    readAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    update: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUpdate",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

appUpdateReadSchema.index({ user: 1, update: 1 }, { unique: true });
appUpdateReadSchema.index({ update: 1 });
appUpdateReadSchema.index({ user: 1, readAt: -1 });

module.exports = mongoose.model("AppUpdateRead", appUpdateReadSchema);
