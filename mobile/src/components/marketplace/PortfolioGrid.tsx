import { Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { colors, radii, spacing } from "../../constants/theme";
import { PortfolioImage } from "../../types/marketplace";

type PortfolioGridProps = {
  emptyMessage?: string;
  images?: PortfolioImage[];
  showEmpty?: boolean;
};

export function PortfolioGrid({
  emptyMessage = "No portfolio work has been uploaded yet.",
  images = [],
  showEmpty = false,
}: PortfolioGridProps) {
  const { width } = useWindowDimensions();
  const imageSize = Math.floor((width - spacing.lg * 2 - spacing.sm) / 2);

  if (!images.length) {
    if (!showEmpty) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {images.map((image, index) => (
        <Image
          key={`${image.url}-${index}`}
          resizeMode="cover"
          source={{ uri: image.url }}
          style={[styles.image, { height: imageSize, width: imageSize }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  image: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
