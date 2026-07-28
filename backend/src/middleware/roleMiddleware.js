const ApiError = require("../utils/ApiError");

const allowRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission for this action.");
    }

    next();
  };

module.exports = {
  allowRoles,
};
