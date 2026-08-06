import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { BackButton } from "./BackButton";
import { PrimaryButton } from "./PrimaryButton";
import { Screen } from "./Screen";
import { colors, spacing } from "../constants/theme";
import { useAuthStore } from "../store/auth.store";

export function SubscriptionScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isBusiness = user?.role === "beauty_business";
  const planName = isBusiness ? t("common.business") : t("common.professional");
  const planPrice = isBusiness ? "USD 8/month" : "USD 5/month";

  return (
    <Screen
      fixedHeader={
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{t("subscription.title")}</Text>
            <Text style={styles.subtitle}>{t("subscription.currentPlan")}</Text>
          </View>
        </View>
      }
    >
      <View style={styles.card}>
        <View style={styles.iconBadge}>
          <Ionicons color={colors.primary} name="sparkles" size={30} />
        </View>
        <Text style={styles.plan}>{t("subscription.plan", { plan: planName })}</Text>
        <Text style={styles.status}>{t("subscription.subscribedForMonths")}</Text>
        <Text style={styles.body}>{t("subscription.body")}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t("subscription.planPrice")}</Text>
          <Text style={styles.detailValue}>{planPrice}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t("subscription.status")}</Text>
          <Text style={styles.activeValue}>{t("common.active")}</Text>
        </View>
      </View>

      <PrimaryButton
        label={t("actions.backToProfile")}
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
    gap: spacing.sm,
    paddingVertical: spacing.sm,
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
