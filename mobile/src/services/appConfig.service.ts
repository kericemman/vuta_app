import { ApiResponse } from "../types/api";
import { AppConfig } from "../types/app-config";
import { api } from "./api";

export const getAppConfig = async () => {
  const response = await api.get<ApiResponse<AppConfig>>("/app-config");

  return response.data.data;
};
