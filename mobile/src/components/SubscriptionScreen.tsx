import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { BackButton } from "./BackButton";
import { PrimaryButton } from "./PrimaryButton";
import { Screen } from "./Screen";
import { colors, radii, spacing } from "../constants/theme";
import { useAuthStore } from "../store/auth.store";

export function SubscriptionScreen() {
  const user = useAuthStore((state) => state.user);
  const isBusiness = user?.role === "beauty_business";
  const planName = isBusiness ? "Business" : "Professional";
  const planPrice = isBusiness ? "USD 8/month" : "USD 5/month";

  return (
    <Screen
      fixedHeader={
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Subscription</Text>
            <Text style={styles.subtitle}>Your current Vuta plan.</Text>
          </View>
        </View>
      }
    >
      <View style={styles.card}>
        <View style={styles.iconBadge}>
          <Ionicons color={colors.primary} name="sparkles" size={30} />
        </View>
        <Text style={styles.plan}>{planName} plan</Text>
        <Text style={styles.status}>You are subscribed for 3 months.</Text>
        <Text style={styles.body}>When updated, you will be notified.</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Plan price</Text>
          <Text style={styles.detailValue}>{planPrice}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <Text style={styles.activeValue}>Active</Text>
        </View>
      </View>

      <PrimaryButton
        label="Back to profile"
        onPress={() => router.push("/(provider)/profile")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  plan: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  status: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 29,
    textAlign: "center",
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  detailRow: {
    alignItems: "center",
    alignSelf: "stretch",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  activeValue: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "900",
  },
});
