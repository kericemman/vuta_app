import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "../constants/theme";
import { useNavigationHistoryStore } from "../store/navigationHistory.store";

type BackButtonProps = {
  label?: string;
  onPress?: () => void;
};

export function BackButton({ label, onPress }: BackButtonProps) {
  const { t } = useTranslation();
  const displayLabel = label ?? t("actions.back");
  const handlePress =
    onPress ||
    (() => {
      const previousHref =
        useNavigationHistoryStore.getState().popBackTarget();

      if (previousHref) {
        router.replace(previousHref as Href);
        return;
      }

      if (router.canGoBack()) {
        router.back();
      }
    });

  return (
    <Pressable
      accessibilityLabel={t("actions.goBack")}
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.pressedButton : null,
      ]}
    >
      <Ionicons color={colors.primary} name="chevron-back" size={16} />
      {displayLabel ? <Text style={styles.label}>{displayLabel}</Text> : null}
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
