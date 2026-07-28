import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
  Flag,
} from "react-native-country-picker-modal";
import { colors, radii, spacing } from "../constants/theme";

type PhoneNumberFieldProps = TextInputProps & {
  callingCode: string;
  countryCode: CountryCode;
  error?: string;
  label: string;
  onCountrySelect: (country: Country) => void;
};

export function PhoneNumberField({
  callingCode,
  countryCode,
  error,
  label,
  onCountrySelect,
  style,
  ...props
}: PhoneNumberFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, error ? styles.inputError : null]}>
        <Pressable onPress={() => setVisible(true)} style={styles.codeButton}>
          <CountryPicker
            countryCode={countryCode}
            onClose={() => setVisible(false)}
            onOpen={() => setVisible(true)}
            onSelect={(country) => {
              onCountrySelect(country);
              setVisible(false);
            }}
            preferredCountries={["KE", "UG", "TZ", "RW", "NG", "ZA", "GH"]}
            renderFlagButton={() => null}
            visible={visible}
            withCallingCode
            withCloseButton
            withEmoji={false}
            withFilter
            withFlag
            withModal
          />
          <Flag
            countryCode={countryCode}
            flagSize={18}
            withEmoji={false}
            withFlagButton
          />
          <Text style={styles.callingCode}>+{callingCode}</Text>
        </Pressable>
        <TextInput
          autoCapitalize="none"
          keyboardType="phone-pad"
          placeholderTextColor={colors.muted}
          style={[styles.input, style]}
          {...props}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "400",
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 50,
  },
  codeButton: {
    alignItems: "center",
    borderRightColor: colors.border,
    borderRightWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 50,
    paddingHorizontal: spacing.sm,
  },
  callingCode: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "400",
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
