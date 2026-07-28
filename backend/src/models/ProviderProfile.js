const mongoose = require("mongoose");
const { SERVICE_MODES } = require("../constants/serviceModes");

const portfolioImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 120,
    },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      trim: true,
    },
    opensAt: {
      type: String,
      trim: true,
    },
    closesAt: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const businessNameChangeRequestSchema = new mongoose.Schema(
  {
    requestedName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 800,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    decisionNote: {
      type: String,
      trim: true,
      maxlength: 800,
    },
  },
  { _id: false }
);

const isValidPointCoordinates = (coordinates) =>
  Array.isArray(coordinates) &&
  coordinates.length === 2 &&
  coordinates.every((value) => Number.isFinite(value));

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: isValidPointCoordinates,
        message: "Coordinates must contain longitude and latitude.",
      },
    },
  },
  { _id: false }
);

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    accountType: {
      type: String,
      enum: ["individual", "business"],
      required: true,
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    businessNameChangeRequest: {
      type: businessNameChangeRequestSchema,
      default: undefined,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 800,
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    country: {
      type: String,
      required: [true, "Country is required."],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required."],
      trim: true,
    },
    area: {
      type: String,
      required: [true, "Area is required."],
      trim: true,
    },
    coordinates: {
      type: pointSchema,
      default: undefined,
    },
    serviceMode: {
      type: String,
      enum: Object.values(SERVICE_MODES),
      default: SERVICE_MODES.BOTH,
    },
    portfolio: {
      type: [portfolioImageSchema],
      validate: {
        validator: (items) => items.length <= 8,
        message: "Portfolio can contain a maximum of 8 images.",
      },
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    availability: {
      type: [availabilitySchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

providerProfileSchema.index({ coordinates: "2dsphere" });
providerProfileSchema.index({ country: 1, city: 1, area: 1 });
providerProfileSchema.index({ categories: 1 });
providerProfileSchema.index({
  isActive: 1,
  verificationStatus: 1,
  country: 1,
  city: 1,
});
providerProfileSchema.index({
  isActive: 1,
  verificationStatus: 1,
  averageRating: -1,
  reviewCount: -1,
});

module.exports = mongoose.model("ProviderProfile", providerProfileSchema);
