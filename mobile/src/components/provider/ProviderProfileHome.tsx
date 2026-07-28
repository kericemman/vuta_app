import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Image, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { DashboardCard } from "../DashboardCard";
import { LoadingScreen } from "../LoadingScreen";
import { PrimaryButton } from "../PrimaryButton";
import { Screen } from "../Screen";
import { colors, radii, spacing } from "../../constants/theme";
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
    ? profile?.businessName || user?.name || "Business profile"
    : profile?.businessName || user?.name || "Professional profile";
  const roleLabel = isBusiness
    ? "Beauty business"
    : profile?.categories?.[0] || "Beauty professional";
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

  const inviteFriend = async () => {
    await Share.share({
      message: isBusiness
        ? "I am using Vuta to manage bookings, services, and team operations. Join me on Vuta."
        : "I am using Vuta to manage beauty bookings and grow my profile. Join me on Vuta.",
    });
  };

  if (profileQuery.isLoading) {
    return (
      <LoadingScreen label="Loading profile..." showBackButton size={82} />
    );
  }

  return (
    <Screen>
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
          <Text style={styles.editText}>Edit</Text>
        </View>
      </Pressable>

      {!profile ? (
        <DashboardCard
          title={isBusiness ? "Set up business profile" : "Set up professional profile"}
        >
          <Text style={styles.body}>
            {isBusiness
              ? "Add your studio details, service categories, location, and team setup so clients understand what your business offers."
              : "Add your specialty, bio, location, services, and portfolio so clients can discover and book you."}
          </Text>
          <PrimaryButton
            label={isBusiness ? "Create business profile" : "Create professional profile"}
            onPress={() => router.push(editRoute)}
          />
        </DashboardCard>
      ) : (
        <View style={styles.statusGrid}>
          <StatTile
            label="Profile"
            value={`${completion}%`}
            icon="shield-checkmark-outline"
          />
          <StatTile
            label={isBusiness ? "Services" : "Portfolio"}
            value={
              isBusiness
                ? String(businessStats?.counts.totalServices || 0)
                : String(profile.portfolio?.length || 0)
            }
            icon={isBusiness ? "list-outline" : "images-outline"}
          />
          <StatTile
            label={isBusiness ? "Team" : "Reviews"}
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
  return (
    <>
      <DashboardCard title="Professional tools">
        <ProviderProfileMenuItem
          icon="list-outline"
          label="Services"
          meta="Create and manage your bookable services"
          onPress={() => router.push("/(provider)/services")}
        />
        <ProviderProfileMenuItem
          icon="images-outline"
          label="Portfolio"
          meta="Show your best work to clients"
          onPress={() => router.push("/(provider)/portfolio")}
        />
        <ProviderProfileMenuItem
          icon="analytics-outline"
          label="Performance"
          meta={`Current rating ${averageRating.toFixed(1)}`}
          onPress={() => router.push("/(provider)/dashboard")}
        />
      </DashboardCard>

      <AccountSection
        inviteMeta="Invite another beauty professional"
        onInvite={onInvite}
        planMeta="Professional plan"
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
  return (
    <>
      <DashboardCard title="Business tools">
        <ProviderProfileMenuItem
          icon="people-outline"
          label="Team"
          meta="View and manage employee profiles"
          onPress={() => router.push("/(provider)/team")}
        />
        <ProviderProfileMenuItem
          icon="person-add-outline"
          label="Add employee"
          meta="Create a staff profile with services and availability"
          onPress={() =>
            router.push({
              pathname: "/(provider)/team",
              params: { action: "add", intent: String(Date.now()) },
            })
          }
        />
        <ProviderProfileMenuItem
          icon="list-outline"
          label="Services"
          meta="Manage services clients can book"
          onPress={() => router.push("/(provider)/services")}
        />
        <ProviderProfileMenuItem
          icon="bar-chart-outline"
          label="Business statistics"
          meta={`${formatMoney(revenue)} this month, ${savedByClients} saves`}
          onPress={() => router.push("/(provider)/dashboard")}
        />
      </DashboardCard>

      <AccountSection
        inviteMeta="Invite partners or staff to Vuta"
        onInvite={onInvite}
        planMeta="Business plan"
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
  return (
    <DashboardCard title="Account">
      <ProviderProfileMenuItem
        icon="card-outline"
        label="Subscription"
        meta={planMeta}
        onPress={() => router.push("/(provider)/subscription")}
      />
      <ProviderProfileMenuItem
        icon="language-outline"
        label="App language"
        meta="Choose your preferred app language"
        onPress={() => router.push("/(provider)/language")}
      />
      <ProviderProfileMenuItem
        icon="person-add-outline"
        label="Invite a friend"
        meta={inviteMeta}
        onPress={onInvite}
      />
      <ProviderProfileMenuItem
        icon="chatbox-ellipses-outline"
        label="Feedback"
        meta="Tell us what to improve"
        onPress={() => router.push("/(provider)/feedback")}
      />
      <ProviderProfileMenuItem
        icon="settings-outline"
        label="Settings"
        meta="Account access and safety"
        onPress={() => router.push("/(provider)/settings")}
      />
      <ProviderProfileMenuItem
        badge={unreadUpdates}
        icon="newspaper-outline"
        label="Updates"
        meta={
          unreadUpdateCount ? `${unreadUpdateCount} unread` : "Latest Vuta announcements"
        }
        onPress={() => router.push("/updates")}
      />
    </DashboardCard>
  );
}

type StatTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function StatTile({ icon, label, value }: StatTileProps) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statIcon}>
        <Ionicons color={colors.primary} name={icon} size={18} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: spacing.sm,
  },
  statTile: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minHeight: 104,
    padding: spacing.sm,
  },
  statIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
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
});
