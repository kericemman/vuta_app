import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../../src/components/BackButton";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { clientPreferenceOptions } from "../../src/constants/marketplace";
import { colors, spacing } from "../../src/constants/theme";
import { getApiErrorMessage } from "../../src/services/api";
import { updateMeRequest } from "../../src/services/user.service";
import { useAuthStore } from "../../src/store/auth.store";

export default function ClientPreferencesScreen() {
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);

  useEffect(() => {
    setPreferences(user?.preferences || []);
  }, [user?.preferences]);

  const togglePreference = (preference: string) => {
    setPreferences((current) =>
      current.includes(preference)
        ? current.filter((item) => item !== preference)
        : [...current, preference]
    );
  };

  const savePreferences = async () => {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const updatedUser = await updateMeRequest({ preferences });
      await setUser(updatedUser);
      setMessage("Preferences updated.");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen
      fixedHeader={
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Beauty preferences</Text>
            <Text style={styles.subtitle}>
              Choose what you want Vuta to prioritize for you.
            </Text>
          </View>
        </View>
      }
    >
      <View style={styles.card}>
        <View style={styles.preferenceGrid}>
          {clientPreferenceOptions.map((preference) => {
            const selected = preferences.includes(preference);

            return (
              <Pressable
                key={preference}
                onPress={() => togglePreference(preference)}
                style={[
                  styles.preferenceChip,
                  selected ? styles.selectedPreferenceChip : null,
                ]}
              >
                <Ionicons
                  color={selected ? colors.surface : colors.primary}
                  name={selected ? "checkmark-circle" : "add-circle-outline"}
                  size={18}
                />
                <Text
                  style={[
                    styles.preferenceText,
                    selected ? styles.selectedPreferenceText : null,
                  ]}
                >
                  {preference}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}

      <PrimaryButton
        label="Save preferences"
        loading={isSaving}
        onPress={savePreferences}
      />
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
    lineHeight: 20,
    marginTop: 2,
  },
  card: {
    paddingVertical: spacing.xs,
  },
  preferenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  preferenceChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedPreferenceChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  preferenceText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  selectedPreferenceText: {
    color: colors.surface,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  success: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "700",
  },
});
