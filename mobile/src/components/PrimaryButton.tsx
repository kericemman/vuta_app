import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { colors, radii, spacing } from "../constants/theme";

type PrimaryButtonProps = {
  label: string;
  loading?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  variant?: "primary" | "secondary";
};

export function PrimaryButton({
  label,
  loading = false,
  onPress,
  style,
  variant = "primary",
}: PrimaryButtonProps) {
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary ? styles.secondary : styles.primary,
        pressed ? styles.pressed : null,
        loading ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.primary : colors.surface} />
      ) : (
        <Text style={[styles.label, isSecondary ? styles.secondaryLabel : null]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radii.md,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.7,
  },
  label: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryLabel: {
    color: colors.primary,
  },
});
