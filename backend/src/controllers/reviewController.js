const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const Booking = require("../models/Booking");
const ProviderProfile = require("../models/ProviderProfile");
const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");
const { buildPagination, getPagination } = require("../utils/pagination");
const { BOOKING_STATUS } = require("../constants/bookingStatus");
const { ROLES } = require("../constants/roles");
const { createNotification } = require("../utils/notifications");

const updateProviderRating = async (providerId) => {
  const [stats] = await Review.aggregate([
    {
      $match: {
        provider: new mongoose.Types.ObjectId(providerId),
      },
    },
    {
      $group: {
        _id: "$provider",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  await ProviderProfile.findByIdAndUpdate(providerId, {
    averageRating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
    reviewCount: stats ? stats.reviewCount : 0,
  });
};

const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) {
    throw new ApiError(400, "Booking and rating are required.");
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  if (booking.client.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only review your own bookings.");
  }

  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    throw new ApiError(400, "Only completed bookings can be reviewed.");
  }

  const existingReview = await Review.findOne({ booking: booking._id });

  if (existingReview) {
    throw new ApiError(409, "This booking has already been reviewed.");
  }

  const review = await Review.create({
    booking: booking._id,
    client: req.user._id,
    provider: booking.provider,
    rating,
    comment,
  });

  await updateProviderRating(booking.provider);

  const provider = await ProviderProfile.findById(booking.provider).select(
    "user"
  );

  await createNotification({
    body: `${req.user.name || "A client"} rated a completed booking ${rating}/5.`,
    metadata: {
      bookingId: booking._id,
      rating,
      reviewId: review._id,
    },
    title: "New client review",
    type: "booking",
    user: provider?.user,
  });

  res.status(201).json({
    success: true,
    data: review,
  });
});

const getBookingReview = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  const isClient = booking.client.toString() === req.user._id.toString();
  const provider = await ProviderProfile.findOne({
    _id: booking.provider,
    user: req.user._id,
  });

  if (!isClient && !provider && req.user.role !== ROLES.ADMIN) {
    throw new ApiError(403, "You do not have permission to view this review.");
  }

  const review = await Review.findOne({ booking: booking._id }).populate(
    "client",
    "name profileImage"
  );

  res.json({
    success: true,
    data: review,
  });
});

const getProviderReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { provider: req.params.providerId };
  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("client", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: reviews.length,
    pagination: buildPagination({ page, limit, total }),
    data: reviews,
  });
});

module.exports = {
  createReview,
  getBookingReview,
  getProviderReviews,
};
