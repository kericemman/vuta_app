import { AppUpdate } from "../types/app-update";
import { api } from "./api";

type Pagination = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
  page: number;
  pages: number;
  total: number;
};

type ListUpdatesResponse = {
  count: number;
  data: AppUpdate[];
  pagination?: Pagination;
  success: boolean;
};

type UpdateResponse = {
  data: AppUpdate;
  success: boolean;
};

type UnreadCountResponse = {
  data: {
    unreadCount: number;
  };
  success: boolean;
};

export const appUpdateQueryKeys = {
  detail: (id: string) => ["app-updates", "detail", id] as const,
  list: ["app-updates", "list"] as const,
  unreadCount: ["app-updates", "unread-count"] as const,
};

export const listAppUpdates = async () => {
  const response = await api.get<ListUpdatesResponse>("/updates", {
    params: {
      limit: 40,
    },
  });

  return response.data.data;
};

export const getAppUpdate = async (id: string) => {
  const response = await api.get<UpdateResponse>(`/updates/${id}`);

  return response.data.data;
};

export const getUnreadAppUpdateCount = async () => {
  const response = await api.get<UnreadCountResponse>("/updates/unread-count");

  return response.data.data.unreadCount;
};

export const markAppUpdateRead = async (id: string) => {
  const response = await api.patch<UpdateResponse>(`/updates/${id}/read`);

  return response.data.data;
};

export const markAllAppUpdatesRead = async () => {
  await api.patch("/updates/read-all");
};
