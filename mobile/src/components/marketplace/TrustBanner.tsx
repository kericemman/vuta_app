import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../constants/theme";
import { AdCardCarousel } from "../marketing/AdCardCarousel";

export function TrustBanner() {
  return (
    <AdCardCarousel
      fallback={<FallbackTrustBanner />}
      placement="client_home"
      variant="imageOnly"
    />
  );
}

function FallbackTrustBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.copy}>
        <Text style={styles.title}>Quality you can trust</Text>
        <Text style={styles.body}>
          Browse vetted professionals, reviewed work, and clear service prices.
        </Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Vetted</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 132,
    padding: spacing.lg,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 28,
  },
  body: {
    color: colors.background,
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.premium,
    borderRadius: 42,
    height: 84,
    justifyContent: "center",
    width: 84,
  },
  badgeText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
});
