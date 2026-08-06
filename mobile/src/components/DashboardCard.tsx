import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../constants/theme";

type DashboardCardProps = {
  children: ReactNode;
  title: string;
};

export function DashboardCard({ children, title }: DashboardCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.divider} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
  },
  divider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
  },
});
