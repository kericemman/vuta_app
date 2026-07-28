import axios from "axios";
import { AuthSession } from "../types/auth";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

type AuthRefreshConfig = {
  getRefreshToken: () => string | null;
  onLogout: () => Promise<void>;
  onRefresh: (session: AuthSession) => Promise<void>;
};

let authRefreshConfig: AuthRefreshConfig | null = null;
let refreshPromise: Promise<AuthSession> | null = null;

export const setAccessToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

export const configureAuthRefresh = (config: AuthRefreshConfig) => {
  authRefreshConfig = config;
};

const isAuthEndpoint = (url?: string) =>
  Boolean(
    url?.includes("/auth/login") ||
      url?.includes("/auth/register") ||
      url?.includes("/auth/forgot-password") ||
      url?.includes("/auth/reset-password") ||
      url?.includes("/auth/refresh") ||
      url?.includes("/auth/logout")
  );

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !authRefreshConfig ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const refreshToken = authRefreshConfig.getRefreshToken();

    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise =
        refreshPromise ||
        api
          .post<{ data: AuthSession }>("/auth/refresh", { refreshToken })
          .then((response) => response.data.data)
          .finally(() => {
            refreshPromise = null;
          });

      const session = await refreshPromise;
      setAccessToken(session.accessToken);
      await authRefreshConfig.onRefresh(session);

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${session.accessToken}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      await authRefreshConfig.onLogout();
      return Promise.reject(refreshError);
    }
  }
);

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};
