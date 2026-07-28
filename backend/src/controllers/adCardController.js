const ApiError = require("../utils/ApiError");
const AdCard = require("../models/AdCard");
const asyncHandler = require("../utils/asyncHandler");
const { AD_PLACEMENTS } = require("../constants/adPlacements");
const { buildPagination, getPagination } = require("../utils/pagination");
const { compressImageUnderLimit } = require("../utils/compressImage");
const {
  deleteImage,
  getOptimizedImageUrl,
  uploadImageBuffer,
} = require("../utils/cloudinaryUpload");

const placementValues = Object.values(AD_PLACEMENTS);

const normalizePlacements = (value) => {
  const rawPlacements = Array.isArray(value)
    ? value
    : String(value || AD_PLACEMENTS.CLIENT_HOME)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const placements = [...new Set(rawPlacements)];

  if (!placements.length || placements.some((item) => !placementValues.includes(item))) {
    throw new ApiError(400, "A valid ad placement is required.");
  }

  return placements;
};

const normalizeBoolean = (value, defaultValue = true) => {
  if (value === undefined) return defaultValue;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

const serializeAdCard = (adCard) => ({
  id: adCard._id.toString(),
  title: adCard.title,
  subtitle: adCard.subtitle,
  ctaText: adCard.ctaText,
  ctaUrl: adCard.ctaUrl,
  imageUrl: adCard.imageUrl,
  imagePublicId: adCard.imagePublicId,
  placements: adCard.placements,
  sortOrder: adCard.sortOrder,
  isActive: adCard.isActive,
  createdAt: adCard.createdAt,
  updatedAt: adCard.updatedAt,
});

const uploadAdImage = async ({ file, userId }) => {
  const compressed = await compressImageUnderLimit(file.buffer);
  const uploadResult = await uploadImageBuffer(compressed.buffer, {
    folder: process.env.CLOUDINARY_AD_CARDS_FOLDER || "vuta/ad-cards",
    context: {
      original_filename: file.originalname,
      uploaded_by: userId.toString(),
    },
  });

  return {
    compression: {
      originalBytes: file.size,
      compressedBytes: compressed.bytes,
      format: compressed.format,
      quality: compressed.quality,
    },
    imagePublicId: uploadResult.public_id,
    imageUrl: getOptimizedImageUrl(uploadResult.public_id),
  };
};

const listPublicAdCards = asyncHandler(async (req, res) => {
  const { placement } = req.query;

  if (!placementValues.includes(placement)) {
    throw new ApiError(400, "A valid placement is required.");
  }

  const adCards = await AdCard.find({
    isActive: true,
    placements: placement,
  }).sort({ sortOrder: 1, createdAt: -1 });

  res.json({
    success: true,
    count: adCards.length,
    data: adCards.map(serializeAdCard),
  });
});

const listAdminAdCards = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.placement) {
    filter.placements = req.query.placement;
  }

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive;
  }

  const [adCards, total] = await Promise.all([
    AdCard.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
    AdCard.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: adCards.length,
    pagination: buildPagination({ page, limit, total }),
    data: adCards.map(serializeAdCard),
  });
});

const createAdCard = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Ad card image is required.");
  }

  if (!req.body.title) {
    throw new ApiError(400, "Ad card title is required.");
  }

  const uploaded = await uploadAdImage({ file: req.file, userId: req.user._id });
  const adCard = await AdCard.create({
    title: req.body.title,
    subtitle: req.body.subtitle,
    ctaText: req.body.ctaText,
    ctaUrl: req.body.ctaUrl,
    placements: normalizePlacements(req.body.placements),
    sortOrder: Number(req.body.sortOrder) || 0,
    isActive: normalizeBoolean(req.body.isActive, true),
    imageUrl: uploaded.imageUrl,
    imagePublicId: uploaded.imagePublicId,
  });

  res.status(201).json({
    success: true,
    data: {
      adCard: serializeAdCard(adCard),
      compression: uploaded.compression,
    },
  });
});

const updateAdCard = asyncHandler(async (req, res) => {
  const adCard = await AdCard.findById(req.params.id);

  if (!adCard) {
    throw new ApiError(404, "Ad card not found.");
  }

  const previousPublicId = adCard.imagePublicId;

  if (req.body.title !== undefined) adCard.title = req.body.title;
  if (req.body.subtitle !== undefined) adCard.subtitle = req.body.subtitle;
  if (req.body.ctaText !== undefined) adCard.ctaText = req.body.ctaText;
  if (req.body.ctaUrl !== undefined) adCard.ctaUrl = req.body.ctaUrl;
  if (req.body.placements !== undefined) {
    adCard.placements = normalizePlacements(req.body.placements);
  }
  if (req.body.sortOrder !== undefined) {
    adCard.sortOrder = Number(req.body.sortOrder) || 0;
  }
  if (req.body.isActive !== undefined) {
    adCard.isActive = normalizeBoolean(req.body.isActive, adCard.isActive);
  }

  let compression;

  if (req.file) {
    const uploaded = await uploadAdImage({ file: req.file, userId: req.user._id });
    adCard.imageUrl = uploaded.imageUrl;
    adCard.imagePublicId = uploaded.imagePublicId;
    compression = uploaded.compression;
  }

  await adCard.save();

  if (req.file && previousPublicId) {
    await deleteImage(previousPublicId);
  }

  res.json({
    success: true,
    data: {
      adCard: serializeAdCard(adCard),
      compression,
    },
  });
});

const deleteAdCard = asyncHandler(async (req, res) => {
  const adCard = await AdCard.findById(req.params.id);

  if (!adCard) {
    throw new ApiError(404, "Ad card not found.");
  }

  await deleteImage(adCard.imagePublicId);
  await adCard.deleteOne();

  res.json({
    success: true,
    message: "Ad card deleted.",
    data: serializeAdCard(adCard),
  });
});

module.exports = {
  createAdCard,
  deleteAdCard,
  listAdminAdCards,
  listPublicAdCards,
  updateAdCard,
};
