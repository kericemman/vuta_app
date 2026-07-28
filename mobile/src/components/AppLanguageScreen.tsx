import { Ionicons } from "@expo/vector-icons";
import * as Localization from "expo-localization";
import * as SecureStore from "expo-secure-store";
import ISO6391 from "iso-639-1";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BackButton } from "./BackButton";
import { Screen } from "./Screen";
import { colors, radii, spacing } from "../constants/theme";

const LANGUAGE_KEY = "vuta.app.language";

type AfricanLanguage = {
  code: string;
  fallbackName?: string;
  fallbackNativeName?: string;
  region: string;
};

const africanLanguages: AfricanLanguage[] = [
  { code: "en", region: "Widely used" },
  { code: "sw", region: "East Africa" },
  { code: "ar", region: "North Africa, Sudan, Sahel" },
  { code: "fr", region: "West, Central, North Africa" },
  { code: "pt", region: "Angola, Mozambique, Guinea-Bissau" },
  { code: "ha", region: "West Africa" },
  { code: "am", region: "Ethiopia" },
  { code: "yo", region: "Nigeria, Benin, Togo" },
  { code: "ig", region: "Nigeria" },
  { code: "om", region: "Ethiopia, Kenya" },
  { code: "so", region: "Somalia, Djibouti, Ethiopia, Kenya" },
  { code: "rw", region: "Rwanda, Great Lakes" },
  { code: "rn", region: "Burundi, Great Lakes" },
  { code: "ln", region: "DR Congo, Congo, Central Africa" },
  { code: "lg", region: "Uganda" },
  { code: "ak", region: "Ghana, Ivory Coast" },
  { code: "ff", region: "West and Central Africa" },
  { code: "wo", region: "Senegal, Gambia, Mauritania" },
  { code: "bm", region: "Mali, West Africa" },
  { code: "ee", region: "Ghana, Togo" },
  { code: "mg", region: "Madagascar" },
  { code: "sn", region: "Zimbabwe, Southern Africa" },
  { code: "st", region: "Lesotho, South Africa" },
  { code: "tn", region: "Botswana, South Africa" },
  { code: "xh", region: "South Africa" },
  { code: "zu", region: "South Africa" },
  { code: "af", region: "South Africa, Namibia" },
  { code: "ti", region: "Eritrea, Ethiopia" },
  { code: "ny", region: "Malawi, Zambia, Mozambique" },
  { code: "ts", region: "Mozambique, South Africa" },
  { code: "ve", region: "South Africa, Zimbabwe" },
];

const getLanguageName = (language: AfricanLanguage) =>
  ISO6391.getName(language.code) || language.fallbackName || language.code;

const getNativeLanguageName = (language: AfricanLanguage) =>
  ISO6391.getNativeName(language.code) ||
  language.fallbackNativeName ||
  getLanguageName(language);

export function AppLanguageScreen() {
  const deviceLanguage = Localization.getLocales()[0]?.languageCode || "en";
  const supportedDeviceLanguage = africanLanguages.some(
    (language) => language.code === deviceLanguage
  )
    ? deviceLanguage
    : "en";
  const [selectedLanguage, setSelectedLanguage] = useState(
    supportedDeviceLanguage
  );

  useEffect(() => {
    SecureStore.getItemAsync(LANGUAGE_KEY).then((value) => {
      if (value) {
        setSelectedLanguage(value);
      }
    });
  }, []);

  const selectedLanguageName = useMemo(() => {
    const selected = africanLanguages.find(
      (language) => language.code === selectedLanguage
    );

    return selected ? getLanguageName(selected) : "English";
  }, [selectedLanguage]);

  const selectLanguage = async (value: string) => {
    setSelectedLanguage(value);
    await SecureStore.setItemAsync(LANGUAGE_KEY, value);
  };

  return (
    <Screen
      fixedHeader={
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>App language</Text>
            <Text style={styles.subtitle}>
              Current selection: {selectedLanguageName}
            </Text>
          </View>
        </View>
      }
    >
      <View style={styles.notice}>
        <Ionicons color={colors.primary} name="phone-portrait-outline" size={20} />
        <Text style={styles.noticeText}>
          Suggested from your phone: {supportedDeviceLanguage.toUpperCase()}
        </Text>
      </View>

      <View style={styles.card}>
        {africanLanguages.map((language) => {
          const selected = language.code === selectedLanguage;
          const nativeName = getNativeLanguageName(language);
          const englishName = getLanguageName(language);

          return (
            <Pressable
              key={language.code}
              onPress={() => selectLanguage(language.code)}
              style={styles.languageRow}
            >
              <View style={styles.languageCopy}>
                <Text style={styles.languageText}>{nativeName}</Text>
                <Text style={styles.languageMeta}>
                  {englishName} • {language.region}
                </Text>
              </View>
              {selected ? (
                <Ionicons
                  color={colors.primary}
                  name="checkmark-circle"
                  size={22}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 2,
  },
  notice: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  noticeText: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  languageRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 68,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  languageCopy: {
    flex: 1,
    gap: 3,
  },
  languageText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  languageMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
});
