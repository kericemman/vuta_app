import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../constants/theme";
import { roleLabels } from "../constants/roles";
import { User } from "../types/auth";

type ProfileSummaryProps = {
  user: User;
};

export function ProfileSummary({ user }: ProfileSummaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.meta}>{roleLabels[user.role]}</Text>
      <Text style={styles.meta}>{user.phone}</Text>
      {user.email ? <Text style={styles.meta}>{user.email}</Text> : null}
      {[user.area, user.city, user.country].filter(Boolean).length ? (
        <Text style={styles.meta}>
          {[user.area, user.city, user.country].filter(Boolean).join(", ")}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  meta: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
