const ApiError = require("../utils/ApiError");
const AppUpdate = require("../models/AppUpdate");
const AppUpdateRead = require("../models/AppUpdateRead");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");
const { ROLES } = require("../constants/roles");
const {
  APP_UPDATE_AUDIENCES,
  APP_UPDATE_MEDIA_TYPES,
  APP_UPDATE_STATUSES,
} = require("../constants/appUpdates");
const { buildPagination, getPagination } = require("../utils/pagination");
const { compressImageUnderLimit } = require("../utils/compressImage");
const {
  deleteImage,
  getOptimizedImageUrl,
  uploadImageBuffer,
} = require("../utils/cloudinaryUpload");
const { EVENTS, emitToAudiences } = require("../realtime/socket");

const audienceValues = Object.values(APP_UPDATE_AUDIENCES);
const roleAudiences = [
  ROLES.CLIENT,
  ROLES.BEAUTY_PROFESSIONAL,
  ROLES.BEAUTY_BUSINESS,
];

const normalizeAudiences = (audiences = []) => {
  const values = [...new Set(audiences.filter(Boolean))];

  if (!values.length) {
    throw new ApiError(400, "Choose at least one audience.");
  }

  const hasInvalidAudience = values.some(
    (audience) => !audienceValues.includes(audience)
  );

  if (hasInvalidAudience) {
    throw new ApiError(400, "One or more selected audiences are invalid.");
  }

  return values.includes(APP_UPDATE_AUDIENCES.ALL)
    ? [APP_UPDATE_AUDIENCES.ALL]
    : values;
};

const normalizeMedia = (media = []) =>
  media
    .filter((item) => item?.url && item?.type)
    .map((item) => ({
      caption: item.caption || undefined,
      publicId: item.publicId || undefined,
      thumbnailUrl: item.thumbnailUrl || undefined,
      type: item.type,
      url: item.url,
    }));

const getPublishedFilterForUser = (user) => ({
  audiences: {
    $in:
      user.role === ROLES.ADMIN
        ? [APP_UPDATE_AUDIENCES.ALL, ...roleAudiences]
        : [APP_UPDATE_AUDIENCES.ALL, user.role],
  },
  publishedAt: { $lte: new Date() },
  status: APP_UPDATE_STATUSES.PUBLISHED,
});

const getAdminFilter = (query) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.audience) {
    filter.audiences = query.audience;
  }

  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [
      { title: regex },
      { summary: regex },
      { body: regex },
    ];
  }

  return filter;
};

const shouldEmitPublishedUpdate = (previousStatus, nextUpdate) =>
  nextUpdate.status === APP_UPDATE_STATUSES.PUBLISHED &&
  previousStatus !== APP_UPDATE_STATUSES.PUBLISHED;

const serializeAppUpdate = (update, readAt = null) => ({
  id: update._id.toString(),
  audiences: update.audiences,
  body: update.body,
  createdAt: update.createdAt,
  media: update.media || [],
  publishedAt: update.publishedAt,
  readAt,
  status: update.status,
  summary: update.summary,
  title: update.title,
  updatedAt: update.updatedAt,
});

const emitPublishedUpdate = (update) => {
  emitToAudiences(update.audiences, EVENTS.APP_UPDATE_PUBLISHED, {
    update: serializeAppUpdate(update),
  });
};

const ensureUpdateCanBePublished = (payload) => {
  if (!payload.title?.trim() || !payload.body?.trim()) {
    throw new ApiError(400, "Title and body are required before publishing.");
  }

  if (!payload.audiences?.length) {
    throw new ApiError(400, "Choose an audience before publishing.");
  }
};

const uploadAppUpdateImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required.");
  }

  const compressed = await compressImageUnderLimit(req.file.buffer);
  const uploadResult = await uploadImageBuffer(compressed.buffer, {
    folder: process.env.CLOUDINARY_APP_UPDATES_FOLDER || "vuta/app-updates",
    context: {
      original_filename: req.file.originalname,
      uploaded_by: req.user._id.toString(),
    },
  });

  res.status(201).json({
    success: true,
    data: {
      media: {
        publicId: uploadResult.public_id,
        type: APP_UPDATE_MEDIA_TYPES.IMAGE,
        url: getOptimizedImageUrl(uploadResult.public_id),
      },
      compression: {
        originalBytes: req.file.size,
        compressedBytes: compressed.bytes,
        format: compressed.format,
        quality: compressed.quality,
      },
    },
  });
});

const listAdminUpdates = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = getAdminFilter(req.query);

  const [updates, total] = await Promise.all([
    AppUpdate.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AppUpdate.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: updates.length,
    pagination: buildPagination({ page, limit, total }),
    data: updates.map((update) => serializeAppUpdate(update)),
  });
});

const createAdminUpdate = asyncHandler(async (req, res) => {
  const audiences = normalizeAudiences(req.body.audiences);
  const status = req.body.status || APP_UPDATE_STATUSES.DRAFT;
  const payload = {
    audiences,
    body: req.body.body,
    createdBy: req.user._id,
    media: normalizeMedia(req.body.media),
    publishedAt:
      status === APP_UPDATE_STATUSES.PUBLISHED
        ? req.body.publishedAt || new Date()
        : null,
    status,
    summary: req.body.summary,
    title: req.body.title,
    updatedBy: req.user._id,
  };

  if (status === APP_UPDATE_STATUSES.PUBLISHED) {
    ensureUpdateCanBePublished(payload);
  }

  const update = await AppUpdate.create(payload);

  if (update.status === APP_UPDATE_STATUSES.PUBLISHED) {
    emitPublishedUpdate(update);
  }

  res.status(201).json({
    success: true,
    data: serializeAppUpdate(update),
  });
});

const updateAdminUpdate = asyncHandler(async (req, res) => {
  const update = await AppUpdate.findById(req.params.id);

  if (!update) {
    throw new ApiError(404, "Update not found.");
  }

  const previousStatus = update.status;

  if (req.body.audiences !== undefined) {
    update.audiences = normalizeAudiences(req.body.audiences);
  }

  if (req.body.body !== undefined) update.body = req.body.body;
  if (req.body.media !== undefined) update.media = normalizeMedia(req.body.media);
  if (req.body.summary !== undefined) update.summary = req.body.summary;
  if (req.body.title !== undefined) update.title = req.body.title;

  if (req.body.status !== undefined) {
    update.status = req.body.status;
  }

  if (update.status === APP_UPDATE_STATUSES.PUBLISHED) {
    ensureUpdateCanBePublished(update);
    update.publishedAt = req.body.publishedAt || update.publishedAt || new Date();
  } else {
    update.publishedAt = null;
  }

  update.updatedBy = req.user._id;
  await update.save();

  if (shouldEmitPublishedUpdate(previousStatus, update)) {
    emitPublishedUpdate(update);
  }

  res.json({
    success: true,
    data: serializeAppUpdate(update),
  });
});

const deleteAdminUpdate = asyncHandler(async (req, res) => {
  const update = await AppUpdate.findById(req.params.id);

  if (!update) {
    throw new ApiError(404, "Update not found.");
  }

  const imagePublicIds = update.media
    .filter((item) => item.type === APP_UPDATE_MEDIA_TYPES.IMAGE && item.publicId)
    .map((item) => item.publicId);

  await Promise.all([
    AppUpdateRead.deleteMany({ update: update._id }),
    ...imagePublicIds.map((publicId) =>
      deleteImage(publicId).catch((error) => {
        console.warn("Update image deletion failed:", error.message);
      })
    ),
  ]);
  await update.deleteOne();

  res.json({
    success: true,
    message: "Update deleted.",
    data: serializeAppUpdate(update),
  });
});

const listMyUpdates = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = getPublishedFilterForUser(req.user);

  const [updates, total] = await Promise.all([
    AppUpdate.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AppUpdate.countDocuments(filter),
  ]);

  const reads = await AppUpdateRead.find({
    update: { $in: updates.map((update) => update._id) },
    user: req.user._id,
  }).select("update readAt");
  const readAtByUpdate = new Map(
    reads.map((receipt) => [receipt.update.toString(), receipt.readAt])
  );

  res.json({
    success: true,
    count: updates.length,
    pagination: buildPagination({ page, limit, total }),
    data: updates.map((update) =>
      serializeAppUpdate(update, readAtByUpdate.get(update._id.toString()) || null)
    ),
  });
});

const getMyUpdateById = asyncHandler(async (req, res) => {
  const update = await AppUpdate.findOne({
    _id: req.params.id,
    ...getPublishedFilterForUser(req.user),
  });

  if (!update) {
    throw new ApiError(404, "Update not found.");
  }

  const readReceipt = await AppUpdateRead.findOne({
    update: update._id,
    user: req.user._id,
  }).select("readAt");

  res.json({
    success: true,
    data: serializeAppUpdate(update, readReceipt?.readAt || null),
  });
});

const getUnreadUpdateCount = asyncHandler(async (req, res) => {
  const filter = getPublishedFilterForUser(req.user);
  const [result] = await AppUpdate.aggregate([
    { $match: filter },
    {
      $lookup: {
        as: "readReceipts",
        from: "appupdatereads",
        let: { updateId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$update", "$$updateId"] },
                  { $eq: ["$user", req.user._id] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
      },
    },
    { $match: { readReceipts: { $size: 0 } } },
    { $count: "unreadCount" },
  ]);

  res.json({
    success: true,
    data: {
      unreadCount: result?.unreadCount || 0,
    },
  });
});

const markUpdateRead = asyncHandler(async (req, res) => {
  const update = await AppUpdate.findOne({
    _id: req.params.id,
    ...getPublishedFilterForUser(req.user),
  });

  if (!update) {
    throw new ApiError(404, "Update not found.");
  }

  const receipt = await AppUpdateRead.findOneAndUpdate(
    {
      update: update._id,
      user: req.user._id,
    },
    {
      $setOnInsert: {
        readAt: new Date(),
      },
    },
    {
      returnDocument: "after",
      setDefaultsOnInsert: true,
      upsert: true,
    }
  );

  res.json({
    success: true,
    data: serializeAppUpdate(update, receipt.readAt),
  });
});

const markAllUpdatesRead = asyncHandler(async (req, res) => {
  const updates = await AppUpdate.find(getPublishedFilterForUser(req.user)).select("_id");
  const now = new Date();

  if (!updates.length) {
    res.json({
      success: true,
      data: {
        modifiedCount: 0,
      },
    });
    return;
  }

  const result = await AppUpdateRead.bulkWrite(
    updates.map((update) => ({
      updateOne: {
        filter: {
          update: update._id,
          user: req.user._id,
        },
        update: {
          $setOnInsert: {
            readAt: now,
          },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  res.json({
    success: true,
    data: {
      modifiedCount: result.upsertedCount || 0,
    },
  });
});

module.exports = {
  createAdminUpdate,
  deleteAdminUpdate,
  getMyUpdateById,
  getUnreadUpdateCount,
  listAdminUpdates,
  listMyUpdates,
  markAllUpdatesRead,
  markUpdateRead,
  updateAdminUpdate,
  uploadAppUpdateImage,
};
