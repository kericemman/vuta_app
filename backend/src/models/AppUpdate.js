const mongoose = require("mongoose");
const {
  APP_UPDATE_AUDIENCES,
  APP_UPDATE_MEDIA_TYPES,
  APP_UPDATE_STATUSES,
} = require("../constants/appUpdates");

const mediaItemSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    publicId: {
      type: String,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(APP_UPDATE_MEDIA_TYPES),
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const appUpdateSchema = new mongoose.Schema(
  {
    audiences: [
      {
        type: String,
        enum: Object.values(APP_UPDATE_AUDIENCES),
        required: true,
      },
    ],
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 15000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: {
      type: [mediaItemSchema],
      default: [],
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(APP_UPDATE_STATUSES),
      default: APP_UPDATE_STATUSES.DRAFT,
      index: true,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 280,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

appUpdateSchema.index({ audiences: 1, status: 1, publishedAt: -1 });
appUpdateSchema.index({ status: 1, publishedAt: -1 });
appUpdateSchema.index({ title: "text", summary: "text", body: "text" });

module.exports = mongoose.model("AppUpdate", appUpdateSchema);
