import { StyleSheet, Text } from "react-native";
import { BrandLogo } from "../src/components/BrandLogo";
import { DashboardCard } from "../src/components/DashboardCard";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { Screen } from "../src/components/Screen";
import { colors, spacing } from "../src/constants/theme";
import { useAuthStore } from "../src/store/auth.store";

export default function AdminNoticeScreen() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <Screen scroll={false}>
      <BrandLogo size={82} style={styles.logo} />
      <DashboardCard title="Admin is web-only">
        <Text style={styles.body}>
          Admin management should stay on the website dashboard for the MVP. Use
          the mobile app for client, professional, and business flows.
        </Text>
      </DashboardCard>
      <PrimaryButton label="Log out" onPress={logout} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: {
    marginTop: spacing.xl,
  },
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
