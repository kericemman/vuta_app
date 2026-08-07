const mongoose = require("mongoose");
const { PUBLIC_SIGNUP_ROLES } = require("../constants/roles");
const { FEEDBACK_STATUSES, FEEDBACK_TOPICS } = require("../constants/feedback");
const legalConsentSchema = require("./legalConsentSchema");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    source: {
      type: String,
      enum: ["app", "website_contact", "website_feedback"],
      default: "app",
      required: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
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
    legalConsent: {
      type: legalConsentSchema,
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ role: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ topic: 1, createdAt: -1 });
feedbackSchema.index({ source: 1, createdAt: -1 });
feedbackSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
