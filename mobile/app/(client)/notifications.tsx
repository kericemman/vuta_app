import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../../src/components/BackButton";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { Screen } from "../../src/components/Screen";
import { colors, spacing } from "../../src/constants/theme";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../src/services/notification.service";
import { AppNotification } from "../../src/types/notification";

const notificationKeys = {
  list: ["notifications", "list"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export default function ClientNotificationsScreen() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: notificationKeys.list,
    queryFn: listNotifications,
    refetchInterval: 45_000,
    retry: 1,
    staleTime: 5_000,
  });

  const refreshNotifications = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: notificationKeys.list }),
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount }),
    ]);
  };

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: refreshNotifications,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: refreshNotifications,
  });

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((notification) => !notification.readAt)
    .length;
  const isLoading =
    notificationsQuery.isLoading ||
    markReadMutation.isPending ||
    markAllReadMutation.isPending;

  const handleNotificationPress = (notification: AppNotification) => {
    if (!notification.readAt) {
      markReadMutation.mutate(notification.id);
    }

    const bookingId = notification.metadata?.bookingId;

    if (notification.type === "booking" && bookingId) {
      router.push(`/(client)/booking-details/${String(bookingId)}`);
      return;
    }

    const conversationId = notification.metadata?.conversationId;

    if (notification.type === "message" && conversationId) {
      router.push(`/(client)/chat/${String(conversationId)}`);
    }
  };

  if (notificationsQuery.isLoading) {
    return (
      <LoadingScreen
        label="Loading notifications..."
        showBackButton
        size={82}
      />
    );
  }

  return (
    <Screen
      fixedHeader={
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              {unreadCount
                ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                : "You are all caught up"}
            </Text>
          </View>
          {unreadCount ? (
            <Pressable
              disabled={markAllReadMutation.isPending}
              onPress={() => markAllReadMutation.mutate()}
              style={({ pressed }) => [
                styles.markAllButton,
                pressed ? styles.markAllButtonPressed : null,
              ]}
            >
              <Text style={styles.markAllText}>Read all</Text>
            </Pressable>
          ) : null}
        </View>
      }
    >
      {!notifications.length ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              color={colors.primary}
              name="notifications-outline"
              size={24}
            />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyBody}>
            Booking updates, messages, and account alerts will appear here.
          </Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {notifications.map((notification, index) => (
          <View key={notification.id}>
            {index === 0 ? <View style={styles.sectionDivider} /> : null}
            <Pressable
              disabled={isLoading}
              onPress={() => handleNotificationPress(notification)}
              style={({ pressed }) => [
                styles.notificationCard,
                pressed ? styles.notificationCardPressed : null,
              ]}
            >
              <View
                style={[
                  styles.typeIcon,
                  !notification.readAt ? styles.unreadTypeIcon : null,
                ]}
              >
                <Ionicons
                  color={!notification.readAt ? colors.surface : colors.primary}
                  name={getNotificationIcon(notification.type)}
                  size={20}
                />
              </View>
              <View style={styles.notificationCopy}>
                <View style={styles.notificationTitleRow}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  {!notification.readAt ? <View style={styles.unreadDot} /> : null}
                </View>
                {notification.body ? (
                  <Text style={styles.notificationBody}>{notification.body}</Text>
                ) : null}
                <Text style={styles.notificationTime}>
                  {formatNotificationDate(notification.createdAt)}
                </Text>
              </View>
            </Pressable>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const getNotificationIcon = (type: AppNotification["type"]): IoniconName => {
  if (type === "booking") {
    return "calendar-outline";
  }

  if (type === "message") {
    return "chatbubble-ellipses-outline";
  }

  if (type === "promotion") {
    return "pricetag-outline";
  }

  if (type === "profile") {
    return "person-outline";
  }

  return "sparkles-outline";
};

const formatNotificationDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(date);
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 2,
  },
  markAllButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  markAllButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  markAllText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  emptyCard: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  list: {
    gap: spacing.sm,
  },
  sectionDivider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  notificationCard: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  notificationCardPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  typeIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  unreadTypeIcon: {
    backgroundColor: colors.primary,
  },
  notificationCopy: {
    flex: 1,
    gap: 4,
  },
  notificationTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  notificationTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  unreadDot: {
    backgroundColor: colors.accent,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  notificationBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  notificationTime: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
});
