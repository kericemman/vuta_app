import { router } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { ProviderCard } from "../../src/components/marketplace/ProviderCard";
import { Screen } from "../../src/components/Screen";
import { colors, spacing } from "../../src/constants/theme";
import { useSavedProviders } from "../../src/hooks/useSavedProviders";
import { getGridItemWidth } from "../../src/utils/responsiveGrid";

const openProviderDetails = (providerId: string) =>
  router.push({
    pathname: "/(client)/providers/[id]",
    params: { id: providerId },
  });

export default function SavedScreen() {
  const { width } = useWindowDimensions();
  const { favourites, isLoading } = useSavedProviders();
  const providerCardWidth = getGridItemWidth(width, 2);

  if (isLoading) {
    return (
      <LoadingScreen
        label="Loading saved profiles..."
        showBackButton
        size={82}
      />
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>
          Keep favourite professionals close for later booking.
        </Text>
      </View>

      {favourites.length ? (
        <View style={styles.savedSection}>
          <View style={styles.sectionDivider} />
          <View style={styles.grid}>
            {favourites.map((favourite) => (
              <ProviderCard
                key={favourite._id}
                onPress={() => openProviderDetails(favourite.provider._id)}
                provider={favourite.provider}
                style={{ width: providerCardWidth }}
                variant="plain"
              />
            ))}
          </View>
        </View>
      ) : null}

      {!favourites.length ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No saved profiles yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart on any service card to save its professional here.
          </Text>
          <Pressable
            onPress={() => router.push("/(client)/explore")}
            style={({ pressed }) => [
              styles.browseButton,
              pressed ? styles.browseButtonPressed : null,
            ]}
          >
            <Text style={styles.browseButtonText}>Browse services</Text>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  savedSection: {
    gap: spacing.md,
  },
  sectionDivider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
  },
  emptyState: {
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  browseButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  browseButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "700",
  },
});
