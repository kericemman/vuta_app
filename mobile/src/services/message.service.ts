import { ApiResponse } from "../types/api";
import {
  ChatMessage,
  ConversationSummary,
  StartConversationPayload,
} from "../types/message";
import { api } from "./api";

type ListResponse<T> = {
  count: number;
  data: T[];
  success: boolean;
};

export const listConversations = async () => {
  const response = await api.get<ListResponse<ConversationSummary>>(
    "/messages/conversations",
    {
      params: { limit: 100 },
    }
  );

  return response.data.data;
};

export const startConversation = async (payload: StartConversationPayload) => {
  const response = await api.post<ApiResponse<ConversationSummary>>(
    "/messages/conversations",
    payload
  );

  return response.data.data;
};

export const listMessages = async (conversationId: string) => {
  const response = await api.get<ListResponse<ChatMessage>>(
    `/messages/conversations/${conversationId}/messages`,
    {
      params: { limit: 100 },
    }
  );

  return response.data.data;
};

export const sendMessage = async (conversationId: string, body: string) => {
  const response = await api.post<ApiResponse<ChatMessage>>(
    `/messages/conversations/${conversationId}/messages`,
    { body }
  );

  return response.data.data;
};

export const markConversationRead = async (conversationId: string) => {
  const response = await api.patch<ApiResponse<ConversationSummary>>(
    `/messages/conversations/${conversationId}/read`
  );

  return response.data.data;
};
