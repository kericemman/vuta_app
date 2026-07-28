const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const formatZodIssues = (issues) =>
  issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

const validateRequest = (schema) =>
  asyncHandler(async (req, res, next) => {
    if (schema.params) {
      const result = schema.params.safeParse(req.params);

      if (!result.success) {
        throw new ApiError(
          400,
          "Invalid route parameters.",
          formatZodIssues(result.error.issues)
        );
      }

      req.params = result.data;
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query);

      if (!result.success) {
        throw new ApiError(
          400,
          "Invalid query parameters.",
          formatZodIssues(result.error.issues)
        );
      }

      Object.defineProperty(req, "query", {
        value: result.data,
        configurable: true,
        writable: true,
      });
    }

    if (schema.body) {
      const result = schema.body.safeParse(req.body);

      if (!result.success) {
        throw new ApiError(
          400,
          "Invalid request body.",
          formatZodIssues(result.error.issues)
        );
      }

      req.body = result.data;
    }

    next();
  });

module.exports = validateRequest;
