import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "./BrandLogo";
import { PrimaryButton } from "./PrimaryButton";
import { colors, radii, spacing } from "../constants/theme";
import { AppSecurityConfig } from "../types/app-config";

type SafeModeScreenProps = {
  error?: string | null;
  isLoading?: boolean;
  onRetry: () => void;
  security: AppSecurityConfig;
};

const getTitle = (mode: AppSecurityConfig["mode"]) => {
  if (mode === "force_update") return "Update required";
  if (mode === "incident_lockdown") return "Accounts protected";
  if (mode === "read_only") return "Read-only mode";
  return "Vuta is protecting the platform";
};

export function SafeModeScreen({
  error,
  isLoading = false,
  onRetry,
  security,
}: SafeModeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <BrandLogo size={68} />
        <View style={styles.iconBadge}>
          <Ionicons color={colors.primary} name="shield-checkmark" size={30} />
        </View>
        <Text style={styles.title}>{getTitle(security.mode)}</Text>
        <Text style={styles.body}>
          {security.message ||
            "Some Vuta services are temporarily paused while our team keeps accounts safe."}
        </Text>
        {security.incidentId ? (
          <Text style={styles.meta}>Incident ID: {security.incidentId}</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={isLoading ? "Checking..." : "Check again"}
          loading={isLoading}
          onPress={onRetry}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 430,
    padding: spacing.lg,
    width: "100%",
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  meta: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
