const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const NEW_PROVIDER_WINDOW_DAYS = 45;
const FRESH_CONTENT_WINDOW_DAYS = 90;

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeTerms = (values = []) =>
  [...new Set(values.map(normalizeText).filter(Boolean))];

const getClientRankingContext = (user) => ({
  area: normalizeText(user?.area),
  city: normalizeText(user?.city),
  country: normalizeText(user?.country),
  preferredCategories: normalizeTerms(user?.preferences),
});

const getTodayName = () => DAY_NAMES[new Date().getDay()];

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const field = (name, prefix) => (prefix ? `$${prefix}.${name}` : `$${name}`);

const lowerString = (fieldPath) => ({
  $toLower: {
    $ifNull: [fieldPath, ""],
  },
});

const lowerStringArray = (fieldPath) => ({
  $map: {
    input: { $ifNull: [fieldPath, []] },
    as: "item",
    in: {
      $toLower: "$$item",
    },
  },
});

const hasText = (fieldPath) => ({
  $gt: [{ $strLenCP: { $ifNull: [fieldPath, ""] } }, 0],
});

const cappedScore = (value, cap, weight) => ({
  $multiply: [
    {
      $min: [
        {
          $divide: [value, cap],
        },
        1,
      ],
    },
    weight,
  ],
});

const buildAvailabilityCount = (availabilityPath) => ({
  $size: {
    $filter: {
      input: { $ifNull: [availabilityPath, []] },
      as: "slot",
      cond: {
        $and: [
          {
            $eq: [
              {
                $toLower: {
                  $ifNull: ["$$slot.day", ""],
                },
              },
              getTodayName().toLowerCase(),
            ],
          },
          { $ne: ["$$slot.isAvailable", false] },
        ],
      },
    },
  },
});

const buildLocationScore = (context, providerPrefix) => {
  const scoreParts = [];

  if (context.area) {
    scoreParts.push({
      $cond: [{ $eq: [lowerString(field("area", providerPrefix)), context.area] }, 8, 0],
    });
  }

  if (context.city) {
    scoreParts.push({
      $cond: [{ $eq: [lowerString(field("city", providerPrefix)), context.city] }, 5, 0],
    });
  }

  if (context.country) {
    scoreParts.push({
      $cond: [
        { $eq: [lowerString(field("country", providerPrefix)), context.country] },
        3,
        0,
      ],
    });
  }

  if (!scoreParts.length) {
    return 0;
  }

  return { $min: [{ $add: scoreParts }, 10] };
};

const buildDistanceScore = ({ hasDistance, radiusKm }) => {
  if (!hasDistance) {
    return 0;
  }

  const radiusMeters = Number(radiusKm || 25) * 1000;

  return {
    $max: [
      0,
      {
        $subtract: [
          15,
          {
            $multiply: [{ $divide: ["$distanceMeters", radiusMeters] }, 15],
          },
        ],
      },
    ],
  };
};

const buildProviderRankingStages = ({
  context = {},
  hasDistance = false,
  providerPrefix = "",
  radiusKm,
} = {}) => {
  const categoriesPath = field("categories", providerPrefix);
  const availabilityPath = field("availability", providerPrefix);
  const portfolioPath = field("portfolio", providerPrefix);
  const createdAtPath = field("createdAt", providerPrefix);
  const reviewCountPath = field("reviewCount", providerPrefix);
  const averageRatingPath = field("averageRating", providerPrefix);
  const preferredCategories = context.preferredCategories || [];

  return [
    {
      $addFields: {
        "_ranking.availabilityTodayCount": buildAvailabilityCount(availabilityPath),
        "_ranking.categoryCount": { $size: { $ifNull: [categoriesPath, []] } },
        "_ranking.distanceScore": buildDistanceScore({ hasDistance, radiusKm }),
        "_ranking.fairExposureScore": {
          $cond: [
            {
              $and: [
                { $lte: [{ $ifNull: [reviewCountPath, 0] }, 2] },
                { $gte: [createdAtPath, daysAgo(NEW_PROVIDER_WINDOW_DAYS)] },
              ],
            },
            8,
            0,
          ],
        },
        "_ranking.freshnessScore": {
          $cond: [
            { $gte: [createdAtPath, daysAgo(FRESH_CONTENT_WINDOW_DAYS)] },
            5,
            0,
          ],
        },
        "_ranking.locationScore": buildLocationScore(context, providerPrefix),
        "_ranking.portfolioCount": { $size: { $ifNull: [portfolioPath, []] } },
        "_ranking.preferenceMatches": preferredCategories.length
          ? {
              $size: {
                $setIntersection: [
                  lowerStringArray(categoriesPath),
                  preferredCategories,
                ],
              },
            }
          : 0,
        "_ranking.profileTextScore": {
          $add: [
            { $cond: [hasText(field("businessName", providerPrefix)), 3, 0] },
            { $cond: [hasText(field("bio", providerPrefix)), 4, 0] },
          ],
        },
      },
    },
    {
      $addFields: {
        "_ranking.availabilityScore": {
          $add: [
            {
              $cond: [
                { $gt: ["$_ranking.availabilityTodayCount", 0] },
                10,
                0,
              ],
            },
            {
              $cond: [
                {
                  $gt: [
                    { $size: { $ifNull: [availabilityPath, []] } },
                    0,
                  ],
                },
                2,
                0,
              ],
            },
          ],
        },
        "_ranking.preferenceScore": cappedScore(
          "$_ranking.preferenceMatches",
          3,
          15
        ),
        "_ranking.profileScore": {
          $add: [
            "$_ranking.profileTextScore",
            cappedScore("$_ranking.portfolioCount", 4, 5),
            cappedScore("$_ranking.categoryCount", 3, 4),
            cappedScore(
              { $size: { $ifNull: [availabilityPath, []] } },
              5,
              4
            ),
          ],
        },
        "_ranking.ratingScore": cappedScore(
          { $ifNull: [averageRatingPath, 0] },
          5,
          30
        ),
        "_ranking.reviewScore": cappedScore(
          { $ifNull: [reviewCountPath, 0] },
          50,
          18
        ),
      },
    },
    {
      $addFields: {
        "_ranking.score": {
          $add: [
            "$_ranking.ratingScore",
            "$_ranking.reviewScore",
            "$_ranking.profileScore",
            "$_ranking.availabilityScore",
            "$_ranking.preferenceScore",
            "$_ranking.locationScore",
            "$_ranking.distanceScore",
            "$_ranking.freshnessScore",
            "$_ranking.fairExposureScore",
          ],
        },
      },
    },
  ];
};

const buildServiceRankingStages = ({
  context = {},
  hasDistance = false,
  providerPrefix = "provider",
  radiusKm,
  servicePrefix = "",
} = {}) => {
  const preferredCategories = context.preferredCategories || [];
  const serviceCategoryPath = field("category", servicePrefix);
  const serviceCreatedAtPath = field("createdAt", servicePrefix);

  return [
    ...buildProviderRankingStages({
      context,
      hasDistance,
      providerPrefix,
      radiusKm,
    }),
    {
      $addFields: {
        "_ranking.serviceDetailScore": {
          $add: [
            { $cond: [hasText(field("imageUrl", servicePrefix)), 6, 0] },
            { $cond: [hasText(field("description", servicePrefix)), 3, 0] },
            {
              $cond: [
                { $gt: [{ $ifNull: [field("duration", servicePrefix), 0] }, 0] },
                2,
                0,
              ],
            },
          ],
        },
        "_ranking.serviceFreshnessScore": {
          $cond: [
            { $gte: [serviceCreatedAtPath, daysAgo(FRESH_CONTENT_WINDOW_DAYS)] },
            3,
            0,
          ],
        },
        "_ranking.servicePreferenceScore": preferredCategories.length
          ? {
              $cond: [
                {
                  $in: [lowerString(serviceCategoryPath), preferredCategories],
                },
                10,
                0,
              ],
            }
          : 0,
      },
    },
    {
      $addFields: {
        "_ranking.score": {
          $add: [
            "$_ranking.score",
            "$_ranking.serviceDetailScore",
            "$_ranking.serviceFreshnessScore",
            "$_ranking.servicePreferenceScore",
          ],
        },
      },
    },
  ];
};

const marketplaceSort = {
  "_ranking.score": -1,
  averageRating: -1,
  reviewCount: -1,
  createdAt: -1,
};

const serviceMarketplaceSort = {
  "_ranking.score": -1,
  "provider.averageRating": -1,
  "provider.reviewCount": -1,
  createdAt: -1,
};

module.exports = {
  buildProviderRankingStages,
  buildServiceRankingStages,
  getClientRankingContext,
  marketplaceSort,
  serviceMarketplaceSort,
};
