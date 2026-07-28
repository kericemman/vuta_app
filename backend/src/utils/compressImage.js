const sharp = require("sharp");
const ApiError = require("./ApiError");
const { MAX_COMPRESSED_IMAGE_BYTES } = require("../constants/uploads");

const MAX_IMAGE_WIDTH = 1600;
const QUALITY_STEPS = [82, 76, 70, 64, 58, 52, 46, 40];

const createWebpBuffer = async (buffer, quality, width = MAX_IMAGE_WIDTH) =>
  sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({
      width,
      height: width,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 5,
    })
    .toBuffer();

const compressImageUnderLimit = async (buffer) => {
  let bestBuffer = null;

  for (const quality of QUALITY_STEPS) {
    const compressed = await createWebpBuffer(buffer, quality);
    bestBuffer = compressed;

    if (compressed.length <= MAX_COMPRESSED_IMAGE_BYTES) {
      return {
        buffer: compressed,
        bytes: compressed.length,
        format: "webp",
        quality,
      };
    }
  }

  const smallerWidths = [1280, 1080, 900, 720];

  for (const width of smallerWidths) {
    const compressed = await createWebpBuffer(buffer, 44, width);
    bestBuffer = compressed;

    if (compressed.length <= MAX_COMPRESSED_IMAGE_BYTES) {
      return {
        buffer: compressed,
        bytes: compressed.length,
        format: "webp",
        quality: 44,
      };
    }
  }

  throw new ApiError(400, "Image could not be compressed below 3 MB.", {
    compressedBytes: bestBuffer ? bestBuffer.length : undefined,
    maxBytes: MAX_COMPRESSED_IMAGE_BYTES,
  });
};

module.exports = {
  compressImageUnderLimit,
};
