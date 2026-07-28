import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BackButton } from "../BackButton";
import { DashboardCard } from "../DashboardCard";
import { LoadingScreen } from "../LoadingScreen";
import { PrimaryButton } from "../PrimaryButton";
import { Screen } from "../Screen";
import { TextField } from "../TextField";
import {
  defaultAvailability,
  providerCategories,
  serviceModes,
} from "../../constants/provider";
import { colors, radii, spacing } from "../../constants/theme";
import { getApiErrorMessage } from "../../services/api";
import {
  getMyProviderProfileStatus,
  upsertMyProviderProfile,
} from "../../services/provider.service";
import {
  updateMeRequest,
  uploadProfileImageRequest,
} from "../../services/user.service";
import { useAuthStore } from "../../store/auth.store";
import { ServiceMode } from "../../types/provider";

type ProviderProfileEditorProps = {
  kind: "business" | "professional";
};

type ProfileEditorSection = "account" | "details" | "location";

export function ProviderProfileEditor({ kind }: ProviderProfileEditorProps) {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const isBusiness = kind === "business";
  const profileKind = isBusiness ? "Business" : "Professional";
  const detailsSectionTitle = isBusiness ? "Business Details" : "Professional Details";
  const [area, setArea] = useState("");
  const [activeSection, setActiveSection] =
    useState<ProfileEditorSection | null>(null);
  const [bio, setBio] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessNameChangeReason, setBusinessNameChangeReason] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [serviceMode, setServiceMode] = useState<ServiceMode>("both");

  const profileQuery = useQuery({
    queryKey: ["provider-profile"],
    queryFn: getMyProviderProfileStatus,
  });

  const profile = profileQuery.data ?? null;
  const approvedBusinessName = profile?.businessName?.trim() || "";
  const isApprovedBusiness =
    isBusiness && profile?.verificationStatus === "approved";
  const isChangingApprovedBusinessName =
    isApprovedBusiness &&
    Boolean(businessName.trim()) &&
    businessName.trim() !== approvedBusinessName;

  useEffect(() => {
    if (!user) {
      return;
    }

    setEmail(user.email || "");
    setName(user.name || "");
    setPhone(user.phone || "");
    setCountry(profile?.country || user.country || "");
    setCity(profile?.city || user.city || "");
    setArea(profile?.area || user.area || "");
    setBusinessName(profile?.businessName || "");
    setBusinessNameChangeReason("");
    setBio(profile?.bio || "");
    setSelectedCategories(profile?.categories || []);
    setServiceMode(profile?.serviceMode || "both");
  }, [profile, user]);

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

  const profileMutation = useMutation({
    mutationFn: async () => {
      if (!country.trim() || !city.trim() || !area.trim()) {
        throw new Error("Country, city, and area are required.");
      }

      if (
        isChangingApprovedBusinessName &&
        !businessNameChangeReason.trim()
      ) {
        setActiveSection("details");
        throw new Error(
          "Please add a reason for changing your approved business name."
        );
      }

      const [profileResult, userResult] = await Promise.all([
        upsertMyProviderProfile({
          accountType: isBusiness ? "business" : "individual",
          area: area.trim(),
          availability: profile?.availability?.length
            ? profile.availability
            : defaultAvailability,
          bio: bio.trim() || undefined,
          businessName: businessName.trim() || undefined,
          businessNameChangeReason: isChangingApprovedBusinessName
            ? businessNameChangeReason.trim()
            : undefined,
          categories: selectedCategories,
          city: city.trim(),
          country: country.trim(),
          isActive: profile?.isActive ?? true,
          serviceMode,
        }),
        updateMeRequest({
          area: area.trim(),
          city: city.trim(),
          country: country.trim(),
          name: name.trim(),
          phone: phone.trim(),
        }),
      ]);

      await setUser(userResult);
      return profileResult;
    },
    onMutate: () => {
      setError("");
      setMessage("");
    },
    onSuccess: (savedProfile) => {
      queryClient.invalidateQueries({ queryKey: ["provider-profile"] });
      if (
        savedProfile.businessNameChangeRequest?.status === "pending" &&
        savedProfile.businessNameChangeRequest.requestedName ===
          businessName.trim()
      ) {
        setMessage("Business name change submitted for Vuta team approval.");
        return;
      }

      setMessage(`${profileKind} profile saved successfully.`);
    },
    onError: (saveError) => {
      const errorMessage = getApiErrorMessage(saveError);
      setError(errorMessage);

      if (errorMessage.toLowerCase().includes("country")) {
        setActiveSection("location");
      }
    },
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const pickProfileImage = async () => {
    setError("");
    setMessage("");

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError("Allow photo library access to update your profile picture.");
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
      setMessage("Profile picture updated.");
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  };

  if (profileQuery.isLoading) {
    return (
      <LoadingScreen label="Loading profile..." showBackButton size={82} />
    );
  }

  return (
    <Screen
      fixedHeader={
        <View style={styles.fixedHeader}>
          <BackButton />
          <View style={styles.fixedHeaderCopy}>
            <Text style={styles.fixedTitle}>Edit {profileKind.toLowerCase()}</Text>
            <Text style={styles.fixedSubtitle}>
              Keep the details clients see accurate.
            </Text>
          </View>
        </View>
      }
    >
      <View style={styles.header}>
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

        <View style={styles.headerCopy}>
          <Text style={styles.title}>{profileKind} profile</Text>
          <Text style={styles.subtitle}>
            {profile?.verificationStatus
              ? `Approval: ${profile.verificationStatus}`
              : "Complete setup to join marketplace review."}
          </Text>
          {isUploading ? (
            <Text style={styles.uploading}>Uploading photo...</Text>
          ) : null}
        </View>
      </View>

      <DashboardCard title="Account">
        <EditorSectionRow
          active={activeSection === "account"}
          icon="person-circle-outline"
          label="Account"
          meta="Name, email, and phone number"
          onPress={() =>
            setActiveSection((section) =>
              section === "account" ? null : "account"
            )
          }
        />
        <EditorSectionRow
          active={activeSection === "details"}
          icon={isBusiness ? "business-outline" : "sparkles-outline"}
          label={detailsSectionTitle}
          meta={
            isBusiness
              ? "Business name, overview, categories, and booking coverage"
              : "Display name, bio, specialties, and service mode"
          }
          onPress={() =>
            setActiveSection((section) =>
              section === "details" ? null : "details"
            )
          }
        />
        <EditorSectionRow
          active={activeSection === "location"}
          icon="location-outline"
          label="Location"
          meta="Country, city, and area"
          onPress={() =>
            setActiveSection((section) =>
              section === "location" ? null : "location"
            )
          }
        />
      </DashboardCard>

      {activeSection === "account" ? (
        <DashboardCard title={isBusiness ? "Owner contact" : "Account"}>
          <TextField label="Name" onChangeText={setName} value={name} />
          <TextField
            editable={false}
            keyboardType="email-address"
            label="Email"
            placeholder="you@example.com"
            style={styles.lockedInput}
            value={email}
          />
          <Text style={styles.helperText}>
            Email cannot be edited after account creation. You can still update
            your name and phone number.
          </Text>
          <TextField
            keyboardType="phone-pad"
            label="Phone number"
            onChangeText={setPhone}
            value={phone}
          />
        </DashboardCard>
      ) : null}

      {activeSection === "details" ? (
        <DashboardCard title={detailsSectionTitle}>
          <TextField
            label={isBusiness ? "Business name" : "Display name"}
            onChangeText={setBusinessName}
            placeholder={isBusiness ? "Luxe Studio" : "Tola A."}
            value={businessName}
          />
          {profile?.businessNameChangeRequest?.status === "pending" ? (
            <View style={styles.pendingRequestBox}>
              <Ionicons color={colors.premium} name="time-outline" size={18} />
              <Text style={styles.pendingRequestText}>
                Pending request:{" "}
                {profile.businessNameChangeRequest.requestedName ||
                  "business name change"}
              </Text>
            </View>
          ) : null}
          {isChangingApprovedBusinessName ? (
            <>
              <TextField
                label="Reason for changing business name"
                multiline
                onChangeText={setBusinessNameChangeReason}
                placeholder="Tell the Vuta team why this approved business name needs to change."
                style={styles.reasonInput}
                textAlignVertical="top"
                value={businessNameChangeReason}
              />
              <Text style={styles.helperText}>
                Your current approved name stays visible until the Vuta team
                reviews and approves this change.
              </Text>
            </>
          ) : null}
          <TextField
            label={isBusiness ? "Business overview" : "Bio"}
            multiline
            onChangeText={setBio}
            placeholder={
              isBusiness
                ? "Describe your studio, team, services, and client experience."
                : "Describe your style, experience, and what clients can expect."
            }
            style={styles.bioInput}
            textAlignVertical="top"
            value={bio}
          />

          <Text style={styles.fieldLabel}>
            {isBusiness ? "Service categories" : "Specialties"}
          </Text>
          <View style={styles.chipGrid}>
            {providerCategories.map((category) => {
              const selected = selectedCategories.includes(category);

              return (
                <Pressable
                  key={category}
                  onPress={() => toggleCategory(category)}
                  style={[styles.chip, selected ? styles.selectedChip : null]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected ? styles.selectedChipText : null,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>
            {isBusiness ? "Booking coverage" : "Service mode"}
          </Text>
          <View style={styles.modeStack}>
            {serviceModes.map((mode) => {
              const selected = serviceMode === mode.value;

              return (
                <Pressable
                  key={mode.value}
                  onPress={() => setServiceMode(mode.value)}
                  style={[styles.modeRow, selected ? styles.selectedMode : null]}
                >
                  <Ionicons
                    color={selected ? colors.primary : colors.muted}
                    name={selected ? "radio-button-on" : "radio-button-off"}
                    size={20}
                  />
                  <Text style={styles.modeText}>{mode.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </DashboardCard>
      ) : null}

      {activeSection === "location" ? (
        <DashboardCard title={isBusiness ? "Business location" : "Location"}>
          <TextField
            label="Country"
            onChangeText={setCountry}
            placeholder="Kenya"
            value={country}
          />
          <TextField
            label="City"
            onChangeText={setCity}
            placeholder="Nairobi"
            value={city}
          />
          <TextField
            label={isBusiness ? "Business area" : "Area"}
            onChangeText={setArea}
            placeholder={isBusiness ? "Westlands" : "Kilimani"}
            value={area}
          />
        </DashboardCard>
      ) : null}

      {profileMutation.isPending ? (
        <FeedbackBanner
          message={`Saving ${profileKind.toLowerCase()} profile...`}
          tone="saving"
        />
      ) : null}
      {error ? <FeedbackBanner message={error} tone="error" /> : null}
      {message ? <FeedbackBanner message={message} tone="success" /> : null}

      <PrimaryButton
        label={`Save ${profileKind.toLowerCase()} profile`}
        loading={profileMutation.isPending}
        onPress={() => profileMutation.mutate()}
      />
    </Screen>
  );
}

type EditorSectionRowProps = {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  meta: string;
  onPress: () => void;
};

function EditorSectionRow({
  active,
  icon,
  label,
  meta,
  onPress,
}: EditorSectionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sectionRow,
        active ? styles.activeSectionRow : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={[styles.sectionIcon, active ? styles.activeSectionIcon : null]}>
        <Ionicons
          color={active ? colors.surface : colors.primary}
          name={icon}
          size={21}
        />
      </View>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionLabel}>{label}</Text>
        <Text style={styles.sectionMeta}>{meta}</Text>
      </View>
      <Ionicons
        color={active ? colors.primary : colors.muted}
        name={active ? "chevron-up" : "chevron-down"}
        size={18}
      />
    </Pressable>
  );
}

type FeedbackBannerProps = {
  message: string;
  tone: "error" | "saving" | "success";
};

function FeedbackBanner({ message, tone }: FeedbackBannerProps) {
  const isError = tone === "error";
  const isSuccess = tone === "success";

  return (
    <View
      style={[
        styles.feedback,
        isError ? styles.errorFeedback : null,
        isSuccess ? styles.successFeedback : null,
      ]}
    >
      {tone === "saving" ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <Ionicons
          color={isError ? colors.danger : colors.success}
          name={isError ? "alert-circle-outline" : "checkmark-circle-outline"}
          size={20}
        />
      )}
      <Text
        style={[
          styles.feedbackText,
          isError ? styles.errorFeedbackText : null,
          isSuccess ? styles.successFeedbackText : null,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  fixedHeaderCopy: {
    flex: 1,
  },
  fixedTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  fixedSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  avatarButton: {
    position: "relative",
  },
  avatar: {
    borderRadius: 36,
    height: 72,
    width: 72,
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 36,
    borderWidth: 1,
    height: 72,
    justifyContent: "center",
    width: 72,
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
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  uploading: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  lockedInput: {
    backgroundColor: colors.surfaceMuted,
    color: colors.muted,
  },
  helperText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: -spacing.xs,
  },
  pendingRequestBox: {
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  pendingRequestText: {
    color: "#8A5B00",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  sectionRow: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  activeSectionRow: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: 0.72,
  },
  sectionIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  activeSectionIcon: {
    backgroundColor: colors.primary,
  },
  sectionCopy: {
    flex: 1,
    gap: 3,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  sectionMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  bioInput: {
    minHeight: 112,
    paddingTop: spacing.md,
  },
  reasonInput: {
    minHeight: 96,
    paddingTop: spacing.md,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "400",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  selectedChipText: {
    color: colors.surface,
  },
  modeStack: {
    gap: spacing.sm,
  },
  modeRow: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  selectedMode: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
  },
  modeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  feedback: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  errorFeedback: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  successFeedback: {
    backgroundColor: "#ECFDF3",
    borderColor: "#BBF7D0",
  },
  feedbackText: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  errorFeedbackText: {
    color: colors.danger,
  },
  successFeedbackText: {
    color: colors.success,
  },
});
