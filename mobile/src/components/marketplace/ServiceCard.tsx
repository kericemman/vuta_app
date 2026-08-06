import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../constants/theme";
import { ServiceSummary } from "../../types/marketplace";
import {
  formatDistance,
  formatMoney,
  getServiceImage,
} from "../../utils/marketplace";

type ServiceCardProps = {
  isSaved?: boolean;
  isSaving?: boolean;
  onPress?: () => void;
  onToggleSave?: () => void;
  saveDisabled?: boolean;
  service: ServiceSummary;
};

export function ServiceCard({
  isSaved = false,
  isSaving = false,
  onPress,
  onToggleSave,
  saveDisabled = false,
  service,
}: ServiceCardProps) {
  const imageUrl = getServiceImage(service);
  const canToggleSave = Boolean(onToggleSave && !saveDisabled && !isSaving);
  const distance = formatDistance(service.provider?.distanceKm);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress ? styles.pressedCard : null,
      ]}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnailFallback}>
          <Text style={styles.thumbnailText}>
            {service.category.slice(0, 2)}
          </Text>
        </View>
      )}
      {onToggleSave ? (
        <Pressable
          accessibilityLabel={
            isSaved ? "Remove profile from saved" : "Save profile"
          }
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
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.name}>
          {service.name}
        </Text>
        <Text style={styles.provider} numberOfLines={1}>
          {distance || service.provider?.businessName || "Approved profile"}
        </Text>
        <Text style={styles.price}>
          From {formatMoney(service.currency, service.price)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
    position: "relative",
    width: 210,
  },
  pressedCard: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  thumbnail: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 70,
    width: 70,
  },
  thumbnailFallback: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 70,
    justifyContent: "center",
    width: 70,
  },
  thumbnailText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  provider: {
    color: colors.muted,
    fontSize: 12,
  },
  price: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    left: spacing.xs,
    top: spacing.xs,
    width: 28,
    zIndex: 2,
  },
  savedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabledSaveButton: {
    opacity: 0.45,
  },
  pressedSaveButton: {
    transform: [{ scale: 0.94 }],
  },
});
