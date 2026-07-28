const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const BusinessEmployee = require("../models/BusinessEmployee");
const Favourite = require("../models/Favourite");
const Service = require("../models/Service");
const asyncHandler = require("../utils/asyncHandler");
const { BOOKING_STATUS } = require("../constants/bookingStatus");
const { EMPLOYEE_STATUS } = require("../constants/businessEmployees");
const { requireBusinessProfileForUser } = require("../utils/providerAccess");

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, days) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const startOfWeek = (date) => {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  return addDays(startOfDay(date), mondayOffset);
};

const startOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const sumRevenue = async (providerId, dateFilter = {}) => {
  const [result] = await Booking.aggregate([
    {
      $match: {
        provider: providerId,
        status: BOOKING_STATUS.COMPLETED,
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$price" },
      },
    },
  ]);

  return result?.revenue || 0;
};

const getBookingStatusBreakdown = async (providerId) => {
  const rows = await Booking.aggregate([
    { $match: { provider: providerId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  return Object.values(BOOKING_STATUS).reduce((breakdown, status) => {
    const row = rows.find((item) => item._id === status);
    breakdown[status] = row?.count || 0;
    return breakdown;
  }, {});
};

const getTopServices = async (providerId) =>
  Booking.aggregate([
    {
      $match: {
        provider: providerId,
        status: BOOKING_STATUS.COMPLETED,
      },
    },
    {
      $group: {
        _id: "$service",
        bookings: { $sum: 1 },
        revenue: { $sum: "$price" },
      },
    },
    { $sort: { bookings: -1, revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        as: "service",
        foreignField: "_id",
        from: "services",
        localField: "_id",
      },
    },
    { $unwind: "$service" },
    {
      $project: {
        _id: 0,
        bookings: 1,
        category: "$service.category",
        name: "$service.name",
        revenue: 1,
        serviceId: "$service._id",
      },
    },
  ]);

const getBusinessStats = asyncHandler(async (req, res) => {
  const business = await requireBusinessProfileForUser(req.user._id);
  const providerId = new mongoose.Types.ObjectId(business._id);
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const todayFilter = {
    bookingDate: {
      $gte: todayStart,
      $lt: tomorrowStart,
    },
  };

  const [
    bookingStatusBreakdown,
    topServices,
    activeEmployees,
    activeServices,
    bookableEmployees,
    savedByClients,
    todayBookings,
    totalEmployees,
    totalServices,
    upcomingBookings,
    monthRevenue,
    todayRevenue,
    totalRevenue,
    weekRevenue,
  ] = await Promise.all([
    getBookingStatusBreakdown(providerId),
    getTopServices(providerId),
    BusinessEmployee.countDocuments({
      business: providerId,
      status: { $ne: EMPLOYEE_STATUS.INACTIVE },
    }),
    Service.countDocuments({
      provider: providerId,
      isActive: true,
    }),
    BusinessEmployee.countDocuments({
      business: providerId,
      isBookable: true,
      status: { $ne: EMPLOYEE_STATUS.INACTIVE },
    }),
    Favourite.countDocuments({ provider: providerId }),
    Booking.countDocuments({
      provider: providerId,
      ...todayFilter,
    }),
    BusinessEmployee.countDocuments({ business: providerId }),
    Service.countDocuments({ provider: providerId }),
    Booking.countDocuments({
      provider: providerId,
      bookingDate: { $gte: todayStart },
      status: {
        $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED],
      },
    }),
    sumRevenue(providerId, {
      bookingDate: { $gte: monthStart },
    }),
    sumRevenue(providerId, todayFilter),
    sumRevenue(providerId),
    sumRevenue(providerId, {
      bookingDate: { $gte: weekStart },
    }),
  ]);

  const counts = {
    activeEmployees,
    activeServices,
    bookableEmployees,
    savedByClients,
    todayBookings,
    totalEmployees,
    totalServices,
    upcomingBookings,
  };

  const revenue = {
    monthRevenue,
    todayRevenue,
    totalRevenue,
    weekRevenue,
  };

  const completedBookings =
    bookingStatusBreakdown[BOOKING_STATUS.COMPLETED] || 0;
  const averageBookingValue = completedBookings
    ? Math.round(revenue.totalRevenue / completedBookings)
    : 0;

  res.json({
    success: true,
    data: {
      averageBookingValue,
      averageRating: business.averageRating || 0,
      bookingStatusBreakdown,
      counts,
      currency: "KES",
      generatedAt: now.toISOString(),
      portfolioCount: business.portfolio?.length || 0,
      revenue,
      reviewCount: business.reviewCount || 0,
      topServices,
    },
  });
});

module.exports = {
  getBusinessStats,
};
