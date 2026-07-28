import { api } from "./api";
import { ApiResponse } from "../types/api";
import {
  AuthSession,
  LoginPayload,
  RegisterPayload,
} from "../types/auth";

export const loginRequest = async (payload: LoginPayload) => {
  const response = await api.post<ApiResponse<AuthSession>>(
    "/auth/login",
    payload
  );

  return response.data.data;
};

export const registerRequest = async (payload: RegisterPayload) => {
  const response = await api.post<ApiResponse<AuthSession>>(
    "/auth/register",
    payload
  );

  return response.data.data;
};

export const refreshTokenRequest = async (refreshToken: string) => {
  const response = await api.post<ApiResponse<AuthSession>>("/auth/refresh", {
    refreshToken,
  });

  return response.data.data;
};

export const logoutRequest = async (refreshToken: string) => {
  await api.post("/auth/logout", {
    refreshToken,
  });
};

export const forgotPasswordRequest = async (identifier: string) => {
  const response = await api.post<{
    devResetToken?: string;
    message?: string;
    success: boolean;
  }>("/auth/forgot-password", {
    identifier,
  });

  return response.data;
};

export const resetPasswordRequest = async (
  token: string,
  password: string
) => {
  const response = await api.post<{
    message?: string;
    success: boolean;
  }>("/auth/reset-password", {
    password,
    token,
  });

  return response.data;
};
