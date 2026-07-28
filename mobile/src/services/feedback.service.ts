import { ApiResponse } from "../types/api";
import { api } from "./api";

export type FeedbackTopic =
  | "general"
  | "booking"
  | "payments"
  | "messages"
  | "profile"
  | "search"
  | "performance"
  | "other";

export type CreateFeedbackPayload = {
  contactConsent?: boolean;
  message: string;
  rating?: number;
  topic: FeedbackTopic;
};

export const createFeedback = async (payload: CreateFeedbackPayload) => {
  const response = await api.post<ApiResponse<unknown>>("/feedback", payload);

  return response.data;
};
