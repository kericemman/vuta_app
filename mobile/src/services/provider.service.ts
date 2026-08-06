import { ApiResponse } from "../types/api";
import {
  BusinessEmployee,
  BusinessEmployeePayload,
  BusinessStats,
  BookingStatus,
  ProviderBooking,
  ProviderProfile,
  ProviderProfilePayload,
  ProviderServicePayload,
} from "../types/provider";
import { ServiceSummary } from "../types/marketplace";
import { api } from "./api";

type ListResponse<T> = {
  count: number;
  data: T[];
  success: boolean;
};

type UploadImageAsset = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
};

type PortfolioUploadResponse = {
  portfolio: ProviderProfile["portfolio"];
};

type ServiceImageUploadResponse = {
  service: ServiceSummary;
};

type BusinessEmployeeImageUploadResponse = {
  employee: BusinessEmployee;
};

export const getMyProviderProfileStatus = async () => {
  const response = await api.get<ApiResponse<ProviderProfile | null>>(
    "/providers/me/profile-status"
  );

  return response.data.data;
};

export const upsertMyProviderProfile = async (
  payload: ProviderProfilePayload
) => {
  const response = await api.put<ApiResponse<ProviderProfile>>(
    "/providers/me/profile",
    payload
  );

  return response.data.data;
};

export const listMyServices = async () => {
  const response = await api.get<ListResponse<ServiceSummary>>("/services/me", {
    params: { limit: 100 },
  });

  return response.data.data;
};

export const createProviderService = async (
  payload: Required<Pick<ProviderServicePayload, "category" | "name" | "price">> &
    ProviderServicePayload
) => {
  const response = await api.post<ApiResponse<ServiceSummary>>(
    "/services",
    payload
  );

  return response.data.data;
};

export const updateProviderService = async (
  serviceId: string,
  payload: ProviderServicePayload
) => {
  const response = await api.patch<ApiResponse<ServiceSummary>>(
    `/services/${serviceId}`,
    payload
  );

  return response.data.data;
};

export const deactivateProviderService = async (serviceId: string) => {
  const response = await api.delete<ApiResponse<ServiceSummary>>(
    `/services/${serviceId}`
  );

  return response.data.data;
};

export const listBusinessEmployees = async () => {
  const response = await api.get<ListResponse<BusinessEmployee>>(
    "/business/employees",
    {
      params: { limit: 100 },
    }
  );

  return response.data.data;
};

export const getBusinessStats = async () => {
  const response = await api.get<ApiResponse<BusinessStats>>(
    "/business/stats"
  );

  return response.data.data;
};

export const createBusinessEmployee = async (
  payload: Required<Pick<BusinessEmployeePayload, "name">> &
    BusinessEmployeePayload
) => {
  const response = await api.post<ApiResponse<BusinessEmployee>>(
    "/business/employees",
    payload
  );

  return response.data.data;
};

export const updateBusinessEmployee = async (
  employeeId: string,
  payload: BusinessEmployeePayload
) => {
  const response = await api.patch<ApiResponse<BusinessEmployee>>(
    `/business/employees/${employeeId}`,
    payload
  );

  return response.data.data;
};

export const deactivateBusinessEmployee = async (employeeId: string) => {
  const response = await api.delete<ApiResponse<BusinessEmployee>>(
    `/business/employees/${employeeId}`
  );

  return response.data.data;
};

export const uploadBusinessEmployeeImage = async (
  employeeId: string,
  asset: UploadImageAsset
) => {
  const formData = new FormData();
  const name = asset.fileName || `employee-${Date.now()}.jpg`;
  const type = asset.mimeType || "image/jpeg";

  formData.append("image", {
    name,
    type,
    uri: asset.uri,
  } as unknown as Blob);

  const response = await api.post<ApiResponse<BusinessEmployeeImageUploadResponse>>(
    `/uploads/business-employees/${employeeId}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    }
  );

  return response.data.data.employee;
};

export const uploadPortfolioImage = async (
  asset: UploadImageAsset,
  caption?: string
) => {
  const formData = new FormData();
  const name = asset.fileName || `portfolio-${Date.now()}.jpg`;
  const type = asset.mimeType || "image/jpeg";

  formData.append("image", {
    name,
    type,
    uri: asset.uri,
  } as unknown as Blob);

  if (caption?.trim()) {
    formData.append("caption", caption.trim());
  }

  const response = await api.post<ApiResponse<PortfolioUploadResponse>>(
    "/uploads/portfolio",
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

export const uploadServiceImage = async (
  serviceId: string,
  asset: UploadImageAsset
) => {
  const formData = new FormData();
  const name = asset.fileName || `service-${Date.now()}.jpg`;
  const type = asset.mimeType || "image/jpeg";

  formData.append("image", {
    name,
    type,
    uri: asset.uri,
  } as unknown as Blob);

  const response = await api.post<ApiResponse<ServiceImageUploadResponse>>(
    `/uploads/services/${serviceId}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    }
  );

  return response.data.data.service;
};

export const deletePortfolioImage = async (publicId: string) => {
  const response = await api.delete<ApiResponse<ProviderProfile["portfolio"]>>(
    `/uploads/portfolio/${publicId}`
  );

  return response.data.data;
};

export const listMyBookings = async () => {
  const response = await api.get<ListResponse<ProviderBooking>>("/bookings", {
    params: { limit: 100 },
  });

  return response.data.data;
};

export const getProviderBookingById = async (bookingId: string) => {
  const response = await api.get<ApiResponse<ProviderBooking>>(
    `/bookings/${bookingId}`
  );

  return response.data.data;
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
) => {
  const response = await api.patch<ApiResponse<ProviderBooking>>(
    `/bookings/${bookingId}/status`,
    { status }
  );

  return response.data.data;
};

export const assignBookingEmployee = async (
  bookingId: string,
  employeeId?: string | null
) => {
  const response = await api.patch<ApiResponse<ProviderBooking>>(
    `/bookings/${bookingId}/employee`,
    { employeeId: employeeId ?? null }
  );

  return response.data.data;
};

export const respondBookingReschedule = async (
  bookingId: string,
  status: "accepted" | "declined"
) => {
  const response = await api.patch<ApiResponse<ProviderBooking>>(
    `/bookings/${bookingId}/reschedule-response`,
    { status }
  );

  return response.data.data;
};
