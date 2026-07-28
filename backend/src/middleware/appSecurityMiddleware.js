const ApiError = require("../utils/ApiError");
const {
  APP_MODES,
  FEATURE_ROUTES,
  MUTATING_METHODS,
} = require("../constants/appSecurity");
const { getAppSecurityConfig } = require("../utils/appSecurityConfig");

const isMutatingRequest = (req) => MUTATING_METHODS.includes(req.method);

const routeMatches = (req, rule) => {
  if (rule.method && req.method !== rule.method) {
    return false;
  }

  if (rule.unsafeOnly && !isMutatingRequest(req)) {
    return false;
  }

  if (rule.test && !rule.test(req)) {
    return false;
  }

  return req.originalUrl.startsWith(rule.path);
};

const matchesDisabledFeature = (req, feature) =>
  (FEATURE_ROUTES[feature] || []).some((rule) => routeMatches(req, rule));

const appSecurityGuard = (req, res, next) => {
  const security = getAppSecurityConfig();

  if (security.mode === APP_MODES.NORMAL && !security.disabledFeatures.length) {
    next();
    return;
  }

  if (security.mode === APP_MODES.MAINTENANCE) {
    next(
      new ApiError(
        503,
        security.message || "Vuta is temporarily under maintenance."
      )
    );
    return;
  }

  if (security.mode === APP_MODES.FORCE_UPDATE) {
    next(
      new ApiError(
        426,
        security.message || "Please update Vuta to continue."
      )
    );
    return;
  }

  if (security.mode === APP_MODES.INCIDENT_LOCKDOWN) {
    next(
      new ApiError(
        503,
        security.message ||
          "Vuta is temporarily protecting accounts. Please try again shortly."
      )
    );
    return;
  }

  if (security.mode === APP_MODES.READ_ONLY && isMutatingRequest(req)) {
    const allowAuthRefreshOrLogout =
      req.originalUrl === "/api/auth/refresh" ||
      req.originalUrl === "/api/auth/logout";

    if (!allowAuthRefreshOrLogout) {
      next(
        new ApiError(
          423,
          security.message ||
            "Vuta is in read-only mode. Changes are temporarily paused."
        )
      );
      return;
    }
  }

  const disabledFeature = security.disabledFeatures.find((feature) =>
    matchesDisabledFeature(req, feature)
  );

  if (disabledFeature) {
    next(
      new ApiError(
        503,
        `${disabledFeature.replace(/_/g, " ")} is temporarily unavailable while Vuta protects the platform.`
      )
    );
    return;
  }

  next();
};

module.exports = appSecurityGuard;
