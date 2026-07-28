const ApiError = require("../utils/ApiError");
const Booking = require("../models/Booking");
const BusinessEmployee = require("../models/BusinessEmployee");
const ProviderProfile = require("../models/ProviderProfile");
const Service = require("../models/Service");
const asyncHandler = require("../utils/asyncHandler");
const { buildPagination, getPagination } = require("../utils/pagination");
const pick = require("../utils/pick");
const { BOOKING_STATUS } = require("../constants/bookingStatus");
const { EMPLOYEE_STATUS } = require("../constants/businessEmployees");
const { PROVIDER_ROLES, ROLES } = require("../constants/roles");
const { RESCHEDULE_STATUS } = require("../constants/rescheduleStatus");
const { SERVICE_MODES } = require("../constants/serviceModes");
const { isEmployeeAvailableForBooking } = require("../utils/employeeAvailability");
const { createNotification } = require("../utils/notifications");
const { requireProviderProfileForUser } = require("../utils/providerAccess");

const populateBooking = (query) =>
  query
    .populate("client", "name phone profileImage")
    .populate({
      path: "provider",
      select: "businessName user country city area serviceMode",
      populate: {
        path: "user",
        select: "name phone profileImage",
      },
    })
    .populate(
      "employee",
      "name jobTitle specializations profileImage status isBookable"
    )
    .populate("service", "name category price currency duration");

const providerSupportsServiceMode = (providerMode, requestedMode) => {
  if (requestedMode === SERVICE_MODES.BOTH) {
    return false;
  }

  return providerMode === SERVICE_MODES.BOTH || providerMode === requestedMode;
};

const getProviderUserId = (booking) => {
  const providerUser = booking.provider?.user;

  return providerUser?._id || providerUser;
};

const notifyBookingCreated = async ({ booking, client, service }) => {
  const employeeName = booking.employee?.name
    ? ` with ${booking.employee.name}`
    : "";

  await createNotification({
    body: `${client.name} requested ${service.name}${employeeName}.`,
    metadata: {
      bookingId: booking._id,
      serviceId: service._id,
    },
    title: "New booking request",
    type: "booking",
    user: getProviderUserId(booking),
  });
};

const getAvailableEmployeeForService = async ({
  bookingDate,
  bookingTime,
  duration,
  employeeId,
  excludeBookingId,
  providerId,
  serviceId,
}) => {
  const filter = {
    business: providerId,
    isBookable: true,
    services: serviceId,
    status: EMPLOYEE_STATUS.ACTIVE,
  };

  if (employeeId) {
    filter._id = employeeId;
  }

  const employees = await BusinessEmployee.find(filter).sort({
    sortOrder: 1,
    name: 1,
  });

  if (employeeId && !employees.length) {
    throw new ApiError(
      400,
      "Selected employee is not available for this service."
    );
  }

  for (const employee of employees) {
    const isAvailable = await isEmployeeAvailableForBooking({
      bookingDate,
      bookingTime,
      duration,
      employee,
      excludeBookingId,
    });

    if (isAvailable) {
      return employee;
    }
  }

  if (employeeId) {
    throw new ApiError(409, "Selected employee is already booked at this time.");
  }

  if (employees.length) {
    throw new ApiError(409, "No specialist is available at this time.");
  }

  return null;
};

const notifyBookingStatusChanged = async ({ booking, status }) => {
  const serviceName = booking.service?.name || "your service";

  if (status === BOOKING_STATUS.CANCELLED) {
    await createNotification({
      body: `${booking.client?.name || "A client"} cancelled ${serviceName}.`,
      metadata: {
        bookingId: booking._id,
        status,
      },
      title: "Booking cancelled",
      type: "booking",
      user: getProviderUserId(booking),
    });
    return;
  }

  await createNotification({
    body: `Your ${serviceName} booking is now ${status}.`,
    metadata: {
      bookingId: booking._id,
      status,
    },
    title: "Booking update",
    type: "booking",
    user: booking.client?._id || booking.client,
  });
};

const notifyBookingEmployeeAssigned = async ({ booking }) => {
  const employeeName = booking.employee?.name;

  if (!employeeName) {
    return;
  }

  await createNotification({
    body: `${employeeName} will handle your ${
      booking.service?.name || "service"
    } booking.`,
    metadata: {
      bookingId: booking._id,
      employeeId: booking.employee?._id,
      serviceId: booking.service?._id,
    },
    title: "Specialist assigned",
    type: "booking",
    user: booking.client?._id || booking.client,
  });
};

const notifyRescheduleRequested = async ({ booking }) => {
  const requestedDate = booking.rescheduleRequest?.requestedDate
    ? new Date(booking.rescheduleRequest.requestedDate).toISOString().slice(0, 10)
    : "a new date";

  await createNotification({
    body: `${booking.client?.name || "A client"} requested ${
      requestedDate
    } at ${booking.rescheduleRequest?.requestedTime || "a new time"}.`,
    metadata: {
      bookingId: booking._id,
      requestedDate: booking.rescheduleRequest?.requestedDate,
      requestedTime: booking.rescheduleRequest?.requestedTime,
    },
    title: "Reschedule requested",
    type: "booking",
    user: getProviderUserId(booking),
  });
};

const notifyRescheduleResponded = async ({ booking, status }) => {
  const accepted = status === RESCHEDULE_STATUS.ACCEPTED;

  await createNotification({
    body: accepted
      ? `Your ${booking.service?.name || "service"} booking was moved to ${
          booking.bookingTime
        }.`
      : `Your reschedule request for ${
          booking.service?.name || "your booking"
        } was declined.`,
    metadata: {
      bookingId: booking._id,
      rescheduleStatus: status,
    },
    title: accepted ? "Booking rescheduled" : "Reschedule declined",
    type: "booking",
    user: booking.client?._id || booking.client,
  });
};

const isActiveBookingStatus = (status) =>
  [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED].includes(status);

const getRequestDate = (booking) =>
  booking.rescheduleRequest?.requestedDate || booking.bookingDate;

const getRequestTime = (booking) =>
  booking.rescheduleRequest?.requestedTime || booking.bookingTime;

const getEmployeeForReschedule = async ({ booking, provider }) => {
  if (provider.accountType !== "business") {
    return null;
  }

  const serviceId = booking.service?._id || booking.service;
  const existingEmployeeId = booking.employee?._id || booking.employee;
  const baseOptions = {
    bookingDate: getRequestDate(booking),
    bookingTime: getRequestTime(booking),
    duration: booking.service?.duration,
    excludeBookingId: booking._id,
    providerId: provider._id,
    serviceId,
  };

  if (!existingEmployeeId) {
    return getAvailableEmployeeForService(baseOptions);
  }

  try {
    return await getAvailableEmployeeForService({
      ...baseOptions,
      employeeId: existingEmployeeId,
    });
  } catch (error) {
    if (![400, 409].includes(error.statusCode)) {
      throw error;
    }

    return getAvailableEmployeeForService(baseOptions);
  }
};

const createBooking = asyncHandler(async (req, res) => {
  const values = pick(req.body, [
    "providerId",
    "serviceId",
    "employeeId",
    "bookingDate",
    "bookingTime",
    "serviceMode",
    "address",
    "notes",
  ]);

  if (
    !values.providerId ||
    !values.serviceId ||
    !values.bookingDate ||
    !values.bookingTime ||
    !values.serviceMode
  ) {
    throw new ApiError(
      400,
      "Provider, service, date, time, and service mode are required."
    );
  }

  const provider = await ProviderProfile.findById(values.providerId);

  if (!provider || !provider.isActive || provider.verificationStatus !== "approved") {
    throw new ApiError(404, "Provider not found.");
  }

  if (provider.user.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot book your own provider profile.");
  }

  if (!providerSupportsServiceMode(provider.serviceMode, values.serviceMode)) {
    throw new ApiError(400, "This provider does not support that service mode.");
  }

  if (values.serviceMode === SERVICE_MODES.HOME_SERVICE && !values.address) {
    throw new ApiError(400, "Address is required for home service bookings.");
  }

  const service = await Service.findOne({
    _id: values.serviceId,
    provider: provider._id,
    isActive: true,
  });

  if (!service) {
    throw new ApiError(404, "Service not found.");
  }

  const employee = await getAvailableEmployeeForService({
    bookingDate: values.bookingDate,
    bookingTime: values.bookingTime,
    duration: service.duration,
    employeeId: values.employeeId,
    providerId: provider._id,
    serviceId: service._id,
  });

  let booking = await Booking.create({
    client: req.user._id,
    employee: employee?._id,
    provider: provider._id,
    service: service._id,
    bookingDate: values.bookingDate,
    bookingTime: values.bookingTime,
    serviceMode: values.serviceMode,
    address: values.address,
    notes: values.notes,
    price: service.price,
    currency: service.currency,
  });

  booking = await populateBooking(Booking.findById(booking._id));
  await notifyBookingCreated({ booking, client: req.user, service });

  res.status(201).json({
    success: true,
    data: booking,
  });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.user.role === ROLES.CLIENT) {
    filter.client = req.user._id;
  }

  if (PROVIDER_ROLES.includes(req.user.role)) {
    const provider = await requireProviderProfileForUser(req.user._id);
    filter.provider = provider._id;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [bookings, total] = await Promise.all([
    populateBooking(Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Booking.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: bookings.length,
    pagination: buildPagination({ page, limit, total }),
    data: bookings,
  });
});

const getUpcomingBookings = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const filter = {
    bookingDate: { $gte: startOfToday },
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED] },
  };

  if (req.user.role === ROLES.CLIENT) {
    filter.client = req.user._id;
  }

  if (PROVIDER_ROLES.includes(req.user.role)) {
    const provider = await requireProviderProfileForUser(req.user._id);
    filter.provider = provider._id;
  }

  const bookings = await populateBooking(
    Booking.find(filter)
      .sort({ bookingDate: 1, bookingTime: 1, createdAt: 1 })
      .limit(limit)
  );

  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await populateBooking(Booking.findById(req.params.id));

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  const isClient = booking.client._id.toString() === req.user._id.toString();
  let isProvider = false;

  if (PROVIDER_ROLES.includes(req.user.role)) {
    const provider = await requireProviderProfileForUser(req.user._id);
    isProvider = booking.provider._id.toString() === provider._id.toString();
  }

  if (!isClient && !isProvider && req.user.role !== ROLES.ADMIN) {
    throw new ApiError(403, "You do not have permission to view this booking.");
  }

  res.json({
    success: true,
    data: booking,
  });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!Object.values(BOOKING_STATUS).includes(status)) {
    throw new ApiError(400, "Invalid booking status.");
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  const isClient = booking.client.toString() === req.user._id.toString();
  let isProvider = false;

  if (PROVIDER_ROLES.includes(req.user.role)) {
    const provider = await requireProviderProfileForUser(req.user._id);
    isProvider = booking.provider.toString() === provider._id.toString();
  }

  if (isClient && status !== BOOKING_STATUS.CANCELLED) {
    throw new ApiError(403, "Clients can only cancel bookings.");
  }

  if (
    isProvider &&
    ![
      BOOKING_STATUS.ACCEPTED,
      BOOKING_STATUS.DECLINED,
      BOOKING_STATUS.COMPLETED,
    ].includes(status)
  ) {
    throw new ApiError(403, "Providers can only accept, decline, or complete bookings.");
  }

  if (!isClient && !isProvider && req.user.role !== ROLES.ADMIN) {
    throw new ApiError(403, "You do not have permission to update this booking.");
  }

  if (
    [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.DECLINED].includes(status) &&
    booking.status !== BOOKING_STATUS.PENDING
  ) {
    throw new ApiError(400, "Only pending bookings can be accepted or declined.");
  }

  if (
    status === BOOKING_STATUS.COMPLETED &&
    booking.status !== BOOKING_STATUS.ACCEPTED
  ) {
    throw new ApiError(400, "Only accepted bookings can be completed.");
  }

  booking.status = status;
  await booking.save();

  const populatedBooking = await populateBooking(Booking.findById(booking._id));
  await notifyBookingStatusChanged({ booking: populatedBooking, status });

  res.json({
    success: true,
    data: populatedBooking,
  });
});

const requestBookingReschedule = asyncHandler(async (req, res) => {
  const { bookingDate, bookingTime, reason } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  if (booking.client.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only reschedule your own bookings.");
  }

  if (!isActiveBookingStatus(booking.status)) {
    throw new ApiError(
      400,
      "Only pending or accepted bookings can be rescheduled."
    );
  }

  if (booking.rescheduleRequest?.status === RESCHEDULE_STATUS.PENDING) {
    throw new ApiError(400, "A reschedule request is already pending.");
  }

  if (
    booking.bookingTime === bookingTime &&
    new Date(booking.bookingDate).toISOString().slice(0, 10) === bookingDate
  ) {
    throw new ApiError(400, "Choose a different date or time.");
  }

  const now = new Date();
  booking.rescheduleRequest = {
    requestedBy: req.user._id,
    requestedDate: bookingDate,
    requestedTime: bookingTime,
    reason,
    status: RESCHEDULE_STATUS.PENDING,
    createdAt: now,
    updatedAt: now,
  };

  await booking.save();

  const populatedBooking = await populateBooking(Booking.findById(booking._id));
  await notifyRescheduleRequested({ booking: populatedBooking });

  res.json({
    success: true,
    data: populatedBooking,
  });
});

const respondBookingReschedule = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const provider = await requireProviderProfileForUser(req.user._id);
  const booking = await Booking.findById(req.params.id).populate(
    "service",
    "name duration"
  );

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  if (booking.provider.toString() !== provider._id.toString()) {
    throw new ApiError(403, "You do not have permission to update this booking.");
  }

  if (booking.rescheduleRequest?.status !== RESCHEDULE_STATUS.PENDING) {
    throw new ApiError(400, "There is no pending reschedule request.");
  }

  if (!isActiveBookingStatus(booking.status)) {
    throw new ApiError(
      400,
      "Only pending or accepted bookings can be rescheduled."
    );
  }

  const now = new Date();
  booking.rescheduleRequest.status = status;
  booking.rescheduleRequest.respondedAt = now;
  booking.rescheduleRequest.respondedBy = req.user._id;
  booking.rescheduleRequest.updatedAt = now;

  if (status === RESCHEDULE_STATUS.ACCEPTED) {
    const employee = await getEmployeeForReschedule({ booking, provider });

    booking.bookingDate = booking.rescheduleRequest.requestedDate;
    booking.bookingTime = booking.rescheduleRequest.requestedTime;

    if (employee) {
      booking.employee = employee._id;
    }
  }

  await booking.save();

  const populatedBooking = await populateBooking(Booking.findById(booking._id));
  await notifyRescheduleResponded({ booking: populatedBooking, status });

  res.json({
    success: true,
    data: populatedBooking,
  });
});

const assignBookingEmployee = asyncHandler(async (req, res) => {
  const provider = await requireProviderProfileForUser(req.user._id);

  if (provider.accountType !== "business") {
    throw new ApiError(403, "Only business profiles can assign specialists.");
  }

  const booking = await Booking.findById(req.params.id).populate(
    "service",
    "name duration"
  );

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  if (booking.provider.toString() !== provider._id.toString()) {
    throw new ApiError(403, "You do not have permission to update this booking.");
  }

  if (
    ![BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED].includes(booking.status)
  ) {
    throw new ApiError(
      400,
      "Only pending or accepted bookings can be reassigned."
    );
  }

  const serviceId = booking.service?._id || booking.service;
  const employee = await getAvailableEmployeeForService({
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    duration: booking.service?.duration,
    employeeId: req.body.employeeId || undefined,
    excludeBookingId: booking._id,
    providerId: provider._id,
    serviceId,
  });

  if (!employee) {
    throw new ApiError(409, "No specialist is available at this time.");
  }

  booking.employee = employee._id;
  await booking.save();

  const populatedBooking = await populateBooking(Booking.findById(booking._id));
  await notifyBookingEmployeeAssigned({ booking: populatedBooking });

  res.json({
    success: true,
    data: populatedBooking,
  });
});

module.exports = {
  assignBookingEmployee,
  createBooking,
  getMyBookings,
  getUpcomingBookings,
  getBookingById,
  requestBookingReschedule,
  respondBookingReschedule,
  updateBookingStatus,
};
