const { z } = require("zod");
const {
  APP_UPDATE_AUDIENCES,
  APP_UPDATE_MEDIA_TYPES,
  APP_UPDATE_STATUSES,
} = require("../constants/appUpdates");
const { BOOKING_STATUS } = require("../constants/bookingStatus");
const { AD_PLACEMENTS } = require("../constants/adPlacements");
const {
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUS,
} = require("../constants/businessEmployees");
const { FEEDBACK_STATUSES, FEEDBACK_TOPICS } = require("../constants/feedback");
const { PUBLIC_SIGNUP_ROLES } = require("../constants/roles");
const {
  PARTNERSHIP_STATUSES,
  PARTNERSHIP_TYPES,
} = require("../constants/partnerships");
const { RESCHEDULE_STATUS } = require("../constants/rescheduleStatus");
const { SERVICE_MODES } = require("../constants/serviceModes");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid identifier.");

const nonEmptyString = (message) => z.string().trim().min(1, message);

const optionalString = z
  .string()
  .trim()
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email is invalid.")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalLimitedString = (maxLength) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .or(z.literal("").transform(() => undefined));

const optionalUrl = z
  .string()
  .trim()
  .url("URL is invalid.")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalBoolean = z.preprocess((value) => {
  if (value === undefined || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (String(value).toLowerCase() === "true") return true;
  if (String(value).toLowerCase() === "false") return false;
  return value;
}, z.boolean().optional());

const requiredLegalConsent = z
  .any()
  .refine(
    (value) => value === true || String(value).toLowerCase() === "true",
    "You must accept the Terms and Conditions, Privacy Policy, and User Agreement."
  );

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const paramsWithId = z.object({
  id: objectId,
});

const providerIdParams = z.object({
  providerId: objectId,
});

const bookingIdParams = z.object({
  bookingId: objectId,
});

const conversationIdParams = z.object({
  conversationId: objectId,
});

const authSchemas = {
  register: {
    body: z.object({
      name: nonEmptyString("Name is required.").max(80),
      email: z.string().trim().toLowerCase().email("Email is invalid.").max(120),
      phone: nonEmptyString("Phone number is required.").max(30),
      password: z.string().min(8, "Password must be at least 8 characters."),
      role: z.enum(PUBLIC_SIGNUP_ROLES).default("client"),
      country: optionalString,
      city: optionalString,
      area: optionalString,
    }),
  },
  login: {
    body: z.object({
      identifier: nonEmptyString("Phone or email is required."),
      password: nonEmptyString("Password is required."),
    }),
  },
  forgotPassword: {
    body: z.object({
      identifier: nonEmptyString("Phone or email is required."),
    }),
  },
  resetPassword: {
    body: z.object({
      token: nonEmptyString("Reset token is required."),
      password: z.string().min(8, "Password must be at least 8 characters."),
    }),
  },
  refresh: {
    body: z.object({
      refreshToken: nonEmptyString("Refresh token is required."),
    }),
  },
  logout: {
    body: z.object({
      refreshToken: nonEmptyString("Refresh token is required."),
    }),
  },
};

const adCardSchemas = {
  publicList: {
    query: z.object({
      placement: z.enum(Object.values(AD_PLACEMENTS)),
    }),
  },
  adminList: {
    query: paginationQuery.extend({
      placement: z.enum(Object.values(AD_PLACEMENTS)).optional(),
      isActive: optionalBoolean,
    }),
  },
};

const appUpdateMediaItem = z.object({
  caption: optionalLimitedString(160),
  publicId: optionalString,
  thumbnailUrl: optionalUrl,
  type: z.enum(Object.values(APP_UPDATE_MEDIA_TYPES)),
  url: z.string().trim().url("Media URL is invalid."),
});

const appUpdateSchemas = {
  adminList: {
    query: paginationQuery.extend({
      audience: z.enum(Object.values(APP_UPDATE_AUDIENCES)).optional(),
      q: optionalString,
      status: z.enum(Object.values(APP_UPDATE_STATUSES)).optional(),
    }),
  },
  byId: {
    params: paramsWithId,
  },
  create: {
    body: z.object({
      audiences: z.array(z.enum(Object.values(APP_UPDATE_AUDIENCES))).min(1),
      body: nonEmptyString("Update body is required.").max(15000),
      media: z.array(appUpdateMediaItem).max(12).optional(),
      publishedAt: z.coerce.date().optional(),
      status: z.enum(Object.values(APP_UPDATE_STATUSES)).default("draft"),
      summary: optionalLimitedString(280),
      title: nonEmptyString("Update title is required.").max(120),
    }),
  },
  list: {
    query: paginationQuery,
  },
  update: {
    params: paramsWithId,
    body: z.object({
      audiences: z.array(z.enum(Object.values(APP_UPDATE_AUDIENCES))).min(1).optional(),
      body: optionalLimitedString(15000),
      media: z.array(appUpdateMediaItem).max(12).optional(),
      publishedAt: z.coerce.date().optional(),
      status: z.enum(Object.values(APP_UPDATE_STATUSES)).optional(),
      summary: optionalLimitedString(280),
      title: optionalLimitedString(120),
    }),
  },
};

const userSchemas = {
  updateMe: {
    body: z.object({
      name: optionalString,
      email: optionalEmail,
      phone: optionalString,
      country: optionalString,
      city: optionalString,
      area: optionalString,
      profileImage: optionalString,
      preferences: z
        .array(nonEmptyString("Preference cannot be empty."))
        .max(20)
        .optional(),
    }),
  },
  listUsers: {
    query: paginationQuery.extend({
      role: z.enum(["client", "beauty_professional", "beauty_business", "admin"]).optional(),
      q: optionalString,
    }),
  },
  updateStatus: {
    params: paramsWithId,
    body: z.object({
      isActive: z.boolean().optional(),
      isVerified: z.boolean().optional(),
    }),
  },
};

const portfolioImage = z.object({
  url: nonEmptyString("Image URL is required."),
  publicId: optionalString,
  caption: optionalString,
});

const availabilityItem = z.object({
  day: optionalString,
  opensAt: optionalString,
  closesAt: optionalString,
  isAvailable: z.boolean().optional(),
});

const providerSchemas = {
  list: {
    query: paginationQuery.extend({
      country: optionalString,
      city: optionalString,
      area: optionalString,
      category: optionalString,
      serviceMode: z.enum(Object.values(SERVICE_MODES)).optional(),
      minRating: z.coerce.number().min(0).max(5).optional(),
      q: optionalString,
      lat: z.coerce.number().min(-90).max(90).optional(),
      lng: z.coerce.number().min(-180).max(180).optional(),
      radiusKm: z.coerce.number().min(1).max(100).default(10),
    }),
  },
  adminList: {
    query: paginationQuery.extend({
      verificationStatus: z.enum(["pending", "approved", "rejected"]).optional(),
      isActive: optionalBoolean,
      q: optionalString,
    }),
  },
  upsertMine: {
    body: z.object({
      accountType: z.enum(["individual", "business"]).optional(),
      businessName: optionalString,
      businessNameChangeReason: optionalLimitedString(800),
      bio: optionalString,
      categories: z.array(nonEmptyString("Category cannot be empty.")).max(12).optional(),
      country: nonEmptyString("Country is required."),
      city: nonEmptyString("City is required."),
      area: nonEmptyString("Area is required."),
      latitude: z.coerce.number().min(-90).max(90).optional(),
      longitude: z.coerce.number().min(-180).max(180).optional(),
      lat: z.coerce.number().min(-90).max(90).optional(),
      lng: z.coerce.number().min(-180).max(180).optional(),
      serviceMode: z.enum(Object.values(SERVICE_MODES)).optional(),
      portfolio: z.array(portfolioImage).max(8).optional(),
      availability: z.array(availabilityItem).optional(),
      isActive: z.boolean().optional(),
    }),
  },
  getById: {
    params: paramsWithId,
  },
  listEmployees: {
    params: paramsWithId,
    query: z.object({
      bookingDate: optionalString,
      bookingTime: optionalString,
      serviceId: objectId.optional(),
    }),
  },
  updateVerification: {
    params: paramsWithId,
    body: z.object({
      verificationStatus: z.enum(["pending", "approved", "rejected"]),
    }),
  },
  reviewBusinessNameChange: {
    params: paramsWithId,
    body: z.object({
      decisionNote: optionalLimitedString(800),
      status: z.enum(["approved", "rejected"]),
    }),
  },
};

const serviceSchemas = {
  list: {
    query: paginationQuery.extend({
      area: optionalString,
      category: optionalString,
      city: optionalString,
      country: optionalString,
      lat: z.coerce.number().min(-90).max(90).optional(),
      lng: z.coerce.number().min(-180).max(180).optional(),
      providerId: objectId.optional(),
      minPrice: z.coerce.number().min(0).optional(),
      maxPrice: z.coerce.number().min(0).optional(),
      minRating: z.coerce.number().min(0).max(5).optional(),
      q: optionalString,
      radiusKm: z.coerce.number().min(1).max(100).default(25),
      serviceMode: z.enum(Object.values(SERVICE_MODES)).optional(),
    }),
  },
  adminList: {
    query: paginationQuery.extend({
      category: optionalString,
      isActive: optionalBoolean,
      q: optionalString,
    }),
  },
  mine: {
    query: paginationQuery,
  },
  create: {
    body: z.object({
      name: nonEmptyString("Service name is required.").max(120),
      category: nonEmptyString("Service category is required."),
      description: optionalString,
      imageUrl: optionalString,
      price: z.coerce.number().min(0),
      currency: z.string().trim().length(3).default("KES"),
      duration: z.coerce.number().int().min(0).optional(),
      isActive: z.boolean().optional(),
    }),
  },
  update: {
    params: paramsWithId,
    body: z.object({
      name: optionalString,
      category: optionalString,
      description: optionalString,
      imageUrl: optionalString,
      price: z.coerce.number().min(0).optional(),
      currency: z.string().trim().length(3).optional(),
      duration: z.coerce.number().int().min(0).optional(),
      isActive: z.boolean().optional(),
    }),
  },
  adminUpdateStatus: {
    params: paramsWithId,
    body: z.object({
      isActive: z.boolean(),
    }),
  },
  byId: {
    params: paramsWithId,
  },
};

const businessEmployeeSchemas = {
  listMine: {
    query: paginationQuery.extend({
      status: z.enum(Object.values(EMPLOYEE_STATUS)).optional(),
      specialization: optionalString,
      isBookable: optionalBoolean,
      q: optionalString,
    }),
  },
  create: {
    body: z.object({
      name: nonEmptyString("Employee name is required.").max(80),
      role: z.enum(Object.values(EMPLOYEE_ROLES)).optional(),
      jobTitle: optionalLimitedString(80),
      specializations: z
        .array(nonEmptyString("Specialization cannot be empty.").max(80))
        .max(12)
        .optional(),
      services: z.array(objectId).max(80).optional(),
      bio: optionalLimitedString(500),
      phone: optionalLimitedString(30),
      email: optionalEmail,
      profileImage: optionalString,
      profileImagePublicId: optionalString,
      availability: z.array(availabilityItem).optional(),
      status: z.enum(Object.values(EMPLOYEE_STATUS)).optional(),
      isBookable: z.boolean().optional(),
      sortOrder: z.coerce.number().int().min(0).optional(),
    }),
  },
  update: {
    params: paramsWithId,
    body: z.object({
      name: optionalLimitedString(80),
      role: z.enum(Object.values(EMPLOYEE_ROLES)).optional(),
      jobTitle: optionalLimitedString(80),
      specializations: z
        .array(nonEmptyString("Specialization cannot be empty.").max(80))
        .max(12)
        .optional(),
      services: z.array(objectId).max(80).optional(),
      bio: optionalLimitedString(500),
      phone: optionalLimitedString(30),
      email: optionalEmail,
      profileImage: optionalString,
      profileImagePublicId: optionalString,
      availability: z.array(availabilityItem).optional(),
      status: z.enum(Object.values(EMPLOYEE_STATUS)).optional(),
      isBookable: z.boolean().optional(),
      sortOrder: z.coerce.number().int().min(0).optional(),
    }),
  },
  byId: {
    params: paramsWithId,
  },
};

const bookingSchemas = {
  list: {
    query: paginationQuery.extend({
      status: z.enum(Object.values(BOOKING_STATUS)).optional(),
    }),
  },
  upcoming: {
    query: z.object({
      limit: z.coerce.number().int().min(1).max(10).default(2),
    }),
  },
  create: {
    body: z.object({
      providerId: objectId,
      serviceId: objectId,
      employeeId: objectId.optional(),
      bookingDate: nonEmptyString("Booking date is required."),
      bookingTime: nonEmptyString("Booking time is required."),
      serviceMode: z.enum([
        SERVICE_MODES.PROVIDER_LOCATION,
        SERVICE_MODES.HOME_SERVICE,
      ]),
      address: optionalString,
      notes: optionalString,
    }),
  },
  byId: {
    params: paramsWithId,
  },
  updateStatus: {
    params: paramsWithId,
    body: z.object({
      status: z.enum(Object.values(BOOKING_STATUS)),
    }),
  },
  assignEmployee: {
    params: paramsWithId,
    body: z.object({
      employeeId: objectId.optional().nullable(),
    }),
  },
  requestReschedule: {
    params: paramsWithId,
    body: z.object({
      bookingDate: nonEmptyString("Requested date is required."),
      bookingTime: nonEmptyString("Requested time is required."),
      reason: optionalLimitedString(500),
    }),
  },
  respondReschedule: {
    params: paramsWithId,
    body: z.object({
      status: z.enum([
        RESCHEDULE_STATUS.ACCEPTED,
        RESCHEDULE_STATUS.DECLINED,
      ]),
    }),
  },
};

const reviewSchemas = {
  listProvider: {
    params: providerIdParams,
    query: paginationQuery,
  },
  byBooking: {
    params: bookingIdParams,
  },
  create: {
    body: z.object({
      bookingId: objectId,
      rating: z.coerce.number().int().min(1).max(5),
      comment: optionalString,
    }),
  },
};

const messageSchemas = {
  listConversations: {
    query: paginationQuery,
  },
  startConversation: {
    body: z
      .object({
        bookingId: objectId.optional(),
        providerId: objectId.optional(),
      })
      .refine((value) => value.bookingId || value.providerId, {
        message: "Booking or provider is required.",
      }),
  },
  listMessages: {
    params: conversationIdParams,
    query: paginationQuery,
  },
  sendMessage: {
    params: conversationIdParams,
    body: z.object({
      body: nonEmptyString("Message is required.").max(2000),
    }),
  },
  byConversationId: {
    params: conversationIdParams,
  },
};

const favouriteSchemas = {
  list: {
    query: paginationQuery,
  },
  providerId: {
    params: providerIdParams,
  },
};

const notificationSchemas = {
  list: {
    query: paginationQuery,
  },
  registerPushToken: {
    body: z.object({
      appOwnership: optionalLimitedString(40),
      appVersion: optionalLimitedString(40),
      deviceId: optionalLimitedString(120),
      platform: z.enum(["android", "ios", "unknown", "web"]).default("unknown"),
      token: nonEmptyString("Push token is required.").max(260),
    }),
  },
  revokePushToken: {
    body: z.object({
      token: nonEmptyString("Push token is required.").max(260),
    }),
  },
  byId: {
    params: paramsWithId,
  },
};

const waitlistSchemas = {
  join: {
    body: z.object({
      name: nonEmptyString("Name is required.").max(80),
      email: optionalEmail,
      phone: nonEmptyString("Phone number is required.").max(30),
      country: nonEmptyString("Country is required.").max(80),
      location: nonEmptyString("Location is required.").max(120),
      userType: z.enum(["client", "beauty_professional", "beauty_business", "salon_owner"]),
      serviceOffered: optionalString,
      portfolioLink: optionalString,
      message: optionalString,
      acceptedLegalPolicies: requiredLegalConsent,
    }),
  },
  list: {
    query: paginationQuery,
  },
  byId: {
    params: paramsWithId,
  },
};

const partnershipSchemas = {
  create: {
    body: z.object({
      audience: optionalLimitedString(160),
      city: optionalLimitedString(80),
      contactName: nonEmptyString("Contact name is required.").max(80),
      country: nonEmptyString("Country is required.").max(80),
      email: z.string().trim().toLowerCase().email("Email is invalid.").max(120),
      message: nonEmptyString("Partnership message is required.").max(1600),
      organizationName: nonEmptyString("Organization name is required.").max(120),
      partnershipType: z.enum(PARTNERSHIP_TYPES),
      phone: optionalLimitedString(30),
      website: optionalUrl,
      acceptedLegalPolicies: requiredLegalConsent,
    }),
  },
  adminList: {
    query: paginationQuery.extend({
      partnershipType: z.enum(PARTNERSHIP_TYPES).optional(),
      status: z.enum(PARTNERSHIP_STATUSES).optional(),
    }),
  },
  adminUpdate: {
    params: paramsWithId,
    body: z.object({
      adminNotes: optionalLimitedString(2000),
      status: z.enum(PARTNERSHIP_STATUSES).optional(),
    }),
  },
  byId: {
    params: paramsWithId,
  },
};

const feedbackSchemas = {
  create: {
    body: z.object({
      contactConsent: z.boolean().optional(),
      message: nonEmptyString("Feedback message is required.").max(2000),
      rating: z.coerce.number().int().min(1).max(5).optional(),
      topic: z.enum(FEEDBACK_TOPICS),
    }),
  },
  adminList: {
    query: paginationQuery.extend({
      role: z.enum(PUBLIC_SIGNUP_ROLES).optional(),
      status: z.enum(FEEDBACK_STATUSES).optional(),
      topic: z.enum(FEEDBACK_TOPICS).optional(),
    }),
  },
  adminUpdate: {
    params: paramsWithId,
    body: z.object({
      adminNotes: optionalLimitedString(2000),
      status: z.enum(FEEDBACK_STATUSES).optional(),
    }),
  },
  byId: {
    params: paramsWithId,
  },
};

module.exports = {
  adCardSchemas,
  appUpdateSchemas,
  authSchemas,
  businessEmployeeSchemas,
  bookingSchemas,
  favouriteSchemas,
  feedbackSchemas,
  messageSchemas,
  notificationSchemas,
  partnershipSchemas,
  paramsWithId,
  providerSchemas,
  reviewSchemas,
  serviceSchemas,
  userSchemas,
  waitlistSchemas,
};
