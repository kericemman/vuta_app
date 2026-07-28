import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
  Flag,
} from "react-native-country-picker-modal";
import { colors, radii, spacing } from "../constants/theme";
import { getCountryName } from "../utils/countries";

type CountrySelectFieldProps = {
  countryCode: CountryCode;
  countryName: string;
  error?: string;
  label: string;
  onSelect: (country: Country) => void;
};

export function CountrySelectField({
  countryCode,
  countryName,
  error,
  label,
  onSelect,
}: CountrySelectFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setVisible(true)}
        style={[styles.button, error ? styles.inputError : null]}
      >
        <View style={styles.pickerHost}>
          <CountryPicker
            countryCode={countryCode}
            onClose={() => setVisible(false)}
            onOpen={() => setVisible(true)}
            onSelect={(country) => {
              onSelect(country);
              setVisible(false);
            }}
            preferredCountries={["KE", "UG", "TZ", "RW", "NG", "ZA", "GH"]}
            renderFlagButton={() => null}
            visible={visible}
            withCloseButton
            withEmoji={false}
            withFilter
            withFlag
            withModal
          />
        </View>
        <Flag
          countryCode={countryCode}
          flagSize={20}
          withEmoji={false}
          withFlagButton
        />
        <Text style={styles.countryText}>{countryName}</Text>
        <Text style={styles.actionText}>Change</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function getSelectedCountryName(country: Country) {
  return getCountryName(country);
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
  button: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  pickerHost: {
    height: 1,
    width: 1,
  },
  countryText: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
  },
  actionText: {
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
  },
});
