const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./src/config/db");
const waitlistRoutes = require("./src/routes/waitlistRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Vuta API is running",
  });
});

app.use("/api/waitlist", waitlistRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Vuta backend running on port ${PORT}`);
});