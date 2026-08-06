const crypto = require("crypto");
const ApiError = require("../utils/ApiError");
const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const hashToken = require("../utils/hashToken");
const pick = require("../utils/pick");
const serializeUser = require("../utils/serializeUser");
const sendEmail = require("../utils/sendEmail");
const { PUBLIC_SIGNUP_ROLES } = require("../constants/roles");
const {
  ACCOUNT_DISABLE_REASONS,
  assertUserCanAuthenticate,
  clearExpiredTemporaryDisable,
  getTemporaryDisableMessage,
  isTemporarilyDisabled,
} = require("../utils/accountAccess");
const {
  createTokenPair,
  getTokenExpiryDate,
  verifyRefreshToken,
} = require("../utils/tokens");

const normalizeUserInput = (body) => {
  const values = pick(body, [
    "name",
    "email",
    "phone",
    "password",
    "role",
    "country",
    "city",
    "area",
  ]);

  if (values.email === "") {
    values.email = undefined;
  }

  if (values.role === "salon_owner") {
    values.role = "beauty_business";
  }

  return values;
};

const createRefreshSession = async (req, user, refreshToken) => {
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    userAgent: req.get("user-agent"),
    ipAddress: req.ip,
    expiresAt: getTokenExpiryDate(refreshToken),
  });
};

const sendAuthResponse = async (req, res, statusCode, user) => {
  const tokens = createTokenPair(user);

  await createRefreshSession(req, user, tokens.refreshToken);

  res.status(statusCode).json({
    success: true,
    data: {
      user: serializeUser(user),
      ...tokens,
    },
  });
};

const createPasswordResetCode = () =>
  crypto.randomInt(0, 1000000).toString().padStart(6, "0");

const RESET_CODE_MAX_SENDS = 5;
const RESET_CODE_LOCK_MS = 6 * 60 * 60 * 1000;

const disableAccountForResetCodeAbuse = async (user, now) => {
  user.accountDisabledUntil = new Date(now.getTime() + RESET_CODE_LOCK_MS);
  user.accountDisabledReason = ACCOUNT_DISABLE_REASONS.PASSWORD_RESET_ABUSE;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  await RefreshToken.updateMany(
    { user: user._id, revokedAt: { $exists: false } },
    { revokedAt: now }
  );

  throw new ApiError(423, getTemporaryDisableMessage(user));
};

const getResetCodeSendCount = (user, now) => {
  const windowStartedAt = user.passwordResetCodeSendWindowStartedAt;
  const windowExpired =
    !windowStartedAt ||
    windowStartedAt <= new Date(now.getTime() - RESET_CODE_LOCK_MS);

  if (windowExpired) {
    user.passwordResetCodeSendCount = 0;
    user.passwordResetCodeSendWindowStartedAt = now;
    return 0;
  }

  return user.passwordResetCodeSendCount || 0;
};

const requestPasswordReset = asyncHandler(async (req, res) => {
  const normalizedIdentifier = String(req.body.identifier || "")
    .trim()
    .toLowerCase();

  const user = await User.findOne({
    $or: [{ phone: req.body.identifier }, { email: normalizedIdentifier }],
  }).select(
    "+passwordResetToken +passwordResetExpires +passwordResetCodeSendCount +passwordResetCodeSendWindowStartedAt"
  );

  let devResetCode;

  if (user?.email) {
    const now = new Date();

    await clearExpiredTemporaryDisable(user, now);

    if (isTemporarilyDisabled(user, now)) {
      throw new ApiError(423, getTemporaryDisableMessage(user));
    }

    if (!user.isActive) {
      res.json({
        success: true,
        message:
          "If an account exists with those details, a password reset code has been sent.",
      });
      return;
    }

    const sendCount = getResetCodeSendCount(user, now);

    if (sendCount >= RESET_CODE_MAX_SENDS) {
      await disableAccountForResetCodeAbuse(user, now);
    }

    const resetCode = createPasswordResetCode();

    user.passwordResetToken = hashToken(resetCode);
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 20);
    user.passwordResetCodeSendCount = sendCount + 1;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: "Reset your Vuta password",
      html: `
        <p>Hello ${user.name || "there"},</p>
        <p>Use this secure 6-digit reset code to create a new Vuta password. It expires in 20 minutes.</p>
        <p><strong style="font-size:24px;letter-spacing:4px;">${resetCode}</strong></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });

    if (process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) {
      devResetCode = resetCode;
    }
  }

  res.json({
    success: true,
    message:
      "If an account exists with those details, a password reset code has been sent.",
    ...(devResetCode ? { devResetCode } : {}),
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select(
    "+password +passwordResetToken +passwordResetExpires +passwordResetCodeSendCount +passwordResetCodeSendWindowStartedAt"
  );

  if (!user) {
    throw new ApiError(400, "Reset code is invalid or has expired.");
  }

  await assertUserCanAuthenticate(user, {
    disabledStatus: 423,
    inactiveMessage: "This account is currently inactive.",
    inactiveStatus: 403,
  });

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetCodeSendCount = 0;
  user.passwordResetCodeSendWindowStartedAt = undefined;
  await user.save();

  await RefreshToken.updateMany(
    { user: user._id, revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );

  res.json({
    success: true,
    message: "Password reset successfully. You can now log in.",
  });
});

const register = asyncHandler(async (req, res) => {
  const values = normalizeUserInput(req.body);

  if (!values.name || !values.phone || !values.password) {
    throw new ApiError(400, "Name, phone, and password are required.");
  }

  values.role = values.role || "client";

  if (!PUBLIC_SIGNUP_ROLES.includes(values.role)) {
    throw new ApiError(400, "Invalid account type.");
  }

  const existingUser = await User.findOne({
    $or: [
      { phone: values.phone },
      ...(values.email ? [{ email: values.email }] : []),
    ],
  });

  if (existingUser) {
    throw new ApiError(409, "An account with these details already exists.");
  }

  const user = await User.create(values);

  await sendAuthResponse(req, res, 201, user);
});

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "Phone/email and password are required.");
  }

  const normalizedIdentifier = String(identifier).trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ phone: identifier }, { email: normalizedIdentifier }],
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid login details.");
  }

  await assertUserCanAuthenticate(user, {
    disabledStatus: 423,
    inactiveMessage: "This account is currently inactive.",
    inactiveStatus: 403,
  });

  await sendAuthResponse(req, res, 200, user);
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new ApiError(400, "Refresh token is required.");
  }

  const decoded = verifyRefreshToken(token);
  const tokenHash = hashToken(token);
  const session = await RefreshToken.findOne({
    tokenHash,
    user: decoded.id,
    revokedAt: { $exists: false },
  });

  if (!session || session.expiresAt <= new Date()) {
    throw new ApiError(401, "Authentication required.");
  }

  const user = await User.findById(decoded.id);

  await assertUserCanAuthenticate(user);

  session.revokedAt = new Date();
  await session.save();

  await sendAuthResponse(req, res, 200, user);
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  await RefreshToken.findOneAndUpdate(
    { tokenHash: hashToken(token), revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );

  res.json({
    success: true,
    message: "Logged out successfully.",
  });
});

const logoutAll = asyncHandler(async (req, res) => {
  await RefreshToken.updateMany(
    { user: req.user._id, revokedAt: { $exists: false } },
    { revokedAt: new Date() }
  );

  res.json({
    success: true,
    message: "All sessions have been logged out.",
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  logout,
  logoutAll,
};
