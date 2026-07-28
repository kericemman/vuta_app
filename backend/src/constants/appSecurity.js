const APP_MODES = {
  FORCE_UPDATE: "force_update",
  INCIDENT_LOCKDOWN: "incident_lockdown",
  MAINTENANCE: "maintenance",
  NORMAL: "normal",
  READ_ONLY: "read_only",
};

const BLOCKING_APP_MODES = [
  APP_MODES.FORCE_UPDATE,
  APP_MODES.INCIDENT_LOCKDOWN,
  APP_MODES.MAINTENANCE,
];

const MUTATING_METHODS = ["DELETE", "PATCH", "POST", "PUT"];

const FEATURE_ROUTES = {
  admin: [
    { path: "/api/ad-cards/admin" },
    { path: "/api/app-updates/admin" },
    { path: "/api/bookings", unsafeOnly: true },
    { path: "/api/partnerships/admin" },
    { path: "/api/providers/admin" },
    { path: "/api/services/admin" },
    { path: "/api/updates/admin" },
    { path: "/api/users" },
    { path: "/api/waitlist", unsafeOnly: true },
  ],
  auth: [{ path: "/api/auth" }],
  booking: [{ path: "/api/bookings" }],
  favourites: [{ path: "/api/favourites" }],
  messaging: [{ path: "/api/messages" }],
  notifications: [{ path: "/api/notifications" }],
  partnerships: [{ path: "/api/partnerships" }],
  profile_edits: [
    { method: "PATCH", path: "/api/users/me" },
    { method: "PUT", path: "/api/providers/me/profile" },
  ],
  provider_services: [{ path: "/api/services", unsafeOnly: true }],
  reviews: [{ path: "/api/reviews" }],
  uploads: [{ path: "/api/uploads" }],
  waitlist: [{ path: "/api/waitlist" }],
};

module.exports = {
  APP_MODES,
  BLOCKING_APP_MODES,
  FEATURE_ROUTES,
  MUTATING_METHODS,
};
