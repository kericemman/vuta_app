import { Ionicons } from "@expo/vector-icons";
import * as Localization from "expo-localization";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BackButton } from "./BackButton";
import { Screen } from "./Screen";
import { colors, radii, spacing } from "../constants/theme";
import { changeAppLanguage } from "../i18n";
import {
  africanLanguages,
  getLanguageName,
  getNativeLanguageName,
  normalizeAppLanguageCode,
} from "../i18n/languages";
import { updateMeRequest } from "../services/user.service";
import { useAuthStore } from "../store/auth.store";

export function AppLanguageScreen() {
  const { i18n, t } = useTranslation();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const deviceLanguage = Localization.getLocales()[0]?.languageCode || "en";
  const supportedDeviceLanguage = normalizeAppLanguageCode(deviceLanguage);
  const selectedLanguage = normalizeAppLanguageCode(i18n.language);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState("");

  const selectedLanguageName = useMemo(() => {
    const selected = africanLanguages.find(
      (language) => language.code === selectedLanguage
    );

    return selected ? getLanguageName(selected) : "English";
  }, [selectedLanguage]);

  const selectLanguage = async (value: string) => {
    setSyncError("");
    setSyncMessage("");
    await changeAppLanguage(value);

    if (!user) {
      setSyncMessage(t("language.savedLocally"));
      return;
    }

    try {
      const updatedUser = await updateMeRequest({ language: value });
      await setUser(updatedUser);
      setSyncMessage(t("language.savedToAccount"));
    } catch {
      setSyncError(t("language.saveError"));
    }
  };

  return (
    <Screen
      fixedHeader={
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{t("language.title")}</Text>
            <Text style={styles.subtitle}>
              {t("language.currentSelection", {
                language: selectedLanguageName,
              })}
            </Text>
          </View>
        </View>
      }
    >
      <View style={styles.notice}>
        <Ionicons color={colors.primary} name="phone-portrait-outline" size={20} />
        <Text style={styles.noticeText}>
          {t("language.suggestedFromPhone", {
            code: supportedDeviceLanguage.toUpperCase(),
          })}
        </Text>
      </View>

      {syncMessage ? <Text style={styles.success}>{syncMessage}</Text> : null}
      {syncError ? <Text style={styles.error}>{syncError}</Text> : null}

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
  success: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700",
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
