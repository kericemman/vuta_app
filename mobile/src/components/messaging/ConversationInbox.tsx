import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LoadingScreen } from "../LoadingScreen";
import { Screen } from "../Screen";
import { colors, spacing } from "../../constants/theme";
import { listConversations } from "../../services/message.service";
import { ConversationSummary } from "../../types/message";

type ConversationInboxProps = {
  routePrefix: "/(client)" | "/(provider)";
};

export function ConversationInbox({ routePrefix }: ConversationInboxProps) {
  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: listConversations,
    refetchInterval: 30_000,
    retry: 1,
  });

  const conversations = conversationsQuery.data ?? [];
  const unreadTotal = conversations.reduce(
    (total, conversation) => total + (conversation.unreadCount || 0),
    0
  );

  if (conversationsQuery.isLoading) {
    return (
      <LoadingScreen label="Loading messages..." showBackButton size={82} />
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>
          {unreadTotal
            ? `${unreadTotal} unread message${unreadTotal === 1 ? "" : "s"}`
            : "Keep your bookings and beauty conversations in one place."}
        </Text>
      </View>

      {!conversations.length ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons color={colors.primary} name="chatbubbles-outline" size={24} />
          </View>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptyBody}>
            Conversations will appear here when you message about a booking or
            profile.
          </Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {conversations.length ? <View style={styles.sectionDivider} /> : null}
        {conversations.map((conversation) => (
          <ConversationRow
            conversation={conversation}
            key={conversation._id}
            onPress={() =>
              router.push(`${routePrefix}/chat/${conversation._id}`)
            }
          />
        ))}
      </View>
    </Screen>
  );
}

type ConversationRowProps = {
  conversation: ConversationSummary;
  onPress: () => void;
};

function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const title = getConversationTitle(conversation);
  const imageUrl = getConversationImage(conversation);
  const subtitle =
    conversation.booking?.service?.name ||
    conversation.provider?.businessName ||
    "Conversation";
  const preview = conversation.lastMessageText || "No messages yet";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        conversation.unreadCount ? styles.unreadRow : null,
        pressed ? styles.rowPressed : null,
      ]}
    >
      <ConversationAvatar imageUrl={imageUrl} title={title} />
      <View style={styles.rowCopy}>
        <View style={styles.rowTitleLine}>
          <Text numberOfLines={1} style={styles.rowTitle}>
            {title}
          </Text>
          {conversation.lastMessageAt ? (
            <Text style={styles.timeText}>
              {formatConversationTime(conversation.lastMessageAt)}
            </Text>
          ) : null}
        </View>
        <Text numberOfLines={1} style={styles.rowSubtitle}>
          {subtitle}
        </Text>
        <Text numberOfLines={1} style={styles.previewText}>
          {preview}
        </Text>
      </View>
      {conversation.unreadCount ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>
            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
          </Text>
        </View>
      ) : (
        <Ionicons color={colors.muted} name="chevron-forward" size={18} />
      )}
    </Pressable>
  );
}

type ConversationAvatarProps = {
  imageUrl?: string;
  title: string;
};

function ConversationAvatar({ imageUrl, title }: ConversationAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);

  if (imageUrl && !hasImageError) {
    return (
      <Image
        accessibilityIgnoresInvertColors
        onError={() => setHasImageError(true)}
        source={{ uri: imageUrl }}
        style={styles.avatarImage}
      />
    );
  }

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{getInitials(title)}</Text>
    </View>
  );
}

const getConversationTitle = (conversation: ConversationSummary) =>
  conversation.otherParticipants?.[0]?.name ||
  conversation.provider?.businessName ||
  conversation.provider?.user?.name ||
  conversation.client?.name ||
  "Conversation";

const getConversationImage = (conversation: ConversationSummary) =>
  conversation.otherParticipants?.[0]?.profileImage ||
  conversation.providerUser?.profileImage ||
  conversation.provider?.user?.profileImage ||
  conversation.client?.profileImage;

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "V";

const formatConversationTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
  }).format(date);
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
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
    fontWeight: "900",
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  list: {
    gap: spacing.sm,
  },
  sectionDivider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  unreadRow: {
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  rowPressed: {
    opacity: 0.78,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarImage: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitleLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  rowTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
  },
  timeText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  rowSubtitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  previewText: {
    color: colors.muted,
    fontSize: 13,
  },
  unreadBadge: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 999,
    minWidth: 26,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  unreadText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "900",
  },
});
