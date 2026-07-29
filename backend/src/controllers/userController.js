const ApiError = require("../utils/ApiError");
const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { deleteImage } = require("../utils/cloudinaryUpload");
const escapeRegex = require("../utils/escapeRegex");
const { buildPagination, getPagination } = require("../utils/pagination");
const pick = require("../utils/pick");
const serializeUser = require("../utils/serializeUser");

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: serializeUser(req.user),
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const emailProvided = Object.prototype.hasOwnProperty.call(req.body, "email");

  if (
    emailProvided &&
    req.body.email !== undefined &&
    req.body.email !== req.user.email
  ) {
    throw new ApiError(
      400,
      "Email cannot be edited after account creation. Please use your existing email."
    );
  }

  const updates = pick(req.body, [
    "name",
    "phone",
    "country",
    "city",
    "area",
    "profileImage",
    "preferences",
    "language",
  ]);

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    returnDocument: "after",
    runValidators: true,
  });

  res.json({
    success: true,
    data: serializeUser(user),
  });
});

const deleteMe = asyncHandler(async (req, res) => {
  if (req.user.profileImagePublicId) {
    try {
      await deleteImage(req.user.profileImagePublicId);
    } catch (error) {
      console.warn("Profile image deletion failed.", error.message);
    }
  }

  await RefreshToken.updateMany(
    { user: req.user._id, revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        name: "Deleted user",
        phone: `deleted-${req.user._id}-${Date.now()}`,
        preferences: [],
        isActive: false,
        isVerified: false,
      },
      $unset: {
        area: "",
        city: "",
        country: "",
        email: "",
        profileImage: "",
        profileImagePublicId: "",
      },
    },
    { runValidators: true }
  );

  res.json({
    success: true,
    message: "Account deleted successfully.",
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.q) {
    const search = new RegExp(escapeRegex(req.query.q), "i");
    filter.$or = [{ name: search }, { phone: search }, { email: search }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: users.length,
    pagination: buildPagination({ page, limit, total }),
    data: users.map(serializeUser),
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive, isVerified } = req.body;

  if (isActive === undefined && isVerified === undefined) {
    throw new ApiError(400, "No status update was provided.");
  }

  const updates = {};

  if (isActive !== undefined) {
    updates.isActive = Boolean(isActive);
  }

  if (isVerified !== undefined) {
    updates.isVerified = Boolean(isVerified);
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res.json({
    success: true,
    data: serializeUser(user),
  });
});

module.exports = {
  deleteMe,
  getMe,
  updateMe,
  listUsers,
  updateUserStatus,
};
