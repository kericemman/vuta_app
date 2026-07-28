const mongoose = require("mongoose");

const legalDocumentConsentSchema = new mongoose.Schema(
  {
    accepted: {
      type: Boolean,
      default: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const legalConsentSchema = new mongoose.Schema(
  {
    accepted: {
      type: Boolean,
      default: true,
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      default: "public_website",
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    documents: {
      privacyPolicy: {
        type: legalDocumentConsentSchema,
        required: true,
      },
      termsAndConditions: {
        type: legalDocumentConsentSchema,
        required: true,
      },
      userAgreement: {
        type: legalDocumentConsentSchema,
        required: true,
      },
    },
  },
  { _id: false }
);

module.exports = legalConsentSchema;
