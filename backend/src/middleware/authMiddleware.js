const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../utils/tokens");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required.");
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    throw new ApiError(401, "Authentication required.");
  }

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (user?.isActive) {
      req.user = user;
    }
  } catch {
    // Public discovery should still work if an optional token is stale.
  }

  next();
});

module.exports = {
  optionalAuth,
  protect,
};
