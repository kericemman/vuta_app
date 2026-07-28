const ApiError = require("./ApiError");
const { cloudinary, configureCloudinary } = require("../config/cloudinary");

const uploadImageBuffer = (buffer, options = {}) => {
  if (!configureCloudinary()) {
    throw new ApiError(500, "Cloudinary is not configured.");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_PORTFOLIO_FOLDER || "vuta/portfolio",
        resource_type: "image",
        format: "webp",
        overwrite: false,
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

const getOptimizedImageUrl = (publicId) =>
  cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        quality: "auto:good",
        fetch_format: "auto",
      },
    ],
  });

const deleteImage = async (publicId) => {
  if (!configureCloudinary()) {
    throw new ApiError(500, "Cloudinary is not configured.");
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};

module.exports = {
  deleteImage,
  getOptimizedImageUrl,
  uploadImageBuffer,
};
