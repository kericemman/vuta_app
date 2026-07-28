const Booking = require("../models/Booking");
const { BOOKING_STATUS } = require("../constants/bookingStatus");

const DEFAULT_SERVICE_DURATION_MINUTES = 60;
const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const parseLocalDate = (value) => {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const getDateRange = (value) => {
  const start = parseLocalDate(value);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  return { end, start };
};

const getDayName = (value) => dayNames[parseLocalDate(value).getDay()];

const timeToMinutes = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
};

const normalizeDuration = (duration) =>
  Number.isFinite(Number(duration)) && Number(duration) > 0
    ? Number(duration)
    : DEFAULT_SERVICE_DURATION_MINUTES;

const rangesOverlap = (startA, endA, startB, endB) =>
  startA < endB && endA > startB;

const isEmployeeWorkingAt = ({
  bookingDate,
  bookingTime,
  duration,
  employee,
}) => {
  const availability = employee.availability || [];

  if (!availability.length) {
    return true;
  }

  const day = getDayName(bookingDate);
  const schedule = availability.find(
    (item) => item.day?.toLowerCase() === day.toLowerCase()
  );

  if (!schedule || schedule.isAvailable === false) {
    return false;
  }

  const opensAt = timeToMinutes(schedule.opensAt);
  const closesAt = timeToMinutes(schedule.closesAt);
  const startsAt = timeToMinutes(bookingTime);

  if (opensAt === null || closesAt === null || startsAt === null) {
    return false;
  }

  const endsAt = startsAt + normalizeDuration(duration);

  return startsAt >= opensAt && endsAt <= closesAt;
};

const hasEmployeeBookingConflict = async ({
  bookingDate,
  bookingTime,
  duration,
  employeeId,
  excludeBookingId,
}) => {
  const startsAt = timeToMinutes(bookingTime);

  if (startsAt === null) {
    return true;
  }

  const endsAt = startsAt + normalizeDuration(duration);
  const { end, start } = getDateRange(bookingDate);
  const filter = {
    bookingDate: {
      $gte: start,
      $lt: end,
    },
    employee: employeeId,
    status: {
      $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED],
    },
  };

  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }

  const bookings = await Booking.find(filter).populate("service", "duration");

  return bookings.some((booking) => {
    const existingStart = timeToMinutes(booking.bookingTime);

    if (existingStart === null) {
      return true;
    }

    const existingEnd =
      existingStart + normalizeDuration(booking.service?.duration);

    return rangesOverlap(startsAt, endsAt, existingStart, existingEnd);
  });
};

const isEmployeeAvailableForBooking = async ({
  bookingDate,
  bookingTime,
  duration,
  employee,
  excludeBookingId,
}) => {
  if (
    !isEmployeeWorkingAt({
      bookingDate,
      bookingTime,
      duration,
      employee,
    })
  ) {
    return false;
  }

  return !(await hasEmployeeBookingConflict({
    bookingDate,
    bookingTime,
    duration,
    employeeId: employee._id,
    excludeBookingId,
  }));
};

module.exports = {
  DEFAULT_SERVICE_DURATION_MINUTES,
  getDateRange,
  isEmployeeAvailableForBooking,
  isEmployeeWorkingAt,
  normalizeDuration,
  timeToMinutes,
};
