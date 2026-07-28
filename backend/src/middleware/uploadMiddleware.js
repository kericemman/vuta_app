const multer = require("multer");
const ApiError = require("../utils/ApiError");
const {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_BYTES,
} = require("../constants/uploads");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      callback(new ApiError(400, "Only JPG, PNG, and WebP images are allowed."));
      return;
    }

    callback(null, true);
  },
});

module.exports = {
  uploadSingleImage: upload.single("image"),
};
