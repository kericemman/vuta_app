import { ApiResponse } from "../types/api";
import { ProviderBooking, ServiceMode } from "../types/provider";
import { api } from "./api";

type ListResponse<T> = {
  count: number;
  data: T[];
  success: boolean;
};

export type CreateBookingPayload = {
  address?: string;
  bookingDate: string;
  bookingTime: string;
  employeeId?: string;
  notes?: string;
  providerId: string;
  serviceId: string;
  serviceMode: Exclude<ServiceMode, "both">;
};

export type RescheduleBookingPayload = {
  bookingDate: string;
  bookingTime: string;
  reason?: string;
};

export const createBooking = async (payload: CreateBookingPayload) => {
  const response = await api.post<ApiResponse<ProviderBooking>>(
    "/bookings",
    payload
  );

  return response.data.data;
};

export const listMyClientBookings = async () => {
  const response = await api.get<ListResponse<ProviderBooking>>("/bookings", {
    params: { limit: 100 },
  });

  return response.data.data;
};

export const listUpcomingClientBookings = async (limit = 2) => {
  const response = await api.get<ListResponse<ProviderBooking>>(
    "/bookings/upcoming",
    {
      params: { limit },
    }
  );

  return response.data.data;
};

export const getBookingById = async (bookingId: string) => {
  const response = await api.get<ApiResponse<ProviderBooking>>(
    `/bookings/${bookingId}`
  );

  return response.data.data;
};

export const updateClientBookingStatus = async (
  bookingId: string,
  status: "cancelled"
) => {
  const response = await api.patch<ApiResponse<ProviderBooking>>(
    `/bookings/${bookingId}/status`,
    { status }
  );

  return response.data.data;
};

export const requestBookingReschedule = async (
  bookingId: string,
  payload: RescheduleBookingPayload
) => {
  const response = await api.patch<ApiResponse<ProviderBooking>>(
    `/bookings/${bookingId}/reschedule`,
    payload
  );

  return response.data.data;
};
