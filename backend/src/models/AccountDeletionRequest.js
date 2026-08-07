const mongoose = require("mongoose");
const { PUBLIC_SIGNUP_ROLES } = require("../constants/roles");
const legalConsentSchema = require("./legalConsentSchema");

const accountDeletionRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
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
    reason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["new", "reviewing", "completed", "rejected"],
      default: "new",
      required: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    legalConsent: {
      type: legalConsentSchema,
      required: true,
    },
  },
  { timestamps: true }
);

accountDeletionRequestSchema.index({ createdAt: -1 });
accountDeletionRequestSchema.index({ email: 1, createdAt: -1 });
accountDeletionRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model(
  "AccountDeletionRequest",
  accountDeletionRequestSchema
);
