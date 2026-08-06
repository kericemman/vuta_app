const ApiError = require("./ApiError");

const ACCOUNT_DISABLE_REASONS = {
  PASSWORD_RESET_ABUSE: "password_reset_abuse",
};

const isTemporarilyDisabled = (user, now = new Date()) =>
  Boolean(user?.accountDisabledUntil && user.accountDisabledUntil > now);

const getTemporaryDisableMessage = (user) => {
  const unlockAt = user.accountDisabledUntil
    ? new Date(user.accountDisabledUntil)
    : null;

  if (!unlockAt || Number.isNaN(unlockAt.getTime())) {
    return "This account is temporarily disabled. Please try again later.";
  }

  return `This account is temporarily disabled until ${unlockAt.toISOString()} because too many reset codes were requested.`;
};

const clearExpiredTemporaryDisable = async (user, now = new Date()) => {
  if (!user?.accountDisabledUntil || user.accountDisabledUntil > now) {
    return;
  }

  user.accountDisabledUntil = undefined;
  user.accountDisabledReason = undefined;

  if (user.passwordResetCodeSendCount !== undefined) {
    user.passwordResetCodeSendCount = 0;
  }

  if (user.passwordResetCodeSendWindowStartedAt !== undefined) {
    user.passwordResetCodeSendWindowStartedAt = undefined;
  }

  await user.save({ validateBeforeSave: false });
};

const assertUserCanAuthenticate = async (
  user,
  {
    disabledStatus = 423,
    inactiveMessage = "Authentication required.",
    inactiveStatus = 401,
    missingMessage = "Authentication required.",
    missingStatus = 401,
    now = new Date(),
  } = {}
) => {
  if (!user) {
    throw new ApiError(missingStatus, missingMessage);
  }

  await clearExpiredTemporaryDisable(user, now);

  if (!user.isActive) {
    throw new ApiError(inactiveStatus, inactiveMessage);
  }

  if (isTemporarilyDisabled(user, now)) {
    throw new ApiError(disabledStatus, getTemporaryDisableMessage(user));
  }
};

module.exports = {
  ACCOUNT_DISABLE_REASONS,
  assertUserCanAuthenticate,
  clearExpiredTemporaryDisable,
  getTemporaryDisableMessage,
  isTemporarilyDisabled,
};
