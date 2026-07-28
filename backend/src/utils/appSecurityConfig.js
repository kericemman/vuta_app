const {
  APP_MODES,
  BLOCKING_APP_MODES,
} = require("../constants/appSecurity");

const parseList = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getAppSecurityConfig = () => {
  const mode = Object.values(APP_MODES).includes(process.env.APP_SECURITY_MODE)
    ? process.env.APP_SECURITY_MODE
    : APP_MODES.NORMAL;
  const disabledFeatures = parseList(process.env.APP_DISABLED_FEATURES);
  const defaultMessages = {
    [APP_MODES.FORCE_UPDATE]:
      "Please update Vuta to continue. This keeps your account protected.",
    [APP_MODES.INCIDENT_LOCKDOWN]:
      "Vuta is temporarily protecting accounts while our team investigates unusual activity.",
    [APP_MODES.MAINTENANCE]:
      "Vuta is temporarily under maintenance. Please check back shortly.",
    [APP_MODES.NORMAL]: "",
    [APP_MODES.READ_ONLY]:
      "Vuta is in read-only mode. Browsing is available, but changes are paused for safety.",
  };

  return {
    disabledFeatures,
    incidentId: process.env.APP_INCIDENT_ID || "",
    isBlockingMode: BLOCKING_APP_MODES.includes(mode),
    message: process.env.APP_SECURITY_MESSAGE || defaultMessages[mode],
    minMobileBuild: process.env.APP_MIN_MOBILE_BUILD || "",
    mode,
    statusUrl: process.env.APP_STATUS_URL || "",
    supportEmail:
      process.env.SECURITY_ALERT_EMAIL ||
      process.env.ADMIN_EMAIL ||
      process.env.RESEND_FROM_EMAIL ||
      "",
    updatedAt: new Date().toISOString(),
  };
};

module.exports = {
  getAppSecurityConfig,
};
