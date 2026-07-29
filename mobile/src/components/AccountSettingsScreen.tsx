import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { BackButton } from "./BackButton";
import { Screen } from "./Screen";
import { colors, radii, spacing } from "../constants/theme";
import { useUpdateUnreadCount } from "../hooks/useUpdateUnreadCount";
import { getApiErrorMessage } from "../services/api";
import { deleteMeRequest } from "../services/user.service";
import { useAuthStore } from "../store/auth.store";

const providerRoles = ["beauty_professional", "beauty_business"];

export function AccountSettingsScreen() {
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const setSession = useAuthStore((state) => state.setSession);
  const user = useAuthStore((state) => state.user);
  const updates = useUpdateUnreadCount();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const isProvider = Boolean(user && providerRoles.includes(user.role));
  const profileRoute = isProvider ? "/(provider)/profile" : "/(client)/profile";
  const languageRoute = isProvider ? "/(provider)/language" : "/(client)/language";

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      t("account.deleteAccountConfirmTitle"),
      t("account.deleteAccountConfirmBody"),
      [
        { style: "cancel", text: t("actions.cancel") },
        {
          onPress: deleteAccount,
          style: "destructive",
          text: t("actions.delete"),
        },
      ]
    );
  };

  const deleteAccount = async () => {
    setError("");
    setIsDeleting(true);

    try {
      await deleteMeRequest();
      await setSession(null);
      router.replace("/(auth)/register");
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Screen
      fixedHeader={
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{t("account.settings")}</Text>
            <Text style={styles.subtitle}>{t("profile.settingsSubtitle")}</Text>
          </View>
        </View>
      }
    >
      <Pressable
        onPress={() => router.push(profileRoute)}
        style={({ pressed }) => [
          styles.profileCard,
          pressed ? styles.pressed : null,
        ]}
      >
        <View style={styles.profileIcon}>
          <Ionicons color={colors.primary} name="person-outline" size={26} />
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.profileTitle}>{t("account.profile")}</Text>
          <Text numberOfLines={1} style={styles.profileMeta}>
            {user?.name || t("profile.openYourProfile")}
          </Text>
        </View>
        <Ionicons color={colors.muted} name="chevron-forward" size={20} />
      </Pressable>

      <View style={styles.menuCard}>
        {isProvider ? (
          <SettingsMenuItem
            icon="card-outline"
            label={t("account.subscription")}
            meta={t("profile.subscriptionMeta")}
            onPress={() => router.push("/(provider)/subscription")}
          />
        ) : null}
        <SettingsMenuItem
          icon="language-outline"
          label={t("account.appLanguage")}
          meta={t("account.chooseLanguage")}
          onPress={() => router.push(languageRoute)}
        />
        <SettingsMenuItem
          badge={updates.badge}
          icon="newspaper-outline"
          label={t("account.updates")}
          meta={
            updates.unreadCount
              ? t("common.unreadCount", { count: updates.unreadCount })
              : t("account.latestAnnouncements")
          }
          onPress={() => router.push("/updates")}
        />
      </View>

      <View style={styles.menuCard}>
        <SettingsMenuItem
          icon="log-out-outline"
          label={t("account.logout")}
          meta={t("account.signOutDevice")}
          onPress={handleLogout}
        />
        <SettingsMenuItem
          danger
          icon="trash-outline"
          label={
            isDeleting ? t("account.deletingAccount") : t("account.deleteAccount")
          }
          meta={t("account.closeAccount")}
          onPress={confirmDeleteAccount}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

type SettingsMenuItemProps = {
  badge?: string;
  danger?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  meta?: string;
  onPress: () => void;
};

function SettingsMenuItem({
  badge,
  danger,
  icon,
  label,
  meta,
  onPress,
}: SettingsMenuItemProps) {
  return (
    <Pressable
      disabled={label === "Deleting account..."}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={[styles.menuIcon, danger ? styles.dangerIcon : null]}>
        <Ionicons
          color={danger ? colors.danger : colors.primary}
          name={icon}
          size={20}
        />
      </View>
      <View style={styles.menuCopy}>
        <Text style={[styles.menuLabel, danger ? styles.dangerText : null]}>
          {label}
        </Text>
        {meta ? <Text style={styles.menuMeta}>{meta}</Text> : null}
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons color={colors.muted} name="chevron-forward" size={18} />
    </Pressable>
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
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  profileIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  profileCopy: {
    flex: 1,
    gap: 3,
  },
  profileTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  profileMeta: {
    color: colors.muted,
    fontSize: 13,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  menuItem: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 62,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  menuIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  dangerIcon: {
    backgroundColor: "#FEE2E2",
  },
  menuCopy: {
    flex: 1,
    gap: 3,
  },
  menuLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  dangerText: {
    color: colors.danger,
  },
  menuMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.cta,
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "900",
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
});
