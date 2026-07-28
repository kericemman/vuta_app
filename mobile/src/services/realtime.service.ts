import { Socket, io } from "socket.io-client";
import { API_URL } from "./api";
import { ChatMessage, ConversationSummary } from "../types/message";
import { AppNotification } from "../types/notification";
import { AppUpdate } from "../types/app-update";

export const REALTIME_EVENTS = {
  APP_UPDATE_PUBLISHED: "app-update.published",
  CONVERSATION_UPDATED: "conversation.updated",
  MESSAGE_CREATED: "message.created",
  NOTIFICATION_CREATED: "notification.created",
} as const;

export type ConversationUpdatedEvent = {
  conversation: ConversationSummary;
};

export type MessageCreatedEvent = {
  conversationId: string;
  message: ChatMessage;
};

export type NotificationCreatedEvent = {
  notification: AppNotification;
};

export type AppUpdatePublishedEvent = {
  update: AppUpdate;
};

const REALTIME_URL =
  process.env.EXPO_PUBLIC_REALTIME_URL?.replace(/\/$/, "") ||
  API_URL.replace(/\/api$/, "");

let activeSocket: Socket | null = null;
let activeToken: string | null = null;

export const connectRealtime = (accessToken: string) => {
  if (activeSocket && activeToken === accessToken) {
    if (!activeSocket.connected) {
      activeSocket.connect();
    }

    return activeSocket;
  }

  disconnectRealtime();

  activeToken = accessToken;
  activeSocket = io(REALTIME_URL, {
    auth: {
      token: accessToken,
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 8_000,
    timeout: 10_000,
  });

  return activeSocket;
};

export const disconnectRealtime = () => {
  if (activeSocket) {
    activeSocket.removeAllListeners();
    activeSocket.disconnect();
  }

  activeSocket = null;
  activeToken = null;
};
