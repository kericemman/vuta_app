import { ApiResponse } from "../types/api";
import { CreateReviewPayload, Review } from "../types/review";
import { api } from "./api";

type ListResponse<T> = {
  count: number;
  data: T[];
  success: boolean;
};

export const createReview = async (payload: CreateReviewPayload) => {
  const response = await api.post<ApiResponse<Review>>("/reviews", payload);

  return response.data.data;
};

export const getBookingReview = async (bookingId: string) => {
  const response = await api.get<ApiResponse<Review | null>>(
    `/reviews/booking/${bookingId}`
  );

  return response.data.data;
};

export const listProviderReviews = async (providerId: string, limit = 5) => {
  const response = await api.get<ListResponse<Review>>(
    `/reviews/provider/${providerId}`,
    {
      params: { limit },
    }
  );

  return response.data.data;
};
