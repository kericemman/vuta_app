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
  onPress?: () => void;
  provider: ProviderSummary;
  style?: StyleProp<ViewStyle>;
};

export function ProviderCard({ onPress, provider, style }: ProviderCardProps) {
  const name = getProviderName(provider);
  const imageUrl = getProviderImage(provider);
  const rating = provider.averageRating || 0;
  const reviews = provider.reviewCount || 0;
  const distance = formatDistance(provider.distanceKm);
  const meta =
    provider.accountType === "business"
      ? "Beauty business"
      : getProviderCategory(provider);

  return (
    <Pressable
      accessibilityLabel={onPress ? `Open ${name}` : undefined}
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        style,
        pressed && onPress ? styles.pressedCard : null,
      ]}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>
      )}
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
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 4,
    padding: spacing.sm,
    width: 150,
  },
  pressedCard: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  image: {
    aspectRatio: 1,
    borderRadius: radii.sm,
    width: "100%",
  },
  avatar: {
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
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
});
