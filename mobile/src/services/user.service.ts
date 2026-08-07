import { api } from "./api";
import { ApiResponse } from "../types/api";
import { User } from "../types/auth";
import {
  appendPreparedImage,
  prepareImageForUpload,
  UploadImageAsset,
} from "../utils/imageUpload";

export type UpdateMePayload = {
  area?: string;
  city?: string;
  country?: string;
  email?: string;
  language?: string;
  name?: string;
  phone?: string;
  preferences?: string[];
  profileImage?: string;
};

type ProfileImageUploadResponse = {
  compression: {
    compressedBytes: number;
    format: string;
    originalBytes: number;
    quality: number;
  };
  user: User;
};

export const updateMeRequest = async (payload: UpdateMePayload) => {
  const response = await api.patch<ApiResponse<User>>("/users/me", payload);

  return response.data.data;
};

export const deleteMeRequest = async () => {
  await api.delete("/users/me");
};

export const uploadProfileImageRequest = async (asset: UploadImageAsset) => {
  const formData = new FormData();
  const image = await prepareImageForUpload(asset, "profile");

  appendPreparedImage(formData, "image", image);

  const response = await api.post<ApiResponse<ProfileImageUploadResponse>>(
    "/uploads/profile-image",
    formData,
    {
      timeout: 60000,
    }
  );

  return response.data.data;
};
