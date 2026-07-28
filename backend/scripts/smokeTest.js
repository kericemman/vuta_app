const dotenv = require("dotenv");
const fs = require("fs/promises");
const mongoose = require("mongoose");
const path = require("path");
const app = require("../server");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const {
  APP_UPDATE_AUDIENCES,
  APP_UPDATE_MEDIA_TYPES,
  APP_UPDATE_STATUSES,
} = require("../src/constants/appUpdates");
const { BOOKING_STATUS } = require("../src/constants/bookingStatus");
const { EMPLOYEE_STATUS } = require("../src/constants/businessEmployees");
const { ROLES } = require("../src/constants/roles");
const { SERVICE_MODES } = require("../src/constants/serviceModes");

dotenv.config();

const createServer = () =>
  new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });

const closeServer = (server) =>
  new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const request = async ({ baseUrl, method = "GET", path, token, body }) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const details = payload.errors
      ? ` ${JSON.stringify(payload.errors)}`
      : "";
    throw new Error(
      `${method} ${path} failed with ${response.status}: ${
        payload.message || response.statusText
      }${details}`
    );
  }

  return payload;
};

const getMimeType = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";

  throw new Error("SMOKE_TEST_IMAGE_PATH must point to a JPG, PNG, or WebP image.");
};

const uploadPortfolioImageIfConfigured = async ({ baseUrl, token }) => {
  if (!process.env.SMOKE_TEST_IMAGE_PATH) {
    console.log("Portfolio upload skipped. Set SMOKE_TEST_IMAGE_PATH to test Cloudinary.");
    return;
  }

  const imagePath = process.env.SMOKE_TEST_IMAGE_PATH;
  const image = await fs.readFile(imagePath);
  const formData = new FormData();

  formData.append(
    "image",
    new Blob([image], { type: getMimeType(imagePath) }),
    path.basename(imagePath)
  );
  formData.append("caption", "Smoke test portfolio image.");

  const response = await fetch(`${baseUrl}/api/uploads/portfolio`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `POST /api/uploads/portfolio failed with ${response.status}: ${
        payload.message || response.statusText
      }`
    );
  }

  console.log(
    `Portfolio upload passed. Compressed to ${payload.data.compression.compressedBytes} bytes.`
  );
};

const ensureSmokeAdmin = async (suffix) => {
  const email = `smoke-admin-${suffix}@vuta.test`;
  const phone = `+254799${suffix}`;
  const password = `AdminPass-${suffix}`;

  let admin = await User.findOne({ email });

  if (admin) {
    admin.password = password;
    admin.role = ROLES.ADMIN;
    admin.isActive = true;
    admin.isVerified = true;
    await admin.save();
  } else {
    admin = await User.create({
      name: "Smoke Admin",
      email,
      phone,
      password,
      role: ROLES.ADMIN,
      isActive: true,
      isVerified: true,
    });
  }

  return {
    email,
    phone,
    password,
  };
};

const runSmokeTest = async () => {
  const suffix = String(Date.now());
  const businessPassword = `BusinessPass-${suffix}`;
  const providerPassword = `ProviderPass-${suffix}`;
  const clientPassword = `ClientPass-${suffix}`;

  await connectDB();
  const server = await createServer();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    console.log("Smoke test server started.");

    await request({
      baseUrl,
      path: "/api/app-config",
    });
    console.log("App config route passed.");

    const adminCredentials = await ensureSmokeAdmin(suffix);

    const adminLogin = await request({
      baseUrl,
      method: "POST",
      path: "/api/auth/login",
      body: {
        identifier: adminCredentials.email,
        password: adminCredentials.password,
      },
    });
    console.log("Admin login passed.");

    await request({
      baseUrl,
      method: "POST",
      path: "/api/auth/register",
      body: {
        name: "Smoke Provider",
        email: `smoke-provider-${suffix}@vuta.test`,
        phone: `+254711${suffix}`,
        password: providerPassword,
        role: ROLES.BEAUTY_PROFESSIONAL,
        country: "Kenya",
        city: "Nairobi",
        area: "Kilimani",
      },
    });
    console.log("Provider registration passed.");

    const providerLogin = await request({
      baseUrl,
      method: "POST",
      path: "/api/auth/login",
      body: {
        identifier: `smoke-provider-${suffix}@vuta.test`,
        password: providerPassword,
      },
    });
    console.log("Provider login passed.");

    const providerProfile = await request({
      baseUrl,
      method: "PUT",
      path: "/api/providers/me/profile",
      token: providerLogin.data.accessToken,
      body: {
        accountType: "individual",
        businessName: "Smoke Beauty Studio",
        bio: "Smoke test profile.",
        categories: ["Nails", "Hair"],
        country: "Kenya",
        city: "Nairobi",
        area: "Kilimani",
        latitude: -1.2921,
        longitude: 36.8219,
        serviceMode: SERVICE_MODES.BOTH,
      },
    });
    console.log("Provider profile upsert passed.");

    await uploadPortfolioImageIfConfigured({
      baseUrl,
      token: providerLogin.data.accessToken,
    });

    const service = await request({
      baseUrl,
      method: "POST",
      path: "/api/services",
      token: providerLogin.data.accessToken,
      body: {
        name: "Smoke Manicure",
        category: "Nails",
        description: "Smoke test service.",
        price: 1500,
        currency: "KES",
        duration: 60,
      },
    });
    console.log("Service creation passed.");

    await request({
      baseUrl,
      method: "PATCH",
      path: `/api/providers/${providerProfile.data._id}/verification`,
      token: adminLogin.data.accessToken,
      body: {
        verificationStatus: "approved",
      },
    });
    console.log("Provider approval passed.");

    const providerSearch = encodeURIComponent("Smoke Beauty Studio");
    const providers = await request({
      baseUrl,
      path: `/api/providers?country=Kenya&city=Nairobi&q=${providerSearch}&limit=10`,
    });

    if (!providers.data.some((provider) => provider._id === providerProfile.data._id)) {
      throw new Error("Approved provider was not visible in exact provider search.");
    }
    console.log("Provider discovery search passed.");

    const serviceDetails = await request({
      baseUrl,
      path: `/api/services/${service.data._id}`,
    });

    if (serviceDetails.data.provider?.accountType !== "individual") {
      throw new Error("Professional service details did not include provider account type.");
    }
    console.log("Professional service details context passed.");

    await request({
      baseUrl,
      method: "POST",
      path: "/api/auth/register",
      body: {
        name: "Smoke Business Owner",
        email: `smoke-business-${suffix}@vuta.test`,
        phone: `+254733${suffix}`,
        password: businessPassword,
        role: ROLES.BEAUTY_BUSINESS,
        country: "Kenya",
        city: "Nairobi",
        area: "Westlands",
      },
    });
    console.log("Business registration passed.");

    const businessLogin = await request({
      baseUrl,
      method: "POST",
      path: "/api/auth/login",
      body: {
        identifier: `smoke-business-${suffix}@vuta.test`,
        password: businessPassword,
      },
    });
    console.log("Business login passed.");

    const businessProfile = await request({
      baseUrl,
      method: "PUT",
      path: "/api/providers/me/profile",
      token: businessLogin.data.accessToken,
      body: {
        accountType: "business",
        businessName: "Smoke Luxe Studio",
        bio: "Smoke test business profile.",
        categories: ["Hair", "Makeup"],
        country: "Kenya",
        city: "Nairobi",
        area: "Westlands",
        latitude: -1.2676,
        longitude: 36.8108,
        serviceMode: SERVICE_MODES.BOTH,
      },
    });
    console.log("Business profile upsert passed.");

    const businessService = await request({
      baseUrl,
      method: "POST",
      path: "/api/services",
      token: businessLogin.data.accessToken,
      body: {
        name: "Smoke Silk Press",
        category: "Hair",
        description: "Smoke test business service.",
        price: 2500,
        currency: "KES",
        duration: 60,
      },
    });
    console.log("Business service creation passed.");

    const businessEmployee = await request({
      baseUrl,
      method: "POST",
      path: "/api/business/employees",
      token: businessLogin.data.accessToken,
      body: {
        name: "Smoke Stylist",
        jobTitle: "Hair Stylist",
        specializations: ["Hair", "Silk Press"],
        services: [businessService.data._id],
        status: EMPLOYEE_STATUS.ACTIVE,
        isBookable: true,
      },
    });
    console.log("Business employee creation passed.");

    await request({
      baseUrl,
      method: "PATCH",
      path: `/api/providers/${businessProfile.data._id}/verification`,
      token: adminLogin.data.accessToken,
      body: {
        verificationStatus: "approved",
      },
    });
    console.log("Business approval passed.");

    const businessSearch = encodeURIComponent("Smoke Luxe Studio");
    const businesses = await request({
      baseUrl,
      path: `/api/providers?country=Kenya&city=Nairobi&q=${businessSearch}&limit=10`,
    });

    if (!businesses.data.some((provider) => provider._id === businessProfile.data._id)) {
      throw new Error("Approved business was not visible in exact provider search.");
    }
    console.log("Business discovery search passed.");

    const businessServiceDetails = await request({
      baseUrl,
      path: `/api/services/${businessService.data._id}`,
    });

    if (businessServiceDetails.data.provider?.accountType !== "business") {
      throw new Error("Business service details did not include provider account type.");
    }
    console.log("Business service details context passed.");

    const publicEmployees = await request({
      baseUrl,
      path: `/api/providers/${businessProfile.data._id}/employees?serviceId=${businessService.data._id}`,
    });

    if (!publicEmployees.data.some((employee) => employee._id === businessEmployee.data._id)) {
      throw new Error("Bookable business employee was not visible publicly.");
    }
    console.log("Public business employee discovery passed.");

    const clientRegister = await request({
      baseUrl,
      method: "POST",
      path: "/api/auth/register",
      body: {
        name: "Smoke Client",
        email: `smoke-client-${suffix}@vuta.test`,
        phone: `+254722${suffix}`,
        password: clientPassword,
        role: ROLES.CLIENT,
        country: "Kenya",
        city: "Nairobi",
        area: "Westlands",
      },
    });
    console.log("Client registration passed.");

    const feedback = await request({
      baseUrl,
      method: "POST",
      path: "/api/feedback",
      token: clientRegister.data.accessToken,
      body: {
        contactConsent: true,
        message: "Smoke test feedback.",
        rating: 5,
        topic: "general",
      },
    });
    console.log("Client feedback submission passed.");

    const adminFeedback = await request({
      baseUrl,
      path: "/api/feedback/admin?limit=100",
      token: adminLogin.data.accessToken,
    });

    if (!adminFeedback.data.some((item) => item._id === feedback.data._id)) {
      throw new Error("Submitted feedback was not visible to admin.");
    }
    console.log("Admin feedback list passed.");

    const reviewedFeedback = await request({
      baseUrl,
      method: "PATCH",
      path: `/api/feedback/admin/${feedback.data._id}`,
      token: adminLogin.data.accessToken,
      body: {
        adminNotes: "Smoke feedback reviewed.",
        status: "reviewed",
      },
    });

    if (reviewedFeedback.data.status !== "reviewed") {
      throw new Error("Feedback status was not updated.");
    }
    console.log("Admin feedback update passed.");

    await request({
      baseUrl,
      method: "DELETE",
      path: `/api/feedback/admin/${feedback.data._id}`,
      token: adminLogin.data.accessToken,
    });
    console.log("Admin feedback cleanup passed.");

    const conversation = await request({
      baseUrl,
      method: "POST",
      path: "/api/messages/conversations",
      token: clientRegister.data.accessToken,
      body: {
        providerId: providerProfile.data._id,
      },
    });
    console.log("Conversation start passed.");

    await request({
      baseUrl,
      method: "POST",
      path: `/api/messages/conversations/${conversation.data._id}/messages`,
      token: clientRegister.data.accessToken,
      body: {
        body: "Smoke test client message.",
      },
    });
    console.log("Client message send passed.");

    const providerConversations = await request({
      baseUrl,
      path: "/api/messages/conversations",
      token: providerLogin.data.accessToken,
    });
    const providerConversation = providerConversations.data.find(
      (item) => item._id === conversation.data._id
    );

    if (!providerConversation || providerConversation.unreadCount < 1) {
      throw new Error("Provider did not receive unread client message.");
    }
    console.log("Provider unread message count passed.");

    await request({
      baseUrl,
      path: `/api/messages/conversations/${conversation.data._id}/messages`,
      token: providerLogin.data.accessToken,
    });
    console.log("Provider message read passed.");

    await request({
      baseUrl,
      method: "POST",
      path: `/api/messages/conversations/${conversation.data._id}/messages`,
      token: providerLogin.data.accessToken,
      body: {
        body: "Smoke test provider reply.",
      },
    });
    console.log("Provider reply send passed.");

    const clientConversations = await request({
      baseUrl,
      path: "/api/messages/conversations",
      token: clientRegister.data.accessToken,
    });
    const clientConversation = clientConversations.data.find(
      (item) => item._id === conversation.data._id
    );

    if (!clientConversation || clientConversation.unreadCount < 1) {
      throw new Error("Client did not receive unread provider reply.");
    }
    console.log("Client unread message count passed.");

    const clientUpdate = await request({
      baseUrl,
      method: "POST",
      path: "/api/updates/admin",
      token: adminLogin.data.accessToken,
      body: {
        audiences: [APP_UPDATE_AUDIENCES.CLIENT],
        body: "Smoke test update body for clients.",
        media: [
          {
            caption: "Smoke video link",
            type: APP_UPDATE_MEDIA_TYPES.VIDEO_LINK,
            url: "https://example.com/vuta-smoke-update",
          },
        ],
        status: APP_UPDATE_STATUSES.PUBLISHED,
        summary: "Smoke test client update.",
        title: `Smoke client update ${suffix}`,
      },
    });
    console.log("Admin app update publish passed.");

    const clientUpdates = await request({
      baseUrl,
      path: "/api/updates",
      token: clientRegister.data.accessToken,
    });

    if (!clientUpdates.data.some((update) => update.id === clientUpdate.data.id)) {
      throw new Error("Published client update was not visible to client.");
    }
    console.log("Client update visibility passed.");

    const unreadUpdates = await request({
      baseUrl,
      path: "/api/updates/unread-count",
      token: clientRegister.data.accessToken,
    });

    if (unreadUpdates.data.unreadCount < 1) {
      throw new Error("Published client update did not increment unread count.");
    }
    console.log("Client unread update count passed.");

    const readUpdate = await request({
      baseUrl,
      method: "PATCH",
      path: `/api/updates/${clientUpdate.data.id}/read`,
      token: clientRegister.data.accessToken,
    });

    if (!readUpdate.data.readAt) {
      throw new Error("Client update was not marked as read.");
    }
    console.log("Client update read receipt passed.");

    await request({
      baseUrl,
      method: "DELETE",
      path: `/api/updates/admin/${clientUpdate.data.id}`,
      token: adminLogin.data.accessToken,
    });
    console.log("Admin app update cleanup passed.");

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const booking = await request({
      baseUrl,
      method: "POST",
      path: "/api/bookings",
      token: clientRegister.data.accessToken,
      body: {
        providerId: providerProfile.data._id,
        serviceId: service.data._id,
        bookingDate: tomorrow,
        bookingTime: "10:00",
        serviceMode: SERVICE_MODES.PROVIDER_LOCATION,
        notes: "Smoke test booking.",
      },
    });
    console.log("Booking request passed.");

    const businessBooking = await request({
      baseUrl,
      method: "POST",
      path: "/api/bookings",
      token: clientRegister.data.accessToken,
      body: {
        providerId: businessProfile.data._id,
        serviceId: businessService.data._id,
        employeeId: businessEmployee.data._id,
        bookingDate: tomorrow,
        bookingTime: "11:30",
        serviceMode: SERVICE_MODES.PROVIDER_LOCATION,
        notes: "Smoke test business booking.",
      },
    });

    if (businessBooking.data.employee?._id !== businessEmployee.data._id) {
      throw new Error("Business booking did not assign selected employee.");
    }
    console.log("Business employee booking passed.");

    await request({
      baseUrl,
      method: "PATCH",
      path: `/api/bookings/${booking.data._id}/status`,
      token: providerLogin.data.accessToken,
      body: {
        status: BOOKING_STATUS.ACCEPTED,
      },
    });
    console.log("Booking acceptance passed.");

    await request({
      baseUrl,
      method: "PATCH",
      path: `/api/bookings/${booking.data._id}/status`,
      token: providerLogin.data.accessToken,
      body: {
        status: BOOKING_STATUS.COMPLETED,
      },
    });
    console.log("Booking completion passed.");

    await request({
      baseUrl,
      method: "POST",
      path: "/api/reviews",
      token: clientRegister.data.accessToken,
      body: {
        bookingId: booking.data._id,
        rating: 5,
        comment: "Smoke test review.",
      },
    });
    console.log("Review creation passed.");

    await request({
      baseUrl,
      method: "POST",
      path: `/api/favourites/${providerProfile.data._id}`,
      token: clientRegister.data.accessToken,
    });
    console.log("Favourite creation passed.");

    console.log("Smoke test passed.");
  } finally {
    await closeServer(server);
    await mongoose.connection.close();
  }
};

runSmokeTest().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
