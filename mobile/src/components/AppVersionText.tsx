import Constants from "expo-constants";
import { StyleSheet, Text } from "react-native";
import { colors, spacing } from "../constants/theme";

const appVersion =
  Constants.expoConfig?.version ||
  Constants.nativeAppVersion ||
  "1.0.0";

export function AppVersionText() {
  return <Text style={styles.version}>Vuta v{appVersion}</Text>;
}

const styles = StyleSheet.create({
  version: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: spacing.sm,
    opacity: 0.72,
    paddingBottom: spacing.sm,
    textAlign: "center",
  },
});
