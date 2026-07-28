import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../BackButton";
import { LoadingScreen } from "../LoadingScreen";
import { Screen } from "../Screen";
import { colors, radii, spacing } from "../../constants/theme";
import {
  appUpdateQueryKeys,
  listAppUpdates,
  markAllAppUpdatesRead,
} from "../../services/app-update.service";
import { AppUpdate } from "../../types/app-update";

export function AppUpdatesScreen() {
  const queryClient = useQueryClient();

  const updatesQuery = useQuery({
    queryFn: listAppUpdates,
    queryKey: appUpdateQueryKeys.list,
    refetchInterval: 60_000,
    retry: 1,
    staleTime: 5_000,
  });

  const refreshUpdates = async () => {
    await queryClient.invalidateQueries({ queryKey: ["app-updates"] });
  };

  const markAllReadMutation = useMutation({
    mutationFn: markAllAppUpdatesRead,
    onSuccess: refreshUpdates,
  });

  const updates = updatesQuery.data ?? [];
  const unreadCount = updates.filter((update) => !update.readAt).length;

  const openUpdate = (update: AppUpdate) => {
    router.push(`/updates/${update.id}`);
  };

  if (updatesQuery.isLoading) {
    return (
      <LoadingScreen label="Loading updates..." showBackButton size={82} />
    );
  }

  return (
    <Screen
      fixedHeader={
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Updates</Text>
            <Text style={styles.subtitle}>
              {unreadCount
                ? `${unreadCount} new update${unreadCount === 1 ? "" : "s"}`
                : "Latest news from Vuta"}
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
      {!updates.length ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons color={colors.primary} name="newspaper-outline" size={24} />
          </View>
          <Text style={styles.emptyTitle}>No updates yet</Text>
          <Text style={styles.emptyBody}>
            Product news, marketplace guidance, and important announcements will
            appear here.
          </Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {updates.map((update) => {
          const heroImage = getHeroImage(update);

          return (
            <Pressable
              key={update.id}
              onPress={() => openUpdate(update)}
              style={({ pressed }) => [
                styles.card,
                !update.readAt ? styles.unreadCard : null,
                pressed ? styles.cardPressed : null,
              ]}
            >
              {heroImage ? (
                <Image source={{ uri: heroImage }} style={styles.cardImage} />
              ) : null}
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text numberOfLines={2} style={styles.cardTitle}>
                    {update.title}
                  </Text>
                  {!update.readAt ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text numberOfLines={2} style={styles.cardSummary}>
                  {update.summary || getBodyExcerpt(update.body)}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardDate}>
                    {formatUpdateDate(update.publishedAt || update.createdAt)}
                  </Text>
                  <Ionicons
                    color={colors.muted}
                    name="chevron-forward"
                    size={18}
                  />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const getHeroImage = (update: AppUpdate) =>
  update.media.find((item) => item.type === "image")?.url;

const getBodyExcerpt = (body = "") =>
  body.replace(/[#*_`[\]()!-]/g, "").trim().slice(0, 120) ||
  "Tap to read more";

const formatUpdateDate = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardBody: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardDate: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardImage: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceMuted,
    width: "100%",
  },
  cardPressed: {
    opacity: 0.82,
  },
  cardSummary: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  cardTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  cardTitleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
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
    fontSize: 18,
    fontWeight: "900",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  list: {
    gap: spacing.md,
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
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 2,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  unreadCard: {
    borderColor: colors.primary,
  },
  unreadDot: {
    backgroundColor: colors.cta,
    borderRadius: 5,
    height: 10,
    marginTop: 6,
    width: 10,
  },
});
