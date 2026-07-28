const ApiError = require("../utils/ApiError");
const ProviderProfile = require("../models/ProviderProfile");
const Service = require("../models/Service");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");
const { buildPagination, getPagination } = require("../utils/pagination");
const {
  buildProviderRankingStages,
  getClientRankingContext,
  marketplaceSort,
} = require("../utils/marketplaceRanking");
const pick = require("../utils/pick");
const { ROLES } = require("../constants/roles");
const { SERVICE_MODES } = require("../constants/serviceModes");
const {
  getProviderProfileForUser,
  requireProviderProfileForUser,
} = require("../utils/providerAccess");

const DEFAULT_NEARBY_RADIUS_KM = 25;

const providerFields = [
  "accountType",
  "businessName",
  "bio",
  "categories",
  "country",
  "city",
  "area",
  "serviceMode",
  "portfolio",
  "availability",
  "isActive",
];

const isBusinessNameChangeRequest = ({ existingProfile, requestedName }) => {
  if (!existingProfile || existingProfile.accountType !== "business") {
    return false;
  }

  if (existingProfile.verificationStatus !== "approved") {
    return false;
  }

  if (!requestedName) {
    return false;
  }

  return requestedName.trim() !== (existingProfile.businessName || "").trim();
};

const buildCoordinates = (body) => {
  const longitude = body.longitude ?? body.lng;
  const latitude = body.latitude ?? body.lat;

  if (longitude === undefined && latitude === undefined) {
    return undefined;
  }

  if (longitude === undefined || latitude === undefined) {
    throw new ApiError(400, "Both latitude and longitude are required.");
  }

  const lng = Number(longitude);
  const lat = Number(latitude);

  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    throw new ApiError(400, "Latitude and longitude must be numbers.");
  }

  return {
    type: "Point",
    coordinates: [lng, lat],
  };
};

const hasCoordinateQuery = (lat, lng) => lat !== undefined && lng !== undefined;

const buildNearPoint = (lat, lng) => ({
  type: "Point",
  coordinates: [Number(lng), Number(lat)],
});

const getRadiusMeters = (radiusKm) =>
  Number(radiusKm || DEFAULT_NEARBY_RADIUS_KM) * 1000;

const createOrUpdateMyProviderProfile = asyncHandler(async (req, res) => {
  const updates = pick(req.body, providerFields);
  const coordinates = buildCoordinates(req.body);
  const existingProfile = await ProviderProfile.findOne({ user: req.user._id });
  let responseMessage = "Provider profile saved.";

  if (coordinates) {
    updates.coordinates = coordinates;
  }

  if (!updates.accountType) {
    updates.accountType =
      req.user.role === ROLES.BEAUTY_BUSINESS ? "business" : "individual";
  }

  if (
    isBusinessNameChangeRequest({
      existingProfile,
      requestedName: updates.businessName,
    })
  ) {
    if (!req.body.businessNameChangeReason) {
      throw new ApiError(
        400,
        "Please submit a reason for changing an approved business name."
      );
    }

    updates.businessNameChangeRequest = {
      decisionNote: undefined,
      reason: req.body.businessNameChangeReason,
      requestedAt: new Date(),
      requestedName: updates.businessName.trim(),
      reviewedAt: undefined,
      reviewedBy: undefined,
      status: "pending",
    };
    delete updates.businessName;
    responseMessage =
      "Business name change submitted for Vuta team approval.";
  }

  const updateOperation = {
    $set: { ...updates, user: req.user._id },
  };

  const profile = await ProviderProfile.findOneAndUpdate(
    { user: req.user._id },
    coordinates
      ? {
          $set: {
            ...updateOperation.$set,
            coordinates,
          },
        }
      : {
          ...updateOperation,
          $unset: { coordinates: "" },
        },
    {
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    }
  ).populate("user", "name phone profileImage");

  res.status(200).json({
    success: true,
    message: responseMessage,
    data: profile,
  });
});

const getMyProviderProfile = asyncHandler(async (req, res) => {
  const profile = await requireProviderProfileForUser(req.user._id);

  await profile.populate("user", "name phone profileImage");

  res.json({
    success: true,
    data: profile,
  });
});

const listProviders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const {
    country,
    city,
    area,
    category,
    serviceMode,
    minRating,
    q,
    lat,
    lng,
    radiusKm,
  } = req.query;
  const rankingContext = getClientRankingContext(req.user);

  const filter = {
    isActive: true,
    verificationStatus: "approved",
  };

  if (country) filter.country = country;
  if (city) filter.city = city;
  if (area) filter.area = area;
  if (category) filter.categories = category;
  if (minRating) filter.averageRating = { $gte: Number(minRating) };

  if (serviceMode && serviceMode !== SERVICE_MODES.BOTH) {
    filter.serviceMode = { $in: [serviceMode, SERVICE_MODES.BOTH] };
  }

  if (q) {
    const search = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { businessName: search },
      { bio: search },
      { categories: search },
      { area: search },
      { city: search },
    ];
  }

  if (hasCoordinateQuery(lat, lng)) {
    const rankingStages = buildProviderRankingStages({
      context: rankingContext,
      hasDistance: true,
      radiusKm,
    });
    const geoNearStage = {
      $geoNear: {
        distanceField: "distanceMeters",
        maxDistance: getRadiusMeters(radiusKm),
        near: buildNearPoint(lat, lng),
        query: filter,
        spherical: true,
      },
    };

    const [providers, countResult] = await Promise.all([
      ProviderProfile.aggregate([
        geoNearStage,
        ...rankingStages,
        { $sort: marketplaceSort },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            as: "user",
            from: "users",
            let: { userId: "$user" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$userId"] },
                },
              },
              {
                $project: {
                  name: 1,
                  phone: 1,
                  profileImage: 1,
                },
              },
            ],
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            distanceKm: {
              $round: [{ $divide: ["$distanceMeters", 1000] }, 1],
            },
            user: {
              _id: "$user._id",
              name: "$user.name",
              phone: "$user.phone",
              profileImage: "$user.profileImage",
            },
          },
        },
        { $project: { _ranking: 0, distanceMeters: 0 } },
      ]),
      ProviderProfile.aggregate([geoNearStage, { $count: "total" }]),
    ]);

    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      count: providers.length,
      pagination: buildPagination({ page, limit, total }),
      data: providers,
    });
    return;
  }

  const rankingStages = buildProviderRankingStages({
    context: rankingContext,
  });
  const [providers, total] = await Promise.all([
    ProviderProfile.aggregate([
      { $match: filter },
      ...rankingStages,
      { $sort: marketplaceSort },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          as: "user",
          from: "users",
          let: { userId: "$user" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              },
            },
            {
              $project: {
                name: 1,
                phone: 1,
                profileImage: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          user: {
            _id: "$user._id",
            name: "$user.name",
            phone: "$user.phone",
            profileImage: "$user.profileImage",
          },
        },
      },
      { $project: { _ranking: 0 } },
    ]),
    ProviderProfile.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: providers.length,
    pagination: buildPagination({ page, limit, total }),
    data: providers,
  });
});

const listAdminProviders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { verificationStatus, isActive, q } = req.query;
  const filter = {};

  if (verificationStatus) {
    filter.verificationStatus = verificationStatus;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  if (q) {
    const search = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { businessName: search },
      { bio: search },
      { categories: search },
      { area: search },
      { city: search },
      { country: search },
    ];
  }

  const [providers, total] = await Promise.all([
    ProviderProfile.find(filter)
      .populate("user", "name email phone profileImage isActive isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ProviderProfile.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: providers.length,
    pagination: buildPagination({ page, limit, total }),
    data: providers,
  });
});

const getProviderById = asyncHandler(async (req, res) => {
  const provider = await ProviderProfile.findById(req.params.id).populate(
    "user",
    "name phone profileImage"
  );

  if (
    !provider ||
    !provider.isActive ||
    provider.verificationStatus !== "approved"
  ) {
    throw new ApiError(404, "Provider not found.");
  }

  const services = await Service.find({
    provider: provider._id,
    isActive: true,
  }).sort({ category: 1, price: 1 });

  res.json({
    success: true,
    data: {
      provider,
      services,
    },
  });
});

const updateProviderVerification = asyncHandler(async (req, res) => {
  const { verificationStatus } = req.body;

  if (!["pending", "approved", "rejected"].includes(verificationStatus)) {
    throw new ApiError(400, "Invalid verification status.");
  }

  const provider = await ProviderProfile.findByIdAndUpdate(
    req.params.id,
    { verificationStatus },
    { returnDocument: "after", runValidators: true }
  ).populate("user", "name email phone profileImage isActive isVerified");

  if (!provider) {
    throw new ApiError(404, "Provider not found.");
  }

  res.json({
    success: true,
    data: provider,
  });
});

const reviewBusinessNameChange = asyncHandler(async (req, res) => {
  const { decisionNote, status } = req.body;
  const provider = await ProviderProfile.findById(req.params.id);

  if (!provider) {
    throw new ApiError(404, "Provider not found.");
  }

  const request = provider.businessNameChangeRequest;

  if (!request || request.status !== "pending") {
    throw new ApiError(400, "No pending business name change request found.");
  }

  request.status = status;
  request.reviewedAt = new Date();
  request.reviewedBy = req.user._id;
  request.decisionNote = decisionNote;

  if (status === "approved") {
    provider.businessName = request.requestedName;
  }

  await provider.save();
  await provider.populate("user", "name email phone profileImage isActive isVerified");

  res.json({
    success: true,
    data: provider,
  });
});

const getMyProviderProfileIfExists = asyncHandler(async (req, res) => {
  const profile = await getProviderProfileForUser(req.user._id);

  res.json({
    success: true,
    data: profile,
  });
});

module.exports = {
  createOrUpdateMyProviderProfile,
  getMyProviderProfile,
  getMyProviderProfileIfExists,
  listProviders,
  listAdminProviders,
  getProviderById,
  reviewBusinessNameChange,
  updateProviderVerification,
};
