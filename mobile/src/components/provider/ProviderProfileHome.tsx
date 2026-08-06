import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { AppVersionText } from "../AppVersionText";
import { DashboardCard } from "../DashboardCard";
import { LoadingScreen } from "../LoadingScreen";
import { PrimaryButton } from "../PrimaryButton";
import { Screen } from "../Screen";
import { VUTA_DOWNLOAD_URL } from "../../constants/links";
import { colors, spacing } from "../../constants/theme";
import { useUpdateUnreadCount } from "../../hooks/useUpdateUnreadCount";
import {
  getBusinessStats,
  getMyProviderProfileStatus,
} from "../../services/provider.service";
import { useAuthStore } from "../../store/auth.store";
import {
  formatMoney,
  getProfileCompletion,
  getProviderLocation,
} from "../../utils/provider";
import { ProviderProfileMenuItem } from "./ProviderProfileMenuItem";

export function ProfessionalProfileHome() {
  return <ProviderProfileHome kind="professional" />;
}

export function BusinessProfileHome() {
  return <ProviderProfileHome kind="business" />;
}

type ProviderProfileHomeProps = {
  kind: "business" | "professional";
};

function ProviderProfileHome({ kind }: ProviderProfileHomeProps) {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const updates = useUpdateUnreadCount();
  const isBusiness = kind === "business";

  const profileQuery = useQuery({
    queryKey: ["provider-profile"],
    queryFn: getMyProviderProfileStatus,
  });

  const profile = profileQuery.data ?? null;

  const businessStatsQuery = useQuery({
    queryKey: ["business-stats"],
    queryFn: getBusinessStats,
    enabled: isBusiness && Boolean(profile),
  });

  const businessStats = businessStatsQuery.data ?? null;
  const displayName = isBusiness
    ? profile?.businessName || user?.name || t("common.businessProfile")
    : profile?.businessName || user?.name || t("common.professionalProfile");
  const roleLabel = isBusiness
    ? t("common.beautyBusiness")
    : profile?.categories?.[0] || t("common.beautyProfessional");
  const location = getProviderLocation(profile, user);
  const completion = getProfileCompletion(profile);
  const imageUrl = user?.profileImage || profile?.user?.profileImage;
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "V";
  const editRoute = isBusiness
    ? "/(provider)/business-profile"
    : "/(provider)/professional-profile";
  const isCompactLayout = width < 380;

  const inviteFriend = async () => {
    await Share.share({
      message: isBusiness
        ? `I am using Vuta to manage bookings, services, and my beauty team. Join me on Vuta: ${VUTA_DOWNLOAD_URL}`
        : `I am using Vuta to manage beauty bookings and grow my professional profile. Join me on Vuta: ${VUTA_DOWNLOAD_URL}`,
    });
  };

  if (profileQuery.isLoading) {
    return (
      <LoadingScreen label={t("common.loadingProfile")} showBackButton size={82} />
    );
  }

  return (
    <Screen contentStyle={styles.screenContent}>
      <Pressable
        onPress={() => router.push(editRoute)}
        style={({ pressed }) => [
          styles.profileCard,
          pressed ? styles.pressed : null,
        ]}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <View style={styles.profileCopy}>
          <Text numberOfLines={1} style={styles.name}>
            {displayName}
          </Text>
          <Text numberOfLines={1} style={styles.meta}>
            {roleLabel}
          </Text>
          {location ? (
            <View style={styles.locationRow}>
              <Ionicons color={colors.premium} name="location" size={14} />
              <Text numberOfLines={1} style={styles.locationText}>
                {location}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.editPill}>
          <Ionicons color={colors.primary} name="create-outline" size={16} />
          <Text style={styles.editText}>{t("actions.edit")}</Text>
        </View>
      </Pressable>
      <View style={styles.sectionDivider} />

      {!profile ? (
        <DashboardCard
          title={
            isBusiness
              ? t("profile.setupBusinessProfile")
              : t("profile.setupProfessionalProfile")
          }
        >
          <Text style={styles.body}>
            {isBusiness
              ? "Add your studio details, service categories, location, and team setup so clients understand what your business offers."
              : "Add your specialty, bio, location, services, and portfolio so clients can discover and book you."}
          </Text>
          <PrimaryButton
            label={
              isBusiness
                ? t("profile.createBusinessProfile")
                : t("profile.createProfessionalProfile")
            }
            onPress={() => router.push(editRoute)}
          />
        </DashboardCard>
      ) : (
        <View style={styles.statusGrid}>
          <StatTile
            compact={isCompactLayout}
            label={t("profile.profileStrength")}
            value={`${completion}%`}
            icon="shield-checkmark-outline"
          />
          <StatTile
            compact={isCompactLayout}
            label={isBusiness ? t("profile.services") : t("profile.portfolio")}
            value={
              isBusiness
                ? String(businessStats?.counts.totalServices || 0)
                : String(profile.portfolio?.length || 0)
            }
            icon={isBusiness ? "list-outline" : "images-outline"}
          />
          <StatTile
            compact={isCompactLayout}
            label={isBusiness ? t("profile.team") : t("profile.reviews")}
            value={
              isBusiness
                ? String(businessStats?.counts.totalEmployees || 0)
                : String(profile.reviewCount || 0)
            }
            icon={isBusiness ? "people-outline" : "star-outline"}
          />
        </View>
      )}

      {isBusiness ? (
        <BusinessProfileSections
          revenue={businessStats?.revenue.monthRevenue || 0}
          savedByClients={businessStats?.counts.savedByClients || 0}
          unreadUpdates={updates.badge}
          unreadUpdateCount={updates.unreadCount}
          onInvite={inviteFriend}
        />
      ) : (
        <ProfessionalProfileSections
          averageRating={profile?.averageRating || 0}
          unreadUpdates={updates.badge}
          unreadUpdateCount={updates.unreadCount}
          onInvite={inviteFriend}
        />
      )}
      <AppVersionText />
    </Screen>
  );
}

type ProviderSectionProps = {
  onInvite: () => void;
  unreadUpdateCount: number;
  unreadUpdates?: string;
};

function ProfessionalProfileSections({
  averageRating,
  onInvite,
  unreadUpdateCount,
  unreadUpdates,
}: ProviderSectionProps & { averageRating: number }) {
  const { t } = useTranslation();

  return (
    <>
      <PlainProfileSection title={t("profile.professionalTools")}>
        <ProviderProfileMenuItem
          icon="list-outline"
          label={t("profile.services")}
          meta={t("profile.manageBookableServices")}
          onPress={() => router.push("/(provider)/services")}
        />
        <ProviderProfileMenuItem
          icon="images-outline"
          label={t("profile.portfolio")}
          meta={t("profile.showBestWork")}
          onPress={() => router.push("/(provider)/portfolio")}
        />
        <ProviderProfileMenuItem
          icon="analytics-outline"
          label={t("profile.performance")}
          meta={t("profile.currentRating", {
            rating: averageRating.toFixed(1),
          })}
          onPress={() => router.push("/(provider)/dashboard")}
        />
      </PlainProfileSection>

      <AccountSection
        inviteMeta={t("profile.inviteProfessional")}
        onInvite={onInvite}
        planMeta={t("common.professionalPlan")}
        unreadUpdateCount={unreadUpdateCount}
        unreadUpdates={unreadUpdates}
      />
    </>
  );
}

function BusinessProfileSections({
  onInvite,
  revenue,
  savedByClients,
  unreadUpdateCount,
  unreadUpdates,
}: ProviderSectionProps & { revenue: number; savedByClients: number }) {
  const { t } = useTranslation();

  return (
    <>
      <PlainProfileSection title={t("profile.businessTools")}>
        <ProviderProfileMenuItem
          icon="people-outline"
          label={t("profile.team")}
          meta={t("profile.manageEmployeeProfiles")}
          onPress={() => router.push("/(provider)/team")}
        />
        <ProviderProfileMenuItem
          icon="person-add-outline"
          label={t("profile.addEmployee")}
          meta={t("profile.createStaffProfile")}
          onPress={() =>
            router.push({
              pathname: "/(provider)/team",
              params: { action: "add", intent: String(Date.now()) },
            })
          }
        />
        <ProviderProfileMenuItem
          icon="list-outline"
          label={t("profile.services")}
          meta={t("profile.manageServices")}
          onPress={() => router.push("/(provider)/services")}
        />
        <ProviderProfileMenuItem
          icon="bar-chart-outline"
          label={t("profile.businessStatistics")}
          meta={t("profile.businessStatsSummary", {
            revenue: formatMoney(revenue),
            saves: savedByClients,
          })}
          onPress={() => router.push("/(provider)/dashboard")}
        />
      </PlainProfileSection>

      <AccountSection
        inviteMeta={t("profile.invitePartnersStaff")}
        onInvite={onInvite}
        planMeta={t("common.businessPlan")}
        unreadUpdateCount={unreadUpdateCount}
        unreadUpdates={unreadUpdates}
      />
    </>
  );
}

function AccountSection({
  inviteMeta,
  onInvite,
  planMeta,
  unreadUpdateCount,
  unreadUpdates,
}: ProviderSectionProps & { inviteMeta: string; planMeta: string }) {
  const { t } = useTranslation();

  return (
    <PlainProfileSection title={t("profile.account")}>
      <ProviderProfileMenuItem
        icon="card-outline"
        label={t("account.subscription")}
        meta={planMeta}
        onPress={() => router.push("/(provider)/subscription")}
      />
      <ProviderProfileMenuItem
        icon="language-outline"
        label={t("account.appLanguage")}
        meta={t("account.choosePreferredAppLanguage")}
        onPress={() => router.push("/(provider)/language")}
      />
      <ProviderProfileMenuItem
        icon="person-add-outline"
        label={t("account.inviteAFriend")}
        meta={inviteMeta}
        onPress={onInvite}
      />
      <ProviderProfileMenuItem
        icon="chatbox-ellipses-outline"
        label={t("account.feedback")}
        meta={t("account.tellUsImprove")}
        onPress={() => router.push("/(provider)/feedback")}
      />
      <ProviderProfileMenuItem
        icon="settings-outline"
        label={t("account.settings")}
        meta={t("profile.accountAccessSafety")}
        onPress={() => router.push("/(provider)/settings")}
      />
      <ProviderProfileMenuItem
        badge={unreadUpdates}
        icon="newspaper-outline"
        label={t("account.updates")}
        meta={
          unreadUpdateCount
            ? t("common.unreadCount", { count: unreadUpdateCount })
            : t("account.latestAnnouncements")
        }
        onPress={() => router.push("/updates")}
      />
    </PlainProfileSection>
  );
}

function PlainProfileSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <View style={styles.profileSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionDivider} />
      <View style={styles.sectionItems}>{children}</View>
    </View>
  );
}

type StatTileProps = {
  compact?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function StatTile({ compact = false, icon, label, value }: StatTileProps) {
  return (
    <View style={[styles.statTile, compact ? styles.statTileCompact : null]}>
      <View style={styles.statIcon}>
        <Ionicons color={colors.primary} name={icon} size={18} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: spacing.sm,
  },
  profileCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.72,
  },
  avatar: {
    borderRadius: 34,
    height: 68,
    width: 68,
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  locationText: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
  },
  editPill: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  editText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statTile: {
    alignItems: "center",
    flex: 1,
    gap: 4,
    minWidth: 104,
    minHeight: 86,
    paddingVertical: spacing.xs,
  },
  statTileCompact: {
    width: "100%",
  },
  statIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  profileSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
  },
  sectionDivider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
  },
  sectionItems: {
    gap: spacing.sm,
  },
});
