import { useQuery } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import {
  ImageBackground,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { colors, radii, spacing } from "../../constants/theme";
import { listAdCards } from "../../services/ad-card.service";
import { AdCard, AdPlacement } from "../../types/ad-card";
import { LogoLoader } from "../BrandLogo";

type AdCardCarouselProps = {
  fallback?: ReactNode;
  placement: AdPlacement;
  variant?: "imageOnly" | "marketing";
};

export function AdCardCarousel({
  fallback,
  placement,
  variant = "marketing",
}: AdCardCarouselProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = Math.max(width - spacing.lg * 2, 280);

  const adCardsQuery = useQuery({
    queryKey: ["ad-cards", placement],
    queryFn: () => listAdCards(placement),
    retry: 1,
    staleTime: 60_000,
  });

  const adCards = adCardsQuery.data ?? [];

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setActiveIndex(nextIndex);
  };

  if (adCardsQuery.isLoading) {
    return (
      <View style={[styles.loadingCard, { width: cardWidth }]}>
        <LogoLoader label="Loading offers..." size={36} />
      </View>
    );
  }

  if (!adCards.length) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={handleScrollEnd}
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        snapToInterval={cardWidth}
        style={[styles.scroller, { width: cardWidth }]}
      >
        {adCards.map((adCard) => (
          <AdCarouselCard
            adCard={adCard}
            cardWidth={cardWidth}
            key={adCard.id}
            variant={variant}
          />
        ))}
      </ScrollView>

      {adCards.length > 1 ? (
        <View style={styles.dots}>
          {adCards.map((adCard, index) => (
            <View
              key={adCard.id}
              style={[
                styles.dot,
                index === activeIndex ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

type AdCarouselCardProps = {
  adCard: AdCard;
  cardWidth: number;
  variant: "imageOnly" | "marketing";
};

function AdCarouselCard({ adCard, cardWidth, variant }: AdCarouselCardProps) {
  const isMarketing = variant === "marketing";
  const isClickable = isMarketing && Boolean(adCard.ctaUrl);

  const handlePress = async () => {
    if (isClickable && adCard.ctaUrl) {
      await Linking.openURL(adCard.ctaUrl);
    }
  };

  return (
    <Pressable
      accessibilityRole={isClickable ? "link" : "image"}
      disabled={!isClickable}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { width: cardWidth },
        isClickable && pressed ? styles.pressedCard : null,
      ]}
    >
      <ImageBackground
        imageStyle={styles.image}
        source={{ uri: adCard.imageUrl }}
        style={styles.imageBackground}
      >
        {isMarketing ? (
          <View style={styles.overlay}>
            <View style={styles.copy}>
              <Text numberOfLines={2} style={styles.title}>
                {adCard.title}
              </Text>
              {adCard.subtitle ? (
                <Text numberOfLines={2} style={styles.subtitle}>
                  {adCard.subtitle}
                </Text>
              ) : null}
            </View>
            {adCard.ctaUrl ? (
              <View style={styles.cta}>
                <Text style={styles.ctaText}>
                  {adCard.ctaText || "Learn more"}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
  },
  scroller: {},
  card: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    height: 188,
    overflow: "hidden",
  },
  pressedCard: {
    opacity: 0.92,
  },
  imageBackground: {
    flex: 1,
  },
  image: {
    resizeMode: "cover",
  },
  overlay: {
    backgroundColor: "rgba(33, 26, 32, 0.42)",
    flex: 1,
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  copy: {
    gap: spacing.sm,
    maxWidth: "82%",
  },
  title: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 29,
  },
  subtitle: {
    color: colors.background,
    fontSize: 14,
    lineHeight: 20,
  },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: colors.premium,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ctaText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
  },
  dot: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 18,
  },
  loadingCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 188,
    justifyContent: "center",
  },
});
