import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BackButton } from "../BackButton";
import { LoadingScreen } from "../LoadingScreen";
import { Screen } from "../Screen";
import { colors, radii, spacing } from "../../constants/theme";
import {
  appUpdateQueryKeys,
  getAppUpdate,
  markAppUpdateRead,
} from "../../services/app-update.service";
import { AppUpdateMedia } from "../../types/app-update";

export function AppUpdateDetailScreen() {
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const updateId = Array.isArray(params.id) ? params.id[0] : params.id;

  const updateQuery = useQuery({
    enabled: Boolean(updateId),
    queryFn: () => getAppUpdate(String(updateId)),
    queryKey: appUpdateQueryKeys.detail(String(updateId)),
    retry: 1,
  });

  const refreshUpdates = async () => {
    await queryClient.invalidateQueries({ queryKey: ["app-updates"] });
  };

  const markReadMutation = useMutation({
    mutationFn: markAppUpdateRead,
    onSuccess: refreshUpdates,
  });

  useEffect(() => {
    if (updateQuery.data && !updateQuery.data.readAt && updateId) {
      markReadMutation.mutate(String(updateId));
    }
  }, [updateId, updateQuery.data?.id, updateQuery.data?.readAt]);

  const update = updateQuery.data;
  const images = update?.media.filter((item) => item.type === "image") ?? [];
  const videos =
    update?.media.filter((item) => item.type === "video_link") ?? [];

  if (updateQuery.isLoading) {
    return (
      <LoadingScreen label="Opening update..." showBackButton size={82} />
    );
  }

  return (
    <Screen
      fixedHeader={
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>Vuta update</Text>
            <Text style={styles.date}>
              {formatUpdateDate(update?.publishedAt || update?.createdAt)}
            </Text>
          </View>
        </View>
      }
    >
      {!update ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Update not found</Text>
          <Text style={styles.emptyBody}>
            It may have been unpublished or is no longer available for your
            account type.
          </Text>
        </View>
      ) : null}

      {update ? (
        <View style={styles.article}>
          <Text style={styles.title}>{update.title}</Text>
          {update.summary ? (
            <Text style={styles.summary}>{update.summary}</Text>
          ) : null}

          {images.length ? (
            <View style={styles.mediaStack}>
              {images.map((item) => (
                <View key={item.url} style={styles.imageWrap}>
                  <Image source={{ uri: item.url }} style={styles.image} />
                  {item.caption ? (
                    <Text style={styles.caption}>{item.caption}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.body}>{renderBody(update.body)}</View>

          {videos.length ? (
            <View style={styles.videoStack}>
              {videos.map((item) => (
                <MediaLink key={item.url} item={item} />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

function MediaLink({ item }: { item: AppUpdateMedia }) {
  const openLink = async () => {
    const canOpen = await Linking.canOpenURL(item.url);

    if (canOpen) {
      await Linking.openURL(item.url);
    }
  };

  return (
    <Pressable
      onPress={openLink}
      style={({ pressed }) => [
        styles.videoButton,
        pressed ? styles.videoButtonPressed : null,
      ]}
    >
      <View style={styles.videoIcon}>
        <Ionicons color={colors.primary} name="play-circle-outline" size={22} />
      </View>
      <View style={styles.videoCopy}>
        <Text style={styles.videoTitle}>{item.caption || "Watch video"}</Text>
        <Text numberOfLines={1} style={styles.videoUrl}>
          {item.url}
        </Text>
      </View>
      <Ionicons color={colors.muted} name="open-outline" size={18} />
    </Pressable>
  );
}

const renderBody = (body: string) =>
  body
    .split("\n")
    .filter((line) => !line.trim().match(/^!\[.*\]\(.*\)$/))
    .map((line, index) => renderBodyLine(line, index));

const renderBodyLine = (line: string, index: number) => {
  const trimmed = line.trim();

  if (!trimmed) {
    return <View key={`space-${index}`} style={styles.bodyGap} />;
  }

  if (trimmed.startsWith("##")) {
    return (
      <Text key={`heading-${index}`} style={styles.bodyHeading}>
        {cleanInlineMarkdown(trimmed.replace(/^#+\s*/, ""))}
      </Text>
    );
  }

  if (trimmed.startsWith("- ")) {
    return (
      <View key={`bullet-${index}`} style={styles.bulletRow}>
        <Text style={styles.bulletDot}>•</Text>
        <Text style={styles.bodyText}>
          {cleanInlineMarkdown(trimmed.replace(/^-+\s*/, ""))}
        </Text>
      </View>
    );
  }

  return (
    <Text key={`paragraph-${index}`} style={styles.bodyText}>
      {cleanInlineMarkdown(trimmed)}
    </Text>
  );
};

const cleanInlineMarkdown = (text: string) =>
  text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/`/g, "");

const formatUpdateDate = (value?: string | null) => {
  if (!value) {
    return "Latest";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Latest";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const styles = StyleSheet.create({
  article: {
    gap: spacing.md,
  },
  body: {
    gap: spacing.sm,
  },
  bodyGap: {
    height: spacing.xs,
  },
  bodyHeading: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 25,
    marginTop: spacing.xs,
  },
  bodyText: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
  },
  bulletDot: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 23,
  },
  bulletRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  caption: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  date: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
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
  image: {
    aspectRatio: 16 / 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    width: "100%",
  },
  imageWrap: {
    gap: spacing.xs,
  },
  kicker: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  mediaStack: {
    gap: spacing.md,
  },
  summary: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  videoButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  videoButtonPressed: {
    opacity: 0.82,
  },
  videoCopy: {
    flex: 1,
  },
  videoIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  videoStack: {
    gap: spacing.sm,
  },
  videoTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  videoUrl: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
});
