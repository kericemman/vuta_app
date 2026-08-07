import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { colors, radii, spacing } from "../../constants/theme";
import { ProviderSummary } from "../../types/marketplace";
import {
  getInitials,
  getLocationLabel,
  getProviderCategory,
  getProviderImage,
  getProviderName,
  formatDistance,
} from "../../utils/marketplace";

type ProviderCardProps = {
  isSaved?: boolean;
  isSaving?: boolean;
  onPress?: () => void;
  onToggleSave?: () => void;
  provider: ProviderSummary;
  saveDisabled?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: "card" | "plain";
};

export function ProviderCard({
  isSaved = false,
  isSaving = false,
  onPress,
  onToggleSave,
  provider,
  saveDisabled = false,
  style,
  variant = "card",
}: ProviderCardProps) {
  const name = getProviderName(provider);
  const imageUrl = getProviderImage(provider);
  const rating = provider.averageRating || 0;
  const reviews = provider.reviewCount || 0;
  const distance = formatDistance(provider.distanceKm);
  const meta =
    provider.accountType === "business"
      ? "Beauty business"
      : getProviderCategory(provider);
  const canToggleSave = Boolean(onToggleSave && !saveDisabled && !isSaving);

  return (
    <Pressable
      accessibilityLabel={onPress ? `Open ${name}` : undefined}
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        variant === "plain" ? styles.plainCard : null,
        style,
        pressed && onPress ? styles.pressedCard : null,
      ]}
    >
      <View style={styles.imageFrame}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
        )}
        {onToggleSave ? (
          <Pressable
            accessibilityLabel={isSaved ? "Remove profile from saved" : "Save profile"}
            accessibilityRole="button"
            disabled={!canToggleSave}
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onToggleSave();
            }}
            style={({ pressed }) => [
              styles.saveButton,
              isSaved ? styles.savedButton : null,
              !canToggleSave ? styles.disabledSaveButton : null,
              pressed && canToggleSave ? styles.pressedSaveButton : null,
            ]}
          >
            <Ionicons
              color={isSaved ? colors.surface : colors.primary}
              name={isSaved ? "heart" : "heart-outline"}
              size={17}
            />
          </Pressable>
        ) : null}
      </View>
      <Text numberOfLines={1} style={styles.name}>
        {name}
      </Text>
      <Text numberOfLines={1} style={styles.meta}>
        {meta}
      </Text>
      <Text numberOfLines={1} style={styles.location}>
        {distance || getLocationLabel(provider) || "Location pending"}
      </Text>
      <View style={styles.ratingRow}>
        <View style={styles.ratingDot} />
        <Text style={styles.ratingText}>
          {rating.toFixed(1)} ({reviews})
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    gap: 4,
    padding: spacing.sm,
    width: 150,
  },
  plainCard: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: spacing.xs,
  },
  pressedCard: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  imageFrame: {
    aspectRatio: 1,
    position: "relative",
    width: "100%",
  },
  image: {
    borderRadius: radii.sm,
    height: "100%",
    width: "100%",
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  avatarText: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "800",
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
  },
  location: {
    color: colors.muted,
    fontSize: 12,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: 2,
  },
  ratingDot: {
    backgroundColor: colors.premium,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  ratingText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    right: spacing.xs,
    top: spacing.xs,
    width: 28,
    zIndex: 2,
  },
  savedButton: {
    backgroundColor: colors.primary,
  },
  disabledSaveButton: {
    opacity: 0.45,
  },
  pressedSaveButton: {
    transform: [{ scale: 0.94 }],
  },
});
