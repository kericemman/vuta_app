const mongoose = require("mongoose");
const { AD_PLACEMENTS } = require("../constants/adPlacements");

const adCardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 240,
    },
    ctaText: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    ctaUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imagePublicId: {
      type: String,
      required: true,
      trim: true,
    },
    placements: {
      type: [
        {
          type: String,
          enum: Object.values(AD_PLACEMENTS),
        },
      ],
      default: [AD_PLACEMENTS.CLIENT_HOME],
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

adCardSchema.index({ isActive: 1, placements: 1, sortOrder: 1, createdAt: -1 });

module.exports = mongoose.model("AdCard", adCardSchema);
