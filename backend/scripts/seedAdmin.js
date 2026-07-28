const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const { ROLES } = require("../src/constants/roles");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const requiredEnv = (name) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to seed the admin account.`);
  }

  return value;
};

const normalizeEmail = (value) => value.trim().toLowerCase();

const seedAdmin = async () => {
  const name = process.env.ADMIN_USER_NAME?.trim() || "Vuta Admin";
  const email = normalizeEmail(requiredEnv("ADMIN_USER_EMAIL"));
  const phone = requiredEnv("ADMIN_USER_PHONE");
  const password = requiredEnv("ADMIN_USER_PASSWORD");

  if (password.length < 8) {
    throw new Error("ADMIN_USER_PASSWORD must be at least 8 characters.");
  }

  await connectDB();

  const existingAdmin = await User.findOne({
    $or: [{ email }, { phone }],
  }).select("+password");

  if (existingAdmin) {
    existingAdmin.name = name;
    existingAdmin.email = email;
    existingAdmin.phone = phone;
    existingAdmin.password = password;
    existingAdmin.role = ROLES.ADMIN;
    existingAdmin.isActive = true;
    existingAdmin.isVerified = true;
    await existingAdmin.save();

    console.log(`Admin seeded: updated ${existingAdmin.email || existingAdmin.phone}`);
    return;
  }

  const admin = await User.create({
    name,
    email,
    phone,
    password,
    role: ROLES.ADMIN,
    isActive: true,
    isVerified: true,
  });

  console.log(`Admin seeded: created ${admin.email || admin.phone}`);
};

seedAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
