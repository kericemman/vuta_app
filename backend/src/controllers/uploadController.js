const ApiError = require("../utils/ApiError");
const BusinessEmployee = require("../models/BusinessEmployee");
const ProviderProfile = require("../models/ProviderProfile");
const Service = require("../models/Service");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { MAX_PORTFOLIO_IMAGES } = require("../constants/uploads");
const { compressImageUnderLimit } = require("../utils/compressImage");
const {
  deleteImage,
  getOptimizedImageUrl,
  uploadImageBuffer,
} = require("../utils/cloudinaryUpload");
const {
  requireBusinessProfileForUser,
  requireProviderProfileForUser,
} = require("../utils/providerAccess");
const serializeUser = require("../utils/serializeUser");

const uploadPortfolioImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required.");
  }

  const provider = await requireProviderProfileForUser(req.user._id);

  if (provider.portfolio.length >= MAX_PORTFOLIO_IMAGES) {
    throw new ApiError(400, "Portfolio can contain a maximum of 8 images.");
  }

  const compressed = await compressImageUnderLimit(req.file.buffer);
  const uploadResult = await uploadImageBuffer(compressed.buffer, {
    context: {
      provider_id: provider._id.toString(),
      original_filename: req.file.originalname,
    },
  });

  const image = {
    url: getOptimizedImageUrl(uploadResult.public_id),
    publicId: uploadResult.public_id,
    caption: req.body.caption,
  };

  provider.portfolio.push(image);
  await provider.save();

  res.status(201).json({
    success: true,
    data: {
      image,
      compression: {
        originalBytes: req.file.size,
        compressedBytes: compressed.bytes,
        format: compressed.format,
        quality: compressed.quality,
      },
      portfolio: provider.portfolio,
    },
  });
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required.");
  }

  const compressed = await compressImageUnderLimit(req.file.buffer);
  const uploadResult = await uploadImageBuffer(compressed.buffer, {
    folder: process.env.CLOUDINARY_PROFILE_FOLDER || "vuta/profile",
    context: {
      original_filename: req.file.originalname,
      user_id: req.user._id.toString(),
    },
  });

  if (req.user.profileImagePublicId) {
    await deleteImage(req.user.profileImagePublicId);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      profileImage: getOptimizedImageUrl(uploadResult.public_id),
      profileImagePublicId: uploadResult.public_id,
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  res.status(201).json({
    success: true,
    data: {
      user: serializeUser(user),
      compression: {
        originalBytes: req.file.size,
        compressedBytes: compressed.bytes,
        format: compressed.format,
        quality: compressed.quality,
      },
    },
  });
});

const uploadServiceImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required.");
  }

  const provider = await requireProviderProfileForUser(req.user._id);
  const service = await Service.findOne({
    _id: req.params.serviceId,
    provider: provider._id,
  });

  if (!service) {
    throw new ApiError(404, "Service not found.");
  }

  const compressed = await compressImageUnderLimit(req.file.buffer);
  const uploadResult = await uploadImageBuffer(compressed.buffer, {
    folder: process.env.CLOUDINARY_SERVICE_FOLDER || "vuta/services",
    context: {
      original_filename: req.file.originalname,
      provider_id: provider._id.toString(),
      service_id: service._id.toString(),
    },
  });

  if (service.imagePublicId) {
    await deleteImage(service.imagePublicId);
  }

  service.imageUrl = getOptimizedImageUrl(uploadResult.public_id);
  service.imagePublicId = uploadResult.public_id;
  await service.save();

  res.status(201).json({
    success: true,
    data: {
      service,
      compression: {
        originalBytes: req.file.size,
        compressedBytes: compressed.bytes,
        format: compressed.format,
        quality: compressed.quality,
      },
    },
  });
});

const uploadBusinessEmployeeImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required.");
  }

  const business = await requireBusinessProfileForUser(req.user._id);
  const employee = await BusinessEmployee.findOne({
    _id: req.params.employeeId,
    business: business._id,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found.");
  }

  const compressed = await compressImageUnderLimit(req.file.buffer);
  const uploadResult = await uploadImageBuffer(compressed.buffer, {
    folder:
      process.env.CLOUDINARY_EMPLOYEE_FOLDER || "vuta/business-employees",
    context: {
      business_id: business._id.toString(),
      employee_id: employee._id.toString(),
      original_filename: req.file.originalname,
    },
  });

  if (employee.profileImagePublicId) {
    await deleteImage(employee.profileImagePublicId);
  }

  employee.profileImage = getOptimizedImageUrl(uploadResult.public_id);
  employee.profileImagePublicId = uploadResult.public_id;
  await employee.save();

  await employee.populate({
    path: "services",
    select: "name category price currency duration imageUrl isActive",
  });

  res.status(201).json({
    success: true,
    data: {
      employee,
      compression: {
        originalBytes: req.file.size,
        compressedBytes: compressed.bytes,
        format: compressed.format,
        quality: compressed.quality,
      },
    },
  });
});

const deletePortfolioImage = asyncHandler(async (req, res) => {
  const provider = await requireProviderProfileForUser(req.user._id);
  const publicId = Array.isArray(req.params.publicId)
    ? req.params.publicId.join("/")
    : req.params.publicId;
  const image = provider.portfolio.find(
    (item) => item.publicId === publicId
  );

  if (!image) {
    throw new ApiError(404, "Portfolio image not found.");
  }

  await deleteImage(image.publicId);

  provider.portfolio = provider.portfolio.filter(
    (item) => item.publicId !== publicId
  );
  await provider.save();

  res.json({
    success: true,
    message: "Portfolio image deleted.",
    data: provider.portfolio,
  });
});

module.exports = {
  deletePortfolioImage,
  uploadBusinessEmployeeImage,
  uploadProfileImage,
  uploadPortfolioImage,
  uploadServiceImage,
};
