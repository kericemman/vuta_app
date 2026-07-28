const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const ProviderProfile = require("../models/ProviderProfile");
const Service = require("../models/Service");
const asyncHandler = require("../utils/asyncHandler");
const { buildPagination, getPagination } = require("../utils/pagination");
const escapeRegex = require("../utils/escapeRegex");
const {
  buildServiceRankingStages,
  getClientRankingContext,
  serviceMarketplaceSort,
} = require("../utils/marketplaceRanking");
const pick = require("../utils/pick");
const { SERVICE_MODES } = require("../constants/serviceModes");
const { requireProviderProfileForUser } = require("../utils/providerAccess");

const DEFAULT_NEARBY_RADIUS_KM = 25;

const serviceFields = [
  "name",
  "category",
  "description",
  "imageUrl",
  "price",
  "currency",
  "duration",
  "isActive",
];

const createService = asyncHandler(async (req, res) => {
  const provider = await requireProviderProfileForUser(req.user._id);
  const values = pick(req.body, serviceFields);

  const service = await Service.create({
    ...values,
    provider: provider._id,
  });

  res.status(201).json({
    success: true,
    data: service,
  });
});

const getMyServices = asyncHandler(async (req, res) => {
  const provider = await requireProviderProfileForUser(req.user._id);
  const { page, limit, skip } = getPagination(req.query);
  const filter = { provider: provider._id };
  const [services, total] = await Promise.all([
    Service.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Service.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: services.length,
    pagination: buildPagination({ page, limit, total }),
    data: services,
  });
});

const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findOne({
    _id: req.params.id,
    isActive: true,
  }).populate({
    path: "provider",
    select:
      "accountType businessName bio categories country city area averageRating reviewCount verificationStatus user portfolio serviceMode",
    match: { isActive: true, verificationStatus: "approved" },
    populate: {
      path: "user",
      select: "name phone profileImage",
    },
  });

  if (!service || !service.provider) {
    throw new ApiError(404, "Service not found.");
  }

  res.json({
    success: true,
    data: service,
  });
});

const updateService = asyncHandler(async (req, res) => {
  const provider = await requireProviderProfileForUser(req.user._id);
  const updates = pick(req.body, serviceFields);

  const service = await Service.findOneAndUpdate(
    {
      _id: req.params.id,
      provider: provider._id,
    },
    updates,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!service) {
    throw new ApiError(404, "Service not found.");
  }

  res.json({
    success: true,
    data: service,
  });
});

const deactivateService = asyncHandler(async (req, res) => {
  const provider = await requireProviderProfileForUser(req.user._id);

  const service = await Service.findOneAndUpdate(
    {
      _id: req.params.id,
      provider: provider._id,
    },
    { isActive: false },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!service) {
    throw new ApiError(404, "Service not found.");
  }

  res.json({
    success: true,
    data: service,
  });
});

const hasCoordinateQuery = (lat, lng) => lat !== undefined && lng !== undefined;

const buildNearPoint = (lat, lng) => ({
  type: "Point",
  coordinates: [Number(lng), Number(lat)],
});

const getRadiusMeters = (radiusKm) =>
  Number(radiusKm || DEFAULT_NEARBY_RADIUS_KM) * 1000;

const buildPublicProviderFilter = ({
  area,
  city,
  country,
  minRating,
  providerId,
  serviceMode,
}) => {
  const filter = {
    isActive: true,
    verificationStatus: "approved",
  };

  if (providerId) filter._id = new mongoose.Types.ObjectId(providerId);
  if (country) filter.country = country;
  if (city) filter.city = city;
  if (area) filter.area = area;
  if (minRating) filter.averageRating = { $gte: Number(minRating) };

  if (serviceMode && serviceMode !== SERVICE_MODES.BOTH) {
    filter.serviceMode = { $in: [serviceMode, SERVICE_MODES.BOTH] };
  }

  return filter;
};

const buildServiceFilter = ({ category, maxPrice, minPrice, providerId, q }) => {
  const filter = { isActive: true };

  if (category) filter.category = category;
  if (providerId) filter.provider = new mongoose.Types.ObjectId(providerId);

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (q) {
    const search = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { name: search },
      { category: search },
      { description: search },
    ];
  }

  return filter;
};

const listNearbyServices = async ({
  context,
  limit,
  page,
  providerFilter,
  q,
  radiusKm,
  serviceFilter,
  skip,
  lat,
  lng,
}) => {
  const search = q ? new RegExp(escapeRegex(q), "i") : null;
  const lookupMatch = { ...serviceFilter };
  delete lookupMatch.provider;
  delete lookupMatch.$or;

  const basePipeline = [
    {
      $geoNear: {
        distanceField: "distanceMeters",
        maxDistance: getRadiusMeters(radiusKm),
        near: buildNearPoint(lat, lng),
        query: providerFilter,
        spherical: true,
      },
    },
    {
      $lookup: {
        as: "services",
        from: Service.collection.name,
        let: { providerId: "$_id" },
        pipeline: [
          {
            $match: {
              ...lookupMatch,
              $expr: { $eq: ["$provider", "$$providerId"] },
            },
          },
        ],
      },
    },
    { $unwind: "$services" },
  ];

  if (search) {
    basePipeline.push({
      $match: {
        $or: [
          { "services.name": search },
          { "services.category": search },
          { "services.description": search },
          { businessName: search },
          { bio: search },
          { categories: search },
          { area: search },
          { city: search },
        ],
      },
    });
  }

  const rankingStages = buildServiceRankingStages({
    context,
    hasDistance: true,
    providerPrefix: "",
    radiusKm,
    servicePrefix: "services",
  });

  const [services, countResult] = await Promise.all([
    ProviderProfile.aggregate([
      ...basePipeline,
      ...rankingStages,
      {
        $sort: {
          "_ranking.score": -1,
          averageRating: -1,
          reviewCount: -1,
          "services.category": 1,
          "services.createdAt": -1,
        },
      },
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
        $project: {
          _id: "$services._id",
          category: "$services.category",
          createdAt: "$services.createdAt",
          currency: "$services.currency",
          description: "$services.description",
          duration: "$services.duration",
          imageUrl: "$services.imageUrl",
          isActive: "$services.isActive",
          name: "$services.name",
          price: "$services.price",
          provider: {
            _id: "$_id",
            accountType: "$accountType",
            area: "$area",
            averageRating: "$averageRating",
            bio: "$bio",
            businessName: "$businessName",
            categories: "$categories",
            city: "$city",
            country: "$country",
            distanceKm: {
              $round: [{ $divide: ["$distanceMeters", 1000] }, 1],
            },
            portfolio: "$portfolio",
            reviewCount: "$reviewCount",
            serviceMode: "$serviceMode",
            user: {
              _id: "$user._id",
              name: "$user.name",
              phone: "$user.phone",
              profileImage: "$user.profileImage",
            },
            verificationStatus: "$verificationStatus",
          },
          updatedAt: "$services.updatedAt",
        },
      },
      { $project: { _ranking: 0 } },
    ]),
    ProviderProfile.aggregate([...basePipeline, { $count: "total" }]),
  ]);

  return {
    services,
    total: countResult[0]?.total || 0,
  };
};

const listServices = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const {
    area,
    category,
    city,
    country,
    lat,
    lng,
    maxPrice,
    minPrice,
    minRating,
    providerId,
    q,
    radiusKm,
    serviceMode,
  } = req.query;
  const rankingContext = getClientRankingContext(req.user);
  const filter = buildServiceFilter({
    category,
    maxPrice,
    minPrice,
    providerId,
    q,
  });
  const providerFilter = buildPublicProviderFilter({
    area,
    city,
    country,
    minRating,
    providerId,
    serviceMode,
  });

  if (hasCoordinateQuery(lat, lng)) {
    const { services, total } = await listNearbyServices({
      lat,
      limit,
      lng,
      context: rankingContext,
      page,
      providerFilter,
      q,
      radiusKm,
      serviceFilter: filter,
      skip,
    });

    res.json({
      success: true,
      count: services.length,
      pagination: buildPagination({ page, limit, total }),
      data: services,
    });
    return;
  }

  const hasProviderFilters = Boolean(
    area || city || country || minRating || providerId || serviceMode
  );

  if (hasProviderFilters && !providerId) {
    const providerIds = await ProviderProfile.find(providerFilter).distinct("_id");
    filter.provider = { $in: providerIds };
  }

  const basePipeline = [
    { $match: filter },
    {
      $lookup: {
        as: "provider",
        from: ProviderProfile.collection.name,
        let: { providerId: "$provider" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$providerId"] },
            },
          },
          { $match: providerFilter },
        ],
      },
    },
    { $unwind: "$provider" },
  ];

  const listingPipeline = [
    ...basePipeline,
    {
      $lookup: {
        as: "providerUser",
        from: "users",
        let: { userId: "$provider.user" },
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
    { $unwind: { path: "$providerUser", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        "provider.user": {
          _id: "$providerUser._id",
          name: "$providerUser.name",
          phone: "$providerUser.phone",
          profileImage: "$providerUser.profileImage",
        },
      },
    },
    {
      $project: {
        providerUser: 0,
      },
    },
    ...buildServiceRankingStages({
      context: rankingContext,
      providerPrefix: "provider",
    }),
    { $sort: serviceMarketplaceSort },
    { $skip: skip },
    { $limit: limit },
    { $project: { _ranking: 0 } },
  ];

  const [services, countResult] = await Promise.all([
    Service.aggregate(listingPipeline),
    Service.aggregate([...basePipeline, { $count: "total" }]),
  ]);

  const total = countResult[0]?.total || 0;

  res.json({
    success: true,
    count: services.length,
    pagination: buildPagination({ page, limit, total }),
    data: services,
  });
});

const listAdminServices = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { category, isActive, q } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive;

  if (q) {
    const search = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { name: search },
      { category: search },
      { description: search },
    ];
  }

  const [services, total] = await Promise.all([
    Service.find(filter)
      .populate({
        path: "provider",
        select: "businessName country city area verificationStatus user",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Service.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: services.length,
    pagination: buildPagination({ page, limit, total }),
    data: services,
  });
});

const updateAdminServiceStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (isActive === undefined) {
    throw new ApiError(400, "Service status is required.");
  }

  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { isActive: Boolean(isActive) },
    {
      returnDocument: "after",
      runValidators: true,
    }
  ).populate({
    path: "provider",
    select: "businessName country city area verificationStatus user",
    populate: {
      path: "user",
      select: "name email phone",
    },
  });

  if (!service) {
    throw new ApiError(404, "Service not found.");
  }

  res.json({
    success: true,
    data: service,
  });
});

module.exports = {
  createService,
  getServiceById,
  getMyServices,
  listAdminServices,
  updateService,
  updateAdminServiceStatus,
  deactivateService,
  listServices,
};
