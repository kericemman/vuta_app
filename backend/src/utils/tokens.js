const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const getSecret = (name) => {
  if (process.env[name]) {
    return process.env[name];
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required in production.`);
  }

  return `${name.toLowerCase()}_development_secret`;
};

const createTokenPair = (user) => {
  const payload = {
    id: user._id.toString(),
    role: user.role,
  };

  return {
    accessToken: jwt.sign(
      {
        ...payload,
        jti: crypto.randomUUID(),
      },
      getSecret("JWT_ACCESS_SECRET"),
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      }
    ),
    refreshToken: jwt.sign(
      {
        ...payload,
        jti: crypto.randomUUID(),
      },
      getSecret("JWT_REFRESH_SECRET"),
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
      }
    ),
  };
};

const getTokenExpiryDate = (token) => {
  const decoded = jwt.decode(token);

  if (!decoded || !decoded.exp) {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  return new Date(decoded.exp * 1000);
};

const verifyAccessToken = (token) =>
  jwt.verify(token, getSecret("JWT_ACCESS_SECRET"));

const verifyRefreshToken = (token) =>
  jwt.verify(token, getSecret("JWT_REFRESH_SECRET"));

module.exports = {
  createTokenPair,
  getTokenExpiryDate,
  verifyAccessToken,
  verifyRefreshToken,
};
