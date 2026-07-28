const mongoose = require("mongoose");
const { PUBLIC_SIGNUP_ROLES } = require("../constants/roles");
const { FEEDBACK_STATUSES, FEEDBACK_TOPICS } = require("../constants/feedback");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: PUBLIC_SIGNUP_ROLES,
      required: true,
    },
    topic: {
      type: String,
      enum: FEEDBACK_TOPICS,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    contactConsent: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: FEEDBACK_STATUSES,
      default: "new",
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ role: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ topic: 1, createdAt: -1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
