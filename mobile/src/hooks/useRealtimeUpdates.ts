import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  connectRealtime,
  disconnectRealtime,
  AppUpdatePublishedEvent,
  ConversationUpdatedEvent,
  MessageCreatedEvent,
  NotificationCreatedEvent,
  REALTIME_EVENTS,
} from "../services/realtime.service";
import { useAppConfigStore } from "../store/appConfig.store";
import { useAuthStore } from "../store/auth.store";

const clientBookingsQueryKey = ["client-bookings"] as const;
const providerBookingsQueryKey = ["provider-bookings"] as const;

export function useRealtimeUpdates() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const appConfigLoading = useAppConfigStore((state) => state.isLoading);
  const isBlockingMode = useAppConfigStore(
    (state) => state.config.security.isBlockingMode
  );
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (appConfigLoading || isBlockingMode || !accessToken || !user) {
      disconnectRealtime();
      return undefined;
    }

    const socket = connectRealtime(accessToken);
    const bookingQueryKey =
      user.role === "client" ? clientBookingsQueryKey : providerBookingsQueryKey;

    const refreshConversations = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const refreshNotifications = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    const refreshAppUpdates = () => {
      queryClient.invalidateQueries({ queryKey: ["app-updates"] });
    };

    const handleConversationUpdated = (_event: ConversationUpdatedEvent) => {
      refreshConversations();
    };

    const handleMessageCreated = (event: MessageCreatedEvent) => {
      refreshConversations();
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", event.conversationId],
      });
    };

    const handleNotificationCreated = (event: NotificationCreatedEvent) => {
      refreshNotifications();

      if (event.notification.type === "booking") {
        queryClient.invalidateQueries({ queryKey: bookingQueryKey });
      }
    };

    const handleAppUpdatePublished = (_event: AppUpdatePublishedEvent) => {
      refreshAppUpdates();
    };

    socket.on(
      REALTIME_EVENTS.CONVERSATION_UPDATED,
      handleConversationUpdated
    );
    socket.on(REALTIME_EVENTS.MESSAGE_CREATED, handleMessageCreated);
    socket.on(
      REALTIME_EVENTS.NOTIFICATION_CREATED,
      handleNotificationCreated
    );
    socket.on(
      REALTIME_EVENTS.APP_UPDATE_PUBLISHED,
      handleAppUpdatePublished
    );

    return () => {
      socket.off(
        REALTIME_EVENTS.CONVERSATION_UPDATED,
        handleConversationUpdated
      );
      socket.off(REALTIME_EVENTS.MESSAGE_CREATED, handleMessageCreated);
      socket.off(
        REALTIME_EVENTS.NOTIFICATION_CREATED,
        handleNotificationCreated
      );
      socket.off(
        REALTIME_EVENTS.APP_UPDATE_PUBLISHED,
        handleAppUpdatePublished
      );
      disconnectRealtime();
    };
  }, [accessToken, appConfigLoading, isBlockingMode, queryClient, user]);
}
