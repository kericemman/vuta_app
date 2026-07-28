const ApiError = require("../utils/ApiError");
const { sendSecurityErrorAlert } = require("../utils/securityAlertEmail");

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Something went wrong.";

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(" ");
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "A record with these details already exists.";
  }

  if (
    error.name === "MongoServerError" &&
    error.message?.includes("Can't extract geo keys")
  ) {
    statusCode = 400;
    message = "Location coordinates are invalid. Please save the profile again.";
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication required.";
  }

  if (error.name === "MulterError") {
    statusCode = 400;
    message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image must be 12 MB or smaller before compression."
        : "Invalid file upload.";
  }

  if (statusCode >= 500) {
    console.error(error);
    sendSecurityErrorAlert({ error, req, statusCode }).catch((alertError) => {
      console.error("Security alert dispatch failed.", alertError);
    });
    message =
      "Vuta is temporarily protecting this service. Please try again shortly.";
  }

  const response = {
    success: false,
    message,
    requestId: req.id,
  };

  if (error.details) {
    response.errors = error.details;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFound,
  errorHandler,
};
