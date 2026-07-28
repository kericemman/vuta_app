import { ProviderBooking } from "./provider";

export type MessageUser = {
  _id: string;
  name?: string;
  profileImage?: string;
  role?: string;
};

export type ConversationSummary = {
  _id: string;
  booking?: Pick<
    ProviderBooking,
    "_id" | "bookingDate" | "bookingTime" | "service" | "status"
  >;
  client?: MessageUser;
  createdAt?: string;
  lastMessageAt?: string;
  lastMessageSender?: MessageUser;
  lastMessageText?: string;
  otherParticipants?: MessageUser[];
  provider?: {
    _id: string;
    area?: string;
    businessName?: string;
    city?: string;
    country?: string;
    user?: MessageUser;
  };
  providerUser?: MessageUser;
  unreadCount: number;
  updatedAt?: string;
};

export type ChatMessage = {
  _id: string;
  body: string;
  conversation: string;
  createdAt?: string;
  sender?: MessageUser;
  updatedAt?: string;
};

export type StartConversationPayload = {
  bookingId?: string;
  providerId?: string;
};
