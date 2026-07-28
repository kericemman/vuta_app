const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Service name is required."],
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      required: [true, "Service category is required."],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 600,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    imagePublicId: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Service price is required."],
      min: 0,
    },
    currency: {
      type: String,
      default: "KES",
      uppercase: true,
      trim: true,
    },
    duration: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

serviceSchema.index({ provider: 1, isActive: 1 });
serviceSchema.index({ category: 1, price: 1 });
serviceSchema.index({ isActive: 1, category: 1, price: 1 });

module.exports = mongoose.model("Service", serviceSchema);
