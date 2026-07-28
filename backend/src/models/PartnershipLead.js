const mongoose = require("mongoose");
const {
  PARTNERSHIP_STATUSES,
  PARTNERSHIP_TYPES,
} = require("../constants/partnerships");

const partnershipLeadSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    partnershipType: {
      type: String,
      enum: PARTNERSHIP_TYPES,
      required: true,
    },
    audience: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: PARTNERSHIP_STATUSES,
      default: "new",
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

partnershipLeadSchema.index({ createdAt: -1 });
partnershipLeadSchema.index({ status: 1, createdAt: -1 });
partnershipLeadSchema.index({ email: 1 });
partnershipLeadSchema.index({ partnershipType: 1 });

module.exports = mongoose.model("PartnershipLead", partnershipLeadSchema);
