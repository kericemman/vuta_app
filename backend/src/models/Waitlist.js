const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    userType: {
      type: String,
      enum: ["client", "beauty_professional", "beauty_business"],
      required: true,
    },
    serviceOffered: {
      type: String,
      trim: true,
    },
    portfolioLink: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

waitlistSchema.index({ phone: 1 }, { unique: true });
waitlistSchema.index({ email: 1 }, { unique: true, sparse: true });
waitlistSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Waitlist", waitlistSchema);
