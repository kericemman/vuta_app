import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "../constants/theme";

type BackButtonProps = {
  label?: string;
  onPress?: () => void;
};

export function BackButton({ label = "Back", onPress }: BackButtonProps) {
  const handlePress =
    onPress ||
    (() => {
      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace("/");
    });

  return (
    <Pressable
      accessibilityLabel="Go back"
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.pressedButton : null,
      ]}
    >
      <Ionicons color={colors.primary} name="chevron-back" size={16} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 1,
    minHeight: 30,
    justifyContent: "center",
    paddingRight: spacing.sm,
  },
  label: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  pressedButton: {
    opacity: 0.65,
  },
});
