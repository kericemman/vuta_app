import { api } from "./api";
import { ApiResponse } from "../types/api";
import { User } from "../types/auth";

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

type UploadImageAsset = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
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
  const name = asset.fileName || `profile-${Date.now()}.jpg`;
  const type = asset.mimeType || "image/jpeg";

  formData.append("image", {
    name,
    type,
    uri: asset.uri,
  } as unknown as Blob);

  const response = await api.post<ApiResponse<ProfileImageUploadResponse>>(
    "/uploads/profile-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    }
  );

  return response.data.data;
};
