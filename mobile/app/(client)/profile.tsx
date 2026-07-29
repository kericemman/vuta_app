import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppVersionText } from "../../src/components/AppVersionText";
import { DashboardCard } from "../../src/components/DashboardCard";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { TextField } from "../../src/components/TextField";
import { VUTA_DOWNLOAD_URL } from "../../src/constants/links";
import { colors, radii, spacing } from "../../src/constants/theme";
import { useUpdateUnreadCount } from "../../src/hooks/useUpdateUnreadCount";
import { getApiErrorMessage } from "../../src/services/api";
import {
  updateMeRequest,
  uploadProfileImageRequest,
} from "../../src/services/user.service";
import { useAuthStore } from "../../src/store/auth.store";

export default function ClientProfileScreen() {
  const { t } = useTranslation();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const updates = useUpdateUnreadCount();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setEmail(user.email || "");
    setName(user.name || "");
    setPhone(user.phone || "");
  }, [user]);

  const initials = useMemo(() => {
    return (
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "V"
    );
  }, [name]);

  const pickProfileImage = async () => {
    setError("");
    setMessage("");

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError(t("profile.photoPermission"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.82,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    setIsUploading(true);

    try {
      const upload = await uploadProfileImageRequest(result.assets[0]);
      await setUser(upload.user);
      setMessage(t("profile.profilePictureUpdated"));
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async () => {
    setError("");
    setMessage("");

    if (!name.trim() || !phone.trim()) {
      setError(t("profile.namePhoneRequired"));
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = await updateMeRequest({
        name: name.trim(),
        phone: phone.trim(),
      });

      await setUser(updatedUser);
      setIsEditing(false);
      setMessage(t("profile.profileUpdated"));
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const inviteFriend = async () => {
    await Share.share({
      message:
        `I am using Vuta to discover trusted beauty professionals and book beauty services with ease. Join me on Vuta: ${VUTA_DOWNLOAD_URL}`,
    });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.identityRow}>
          <Pressable onPress={pickProfileImage} style={styles.avatarButton}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons color={colors.surface} name="camera" size={14} />
            </View>
          </Pressable>

          <View style={styles.identityCopy}>
            <Text numberOfLines={1} style={styles.name}>
              {name || t("profile.yourProfile")}
            </Text>
            <Text numberOfLines={1} style={styles.meta}>
              {phone}
            </Text>
            {isUploading ? (
              <Text style={styles.uploading}>{t("profile.uploadingPhoto")}</Text>
            ) : null}
          </View>

          <Pressable
            onPress={() => setIsEditing((value) => !value)}
            style={styles.editButton}
          >
            <Ionicons
              color={colors.primary}
              name={isEditing ? "close" : "create-outline"}
              size={18}
            />
            <Text style={styles.editText}>
              {isEditing ? t("actions.cancel") : t("actions.edit")}
            </Text>
          </Pressable>
        </View>
      </View>

      {isEditing ? (
        <DashboardCard title={t("profile.editAccount")}>
          <TextField label={t("auth.fullName")} onChangeText={setName} value={name} />
          <TextField
            editable={false}
            keyboardType="email-address"
            label={t("auth.email")}
            placeholder="you@example.com"
            style={styles.lockedInput}
            value={email}
          />
          <Text style={styles.helperText}>
            {t("profile.emailLocked")}
          </Text>
          <TextField
            keyboardType="phone-pad"
            label={t("profile.phoneNumber")}
            onChangeText={setPhone}
            value={phone}
          />
          <PrimaryButton
            label={t("profile.saveChanges")}
            loading={isSaving}
            onPress={saveProfile}
          />
        </DashboardCard>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}

      <View style={styles.menu}>
        <ProfileMenuItem
          icon="sparkles-outline"
          label={t("profile.beautyPreferences")}
          meta={
            user?.preferences?.length
              ? t("profile.selectedCount", {
                  count: user.preferences.length,
                })
              : t("profile.chooseWhatYouLike")
          }
          onPress={() => router.push("/(client)/preferences")}
        />
        <ProfileMenuItem
          icon="language-outline"
          label={t("account.appLanguage")}
          meta={t("account.choosePreferredAppLanguage")}
          onPress={() => router.push("/(client)/language")}
        />
        <ProfileMenuItem
          icon="person-add-outline"
          label={t("account.inviteAFriend")}
          meta={t("account.inviteFriendMeta")}
          onPress={inviteFriend}
        />
        <ProfileMenuItem
          icon="chatbox-ellipses-outline"
          label={t("account.feedback")}
          meta={t("account.tellUsImprove")}
          onPress={() => router.push("/(client)/feedback")}
        />
        <ProfileMenuItem
          icon="settings-outline"
          label={t("account.settings")}
          meta={t("profile.accountAccessSafety")}
          onPress={() => router.push("/(client)/settings")}
        />
        <ProfileMenuItem
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
      <AppVersionText />
    </Screen>
  );
}

type ProfileMenuItemProps = {
  badge?: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  meta?: string;
  onPress: () => void;
};

function ProfileMenuItem({
  badge,
  icon,
  label,
  meta,
  onPress,
}: ProfileMenuItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <View style={styles.menuIcon}>
        <Ionicons color={colors.primary} name={icon} size={20} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={styles.menuLabel}>{label}</Text>
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
    marginTop: spacing.lg,
  },
  identityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  avatarButton: {
    position: "relative",
  },
  avatar: {
    borderRadius: 35,
    height: 70,
    width: 70,
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 35,
    height: 70,
    justifyContent: "center",
    width: 70,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  cameraBadge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.surface,
    borderRadius: 13,
    borderWidth: 2,
    bottom: -1,
    height: 26,
    justifyContent: "center",
    position: "absolute",
    right: -1,
    width: 26,
  },
  identityCopy: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
  },
  uploading: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  lockedInput: {
    backgroundColor: colors.surfaceMuted,
    color: colors.muted,
  },
  helperText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: -spacing.sm,
  },
  editButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  editText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
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
  menu: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.md,
  },
  menuIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  menuCopy: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  menuMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.cta,
    borderRadius: 12,
    minWidth: 24,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "900",
  },
});
