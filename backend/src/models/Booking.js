const mongoose = require("mongoose");
const { BOOKING_STATUS } = require("../constants/bookingStatus");
const { RESCHEDULE_STATUS } = require("../constants/rescheduleStatus");
const { SERVICE_MODES } = require("../constants/serviceModes");

const bookingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessEmployee",
    },
    bookingDate: {
      type: Date,
      required: [true, "Booking date is required."],
    },
    bookingTime: {
      type: String,
      required: [true, "Booking time is required."],
      trim: true,
    },
    serviceMode: {
      type: String,
      enum: Object.values(SERVICE_MODES),
      required: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 240,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 800,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    rescheduleRequest: {
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      requestedDate: Date,
      requestedTime: {
        type: String,
        trim: true,
      },
      reason: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      status: {
        type: String,
        enum: Object.values(RESCHEDULE_STATUS),
      },
      respondedAt: Date,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: Date,
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ client: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ client: 1, status: 1, bookingDate: -1 });
bookingSchema.index({ provider: 1, status: 1, bookingDate: -1 });
bookingSchema.index({ employee: 1, status: 1, bookingDate: -1 });
bookingSchema.index({ "rescheduleRequest.status": 1 });

module.exports = mongoose.model("Booking", bookingSchema);
