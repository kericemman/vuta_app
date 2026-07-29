import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { colors, radii, spacing } from "../constants/theme";

type TextFieldProps = TextInputProps & {
  error?: string;
  label: string;
};

export function TextField({
  error,
  label,
  secureTextEntry,
  style,
  ...props
}: TextFieldProps) {
  const { t } = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const canTogglePassword = Boolean(secureTextEntry);
  const inputSecureTextEntry = canTogglePassword
    ? !isPasswordVisible
    : secureTextEntry;

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      {canTogglePassword ? (
        <View style={[styles.secureInput, error ? styles.inputError : null]}>
          <TextInput
            autoCapitalize="none"
            placeholderTextColor={colors.muted}
            secureTextEntry={inputSecureTextEntry}
            style={[styles.secureTextInput, style]}
            {...props}
          />
          <Pressable
            accessibilityLabel={
              isPasswordVisible
                ? `${t("actions.hide")} ${label}`
                : `${t("actions.show")} ${label}`
            }
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setIsPasswordVisible((value) => !value)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {isPasswordVisible ? t("actions.hide") : t("actions.show")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <TextInput
          autoCapitalize="none"
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry}
          style={[styles.input, error ? styles.inputError : null, style]}
          {...props}
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "400",
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  secureInput: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 50,
  },
  secureTextInput: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    minHeight: 50,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  toggleButton: {
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  toggleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "400",
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginTop: -spacing.sm,
  },
});
