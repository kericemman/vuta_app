import {
  manipulateAsync,
  SaveFormat,
} from "expo-image-manipulator";

export type UploadImageAsset = {
  fileName?: string | null;
  height?: number;
  mimeType?: string | null;
  uri: string;
  width?: number;
};

type PreparedUploadImage = {
  name: string;
  type: "image/jpeg";
  uri: string;
};

const MAX_UPLOAD_WIDTH = 1600;
const TARGET_UPLOAD_BYTES = 3 * 1024 * 1024;
const QUALITY_STEPS = [0.78, 0.68, 0.58, 0.48];
const WIDTH_STEPS = [1600, 1280, 1080, 900];

const getByteSize = async (uri: string) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    return blob.size;
  } catch {
    return undefined;
  }
};

const toJpegName = (fileName?: string | null, fallbackPrefix = "image") => {
  const fallback = `${fallbackPrefix}-${Date.now()}.jpg`;

  if (!fileName?.trim()) {
    return fallback;
  }

  return fileName.replace(/\.[a-z0-9]+$/i, ".jpg") || fallback;
};

export const prepareImageForUpload = async (
  asset: UploadImageAsset,
  fallbackPrefix = "image"
): Promise<PreparedUploadImage> => {
  let selected: PreparedUploadImage | null = null;
  let selectedBytes = Number.POSITIVE_INFINITY;

  for (const width of WIDTH_STEPS) {
    const shouldResize = !asset.width || asset.width > width;

    for (const quality of QUALITY_STEPS) {
      const result = await manipulateAsync(
        asset.uri,
        shouldResize ? [{ resize: { width: Math.min(width, MAX_UPLOAD_WIDTH) } }] : [],
        {
          compress: quality,
          format: SaveFormat.JPEG,
        }
      );
      const bytes = await getByteSize(result.uri);
      const prepared = {
        name: toJpegName(asset.fileName, fallbackPrefix),
        type: "image/jpeg" as const,
        uri: result.uri,
      };

      if (bytes === undefined) {
        return prepared;
      }

      if (bytes < selectedBytes) {
        selected = prepared;
        selectedBytes = bytes;
      }

      if (bytes <= TARGET_UPLOAD_BYTES) {
        return prepared;
      }
    }
  }

  return (
    selected || {
      name: toJpegName(asset.fileName, fallbackPrefix),
      type: "image/jpeg",
      uri: asset.uri,
    }
  );
};

export const appendPreparedImage = (
  formData: FormData,
  fieldName: string,
  image: PreparedUploadImage
) => {
  formData.append(fieldName, image as unknown as Blob);
};
