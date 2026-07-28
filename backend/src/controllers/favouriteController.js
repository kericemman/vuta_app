const ApiError = require("../utils/ApiError");
const Favourite = require("../models/Favourite");
const ProviderProfile = require("../models/ProviderProfile");
const asyncHandler = require("../utils/asyncHandler");
const { buildPagination, getPagination } = require("../utils/pagination");

const addFavourite = asyncHandler(async (req, res) => {
  const provider = await ProviderProfile.findById(req.params.providerId);

  if (!provider || !provider.isActive || provider.verificationStatus !== "approved") {
    throw new ApiError(404, "Provider not found.");
  }

  const favourite = await Favourite.findOneAndUpdate(
    {
      client: req.user._id,
      provider: provider._id,
    },
    {
      client: req.user._id,
      provider: provider._id,
    },
    {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).populate({
    path: "provider",
    populate: {
      path: "user",
      select: "name phone profileImage",
    },
  });

  res.status(201).json({
    success: true,
    data: favourite,
  });
});

const removeFavourite = asyncHandler(async (req, res) => {
  await Favourite.findOneAndDelete({
    client: req.user._id,
    provider: req.params.providerId,
  });

  res.json({
    success: true,
    message: "Provider removed from saved list.",
  });
});

const listFavourites = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { client: req.user._id };
  const [favourites, total] = await Promise.all([
    Favourite.find(filter)
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name phone profileImage",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Favourite.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: favourites.length,
    pagination: buildPagination({ page, limit, total }),
    data: favourites,
  });
});

module.exports = {
  addFavourite,
  removeFavourite,
  listFavourites,
};
