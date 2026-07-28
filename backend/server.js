const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const http = require("http");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./src/config/db");
const adCardRoutes = require("./src/routes/adCardRoutes");
const appConfigRoutes = require("./src/routes/appConfigRoutes");
const appUpdateRoutes = require("./src/routes/appUpdateRoutes");
const authRoutes = require("./src/routes/authRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const businessEmployeeRoutes = require("./src/routes/businessEmployeeRoutes");
const businessStatsRoutes = require("./src/routes/businessStatsRoutes");
const favouriteRoutes = require("./src/routes/favouriteRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const partnershipRoutes = require("./src/routes/partnershipRoutes");
const providerRoutes = require("./src/routes/providerRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const userRoutes = require("./src/routes/userRoutes");
const waitlistRoutes = require("./src/routes/waitlistRoutes");
const { healthCheck } = require("./src/controllers/healthController");
const appSecurityGuard = require("./src/middleware/appSecurityMiddleware");
const { errorHandler, notFound } = require("./src/middleware/errorMiddleware");
const requestId = require("./src/middleware/requestId");
const { initRealtime } = require("./src/realtime/socket");
const { sendSecurityErrorAlert } = require("./src/utils/securityAlertEmail");

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(requestId);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS."));
    },
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 1000),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 25),
  handler: (req, res) => {
    sendSecurityErrorAlert({
      error: new Error("Authentication rate limit exceeded."),
      req,
      statusCode: 429,
    }).catch((error) => {
      console.error("Rate limit alert failed.", error);
    });

    res.status(429).json({
      success: false,
      message: "Too many authentication attempts. Please try again later.",
      requestId: req.id,
    });
  },
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const sensitiveWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.SENSITIVE_WRITE_RATE_LIMIT_MAX || 120),
  handler: (req, res) => {
    sendSecurityErrorAlert({
      error: new Error("Sensitive route rate limit exceeded."),
      req,
      statusCode: 429,
    }).catch((error) => {
      console.error("Rate limit alert failed.", error);
    });

    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
      requestId: req.id,
    });
  },
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Vuta API is running",
  });
});

app.get("/health", healthCheck);

app.use("/api/app-config", appConfigRoutes);
app.use(appSecurityGuard);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/ad-cards", adCardRoutes);
app.use("/api/updates", appUpdateRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/business/employees", businessEmployeeRoutes);
app.use("/api/business/stats", businessStatsRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", sensitiveWriteLimiter, bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/uploads", sensitiveWriteLimiter, uploadRoutes);
app.use("/api/partnerships", partnershipRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  initRealtime(server, { allowedOrigins });

  server.listen(PORT, () => {
    console.log(`Vuta backend running on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
