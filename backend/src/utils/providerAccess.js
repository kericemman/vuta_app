const ApiError = require("./ApiError");
const ProviderProfile = require("../models/ProviderProfile");

const getProviderProfileForUser = async (userId) =>
  ProviderProfile.findOne({ user: userId });

const requireProviderProfileForUser = async (userId) => {
  const provider = await getProviderProfileForUser(userId);

  if (!provider) {
    throw new ApiError(404, "Provider profile not found.");
  }

  return provider;
};

const requireBusinessProfileForUser = async (userId) => {
  const provider = await requireProviderProfileForUser(userId);

  if (provider.accountType !== "business") {
    throw new ApiError(403, "A business profile is required for this action.");
  }

  return provider;
};

module.exports = {
  getProviderProfileForUser,
  requireBusinessProfileForUser,
  requireProviderProfileForUser,
};
