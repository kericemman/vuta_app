import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing } from "../../constants/theme";
import { PortfolioImage } from "../../types/marketplace";
import { getGridItemWidth } from "../../utils/responsiveGrid";

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
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const contentWidth = Math.max(280, width - spacing.sm * 2);
  const featuredHeight = Math.round(contentWidth * 0.72);
  const imageSize = getGridItemWidth(width, 2);
  const selectedIndex = viewerIndex ?? 0;
  const featuredImage = images[0];
  const gridImages = images.slice(1);

  const closeViewer = () => setViewerIndex(null);
  const openViewer = (index: number) => setViewerIndex(index);

  const handleViewerScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width || width;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);

    setViewerIndex(Math.min(Math.max(nextIndex, 0), images.length - 1));
  };

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
    <>
      <View style={styles.gallery}>
        <Pressable
          accessibilityLabel="Open featured portfolio image"
          onPress={() => openViewer(0)}
          style={({ pressed }) => [
            styles.featuredCard,
            { height: featuredHeight },
            pressed ? styles.pressedImage : null,
          ]}
        >
          <Image
            resizeMode="cover"
            source={{ uri: featuredImage.url }}
            style={styles.featuredImage}
          />
          <View style={styles.featuredMeta}>
            <Text style={styles.counter}>
              1 / {images.length}
            </Text>
            {featuredImage.caption ? (
              <Text numberOfLines={1} style={styles.featuredCaption}>
                {featuredImage.caption}
              </Text>
            ) : null}
          </View>
        </Pressable>

        {gridImages.length ? (
          <View style={styles.grid}>
            {gridImages.map((image, index) => (
              <Pressable
                accessibilityLabel={`Open portfolio image ${index + 2}`}
                key={`${image.url}-${index}`}
                onPress={() => openViewer(index + 1)}
                style={({ pressed }) => [
                  styles.thumbnailCard,
                  { height: imageSize, width: imageSize },
                  pressed ? styles.pressedImage : null,
                ]}
              >
                <Image
                  resizeMode="cover"
                  source={{ uri: image.url }}
                  style={styles.image}
                />
                {image.caption ? (
                  <View style={styles.thumbnailCaptionOverlay}>
                    <Text numberOfLines={1} style={styles.thumbnailCaption}>
                      {image.caption}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <Modal
        animationType="fade"
        onRequestClose={closeViewer}
        presentationStyle="fullScreen"
        visible={viewerIndex !== null}
      >
        {viewerIndex !== null ? (
          <SafeAreaView style={styles.viewer}>
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerCounter}>
                {selectedIndex + 1} of {images.length}
              </Text>
              <Pressable
                accessibilityLabel="Close portfolio viewer"
                onPress={closeViewer}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed ? styles.pressedCloseButton : null,
                ]}
              >
                <Ionicons color={colors.surface} name="close" size={22} />
              </Pressable>
            </View>

            <FlatList
              data={images}
              getItemLayout={(_, index) => ({
                index,
                length: width,
                offset: width * index,
              })}
              horizontal
              initialScrollIndex={selectedIndex}
              keyExtractor={(image, index) => `${image.url}-${index}`}
              onMomentumScrollEnd={handleViewerScroll}
              pagingEnabled
              renderItem={({ item }) => (
                <View style={[styles.viewerSlide, { width }]}>
                  <Image
                    resizeMode="contain"
                    source={{ uri: item.url }}
                    style={styles.viewerImage}
                  />
                  {item.caption ? (
                    <Text style={styles.viewerCaption}>{item.caption}</Text>
                  ) : null}
                </View>
              )}
              showsHorizontalScrollIndicator={false}
            />

            {images.length > 1 ? (
              <View style={styles.viewerDots}>
                {images.map((image, index) => (
                  <View
                    key={`${image.url}-dot-${index}`}
                    style={[
                      styles.viewerDot,
                      index === selectedIndex ? styles.activeViewerDot : null,
                    ]}
                  />
                ))}
              </View>
            ) : null}
          </SafeAreaView>
        ) : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  gallery: {
    gap: spacing.sm,
  },
  featuredCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  featuredImage: {
    height: "100%",
    width: "100%",
  },
  featuredMeta: {
    backgroundColor: "rgba(33, 26, 32, 0.74)",
    bottom: 0,
    gap: 2,
    left: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: "absolute",
    right: 0,
  },
  counter: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "800",
  },
  featuredCaption: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  thumbnailCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  thumbnailCaptionOverlay: {
    backgroundColor: "rgba(33, 26, 32, 0.68)",
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: "absolute",
    right: 0,
  },
  thumbnailCaption: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "700",
  },
  pressedImage: {
    opacity: 0.82,
  },
  emptyState: {
    paddingVertical: spacing.sm,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  viewer: {
    backgroundColor: colors.text,
    flex: 1,
  },
  viewerHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  viewerCounter: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "800",
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  pressedCloseButton: {
    backgroundColor: "rgba(255, 255, 255, 0.24)",
  },
  viewerSlide: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: spacing.lg,
  },
  viewerImage: {
    flex: 1,
    width: "100%",
  },
  viewerCaption: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    textAlign: "center",
  },
  viewerDots: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  viewerDot: {
    backgroundColor: "rgba(255, 255, 255, 0.32)",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  activeViewerDot: {
    backgroundColor: colors.surface,
    width: 22,
  },
});
