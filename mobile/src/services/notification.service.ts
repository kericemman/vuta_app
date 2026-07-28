import { api } from "./api";
import { AppNotification } from "../types/notification";

type Pagination = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
  page: number;
  pages: number;
  total: number;
};

type ListNotificationsResponse = {
  count: number;
  data: AppNotification[];
  pagination?: Pagination;
  success: boolean;
};

type UnreadCountResponse = {
  data: {
    unreadCount: number;
  };
  success: boolean;
};

type NotificationResponse = {
  data: AppNotification;
  success: boolean;
};

export const listNotifications = async () => {
  const response = await api.get<ListNotificationsResponse>("/notifications", {
    params: {
      limit: 30,
    },
  });

  return response.data.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get<UnreadCountResponse>(
    "/notifications/unread-count"
  );

  return response.data.data.unreadCount;
};

export const markNotificationRead = async (id: string) => {
  const response = await api.patch<NotificationResponse>(
    `/notifications/${id}/read`
  );

  return response.data.data;
};

export const markAllNotificationsRead = async () => {
  await api.patch("/notifications/read-all");
};
