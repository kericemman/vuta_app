export type NotificationType =
  | "booking"
  | "message"
  | "system"
  | "promotion"
  | "profile";

export type AppNotification = {
  id: string;
  title: string;
  body?: string;
  type: NotificationType;
  metadata?: Record<string, unknown>;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
};
