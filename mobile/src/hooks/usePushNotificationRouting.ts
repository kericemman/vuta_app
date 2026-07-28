import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/auth.store";

const getStringValue = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return undefined;
};

const getMetadata = (data: Record<string, unknown>) => {
  if (data.metadata && typeof data.metadata === "object") {
    return data.metadata as Record<string, unknown>;
  }

  return data;
};

export function usePushNotificationRouting() {
  const user = useAuthStore((state) => state.user);
  const handledNotificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      handledNotificationIdRef.current = null;
      return undefined;
    }

    const routePrefix =
      user.role === "client" ? "/(client)" : "/(provider)";

    const handleResponse = (response: Notifications.NotificationResponse) => {
      const notificationId = response.notification.request.identifier;

      if (handledNotificationIdRef.current === notificationId) {
        return;
      }

      handledNotificationIdRef.current = notificationId;

      const data = response.notification.request.content.data || {};
      const metadata = getMetadata(data);
      const type = getStringValue(data.type);
      const bookingId = getStringValue(metadata.bookingId);
      const conversationId = getStringValue(metadata.conversationId);

      if (type === "message" && conversationId) {
        router.push(`${routePrefix}/chat/${conversationId}`);
        return;
      }

      if (type === "booking" && bookingId) {
        router.push(`${routePrefix}/booking-details/${bookingId}`);
        return;
      }

      if (user.role === "client") {
        router.push("/(client)/notifications");
      }
    };

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleResponse(response);
      }
    });

    const subscription =
      Notifications.addNotificationResponseReceivedListener(handleResponse);

    return () => {
      subscription.remove();
    };
  }, [user]);
}
