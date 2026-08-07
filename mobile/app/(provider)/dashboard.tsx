import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { DashboardCard } from "../../src/components/DashboardCard";
import { LogoLoader } from "../../src/components/BrandLogo";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { AdCardCarousel } from "../../src/components/marketing/AdCardCarousel";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { colors, radii, spacing } from "../../src/constants/theme";
import { getApiErrorMessage } from "../../src/services/api";
import {
  getBusinessStats,
  getMyProviderProfileStatus,
  listMyBookings,
  listMyServices,
  upsertMyProviderProfile,
} from "../../src/services/provider.service";
import { useAuthStore } from "../../src/store/auth.store";
import { ProviderBooking } from "../../src/types/provider";
import {
  buildProviderPayload,
  formatBookingDate,
  formatMoney,
  getDashboardSummary,
  getProfileCompletion,
  getProviderDisplayName,
  getProviderLocation,
  isToday,
} from "../../src/utils/provider";
import { getGridItemPercentWidth } from "../../src/utils/responsiveGrid";

export default function ProviderDashboardScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isBusiness = user?.role === "beauty_business";
  const adPlacement = isBusiness ? "business_home" : "professional_home";
  const profileKind = isBusiness ? "business" : "professional";
  const profileEditRoute = isBusiness
    ? "/(provider)/business-profile"
    : "/(provider)/professional-profile";

  const profileQuery = useQuery({
    queryKey: ["provider-profile"],
    queryFn: getMyProviderProfileStatus,
  });

  const profile = profileQuery.data ?? null;

  const servicesQuery = useQuery({
    queryKey: ["provider-services"],
    queryFn: listMyServices,
    enabled: Boolean(profile),
  });

  const bookingsQuery = useQuery({
    queryKey: ["provider-bookings"],
    queryFn: listMyBookings,
    enabled: Boolean(profile),
  });

  const businessStatsQuery = useQuery({
    queryKey: ["business-stats"],
    queryFn: getBusinessStats,
    enabled: Boolean(isBusiness && profile),
  });

  const availabilityMutation = useMutation({
    mutationFn: (isActive: boolean) => {
      if (!profile) {
        throw new Error("Complete your professional profile first.");
      }

      return upsertMyProviderProfile(buildProviderPayload(profile, { isActive }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-profile"] });
    },
    onError: (error) => {
      Alert.alert("Availability", getApiErrorMessage(error));
    },
  });

  const services = servicesQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];
  const businessStats = businessStatsQuery.data ?? null;
  const summary = businessStats
    ? {
        pendingRequests: businessStats.bookingStatusBreakdown.pending || 0,
        todayBookings: businessStats.counts.todayBookings,
        todayEarnings: businessStats.revenue.todayRevenue,
      }
    : getDashboardSummary(bookings);
  const todaysSchedule = bookings.filter(
    (booking) => isToday(booking.bookingDate) && booking.status !== "cancelled"
  );
  const completion = getProfileCompletion(profile);
  const activeServices = services.filter((service) => service.isActive !== false);
  const displayName = getProviderDisplayName(profile, user);
  const greeting = getTimeGreeting();
  const location = getProviderLocation(profile, user);
  const firstName = displayName.split(" ")[0] || "there";
  const imageUrl = user?.profileImage || profile?.user?.profileImage;
  const metricCardWidth = getGridItemPercentWidth(3);
  const halfCardWidth = getGridItemPercentWidth(2);

  const toggleAvailability = () => {
    if (!profile) {
      router.push(profileEditRoute);
      return;
    }

    availabilityMutation.mutate(!(profile.isActive ?? true));
  };

  if (profileQuery.isLoading) {
    return (
      <LoadingScreen label="Preparing your workspace..." size={82} />
    );
  }

  return (
    <Screen showBackButton={false}>
      <View style={styles.header}>
        <View style={styles.identityRow}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.identityCopy}>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.76}
              numberOfLines={1}
              style={styles.title}
            >
              {greeting}, {firstName}
            </Text>
            <Text style={styles.subtitle}>
              {profile?.categories?.[0] ||
                (isBusiness ? "Beauty business" : "Beauty professional")}
            </Text>
            {location ? (
              <View style={styles.metaRow}>
                <Ionicons color={colors.premium} name="location" size={14} />
                <Text style={styles.metaText}>{location}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.statusRow}>
          <Pressable
            onPress={toggleAvailability}
            style={[
              styles.statusPill,
              profile?.isActive === false ? styles.offlinePill : null,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                profile?.isActive === false ? styles.offlineDot : null,
              ]}
            />
            <Text style={styles.statusText}>
              {profile?.isActive === false ? "Unavailable" : "Available"}
            </Text>
            <Ionicons color={colors.text} name="chevron-down" size={14} />
          </Pressable>
          <View style={styles.approvalPill}>
            <Text style={styles.approvalText}>
              {profile?.verificationStatus || "setup needed"}
            </Text>
          </View>
        </View>
      </View>

      {!profile ? (
        <View style={styles.setupCard}>
          <View style={styles.setupHeader}>
            <Text style={styles.setupTitle}>
              Complete {profileKind} setup
            </Text>
            <Ionicons color={colors.primary} name="chevron-forward" size={20} />
          </View>
          <Text style={styles.body}>
            {isBusiness
              ? "Add your business details, location, service categories, and team information so clients can understand and book your business."
              : "Add your location, specialty, bio, services, and portfolio so clients can discover and book you."}
          </Text>
          <PrimaryButton
            label={`Set up ${profileKind} profile`}
            onPress={() => router.push(profileEditRoute)}
          />
        </View>
      ) : completion < 100 ? (
        <Pressable
          onPress={() => router.push(profileEditRoute)}
          style={({ pressed }) => [
            styles.setupCard,
            pressed ? styles.setupCardPressed : null,
          ]}
        >
          <View style={styles.setupHeader}>
            <Text style={styles.setupTitle}>Profile strength</Text>
            <Ionicons color={colors.primary} name="chevron-forward" size={20} />
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completion}%` }]} />
          </View>
          <Text style={styles.body}>
            {isBusiness
              ? `${completion}% complete. Tap to continue editing business information, location, service categories, and booking coverage.`
              : `${completion}% complete. Tap to continue editing your specialty, bio, location, and service details.`}
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.metricsGrid}>
        <MetricCard
          icon="calendar-outline"
          label="Today's bookings"
          value={String(summary.todayBookings)}
          width={metricCardWidth}
        />
        <MetricCard
          icon="wallet-outline"
          label="Earnings today"
          value={formatMoney(summary.todayEarnings)}
          width={metricCardWidth}
        />
        <MetricCard
          icon="person-add-outline"
          label="New requests"
          value={String(summary.pendingRequests)}
          width={metricCardWidth}
        />
      </View>

      <AdCardCarousel placement={adPlacement} />

      {isBusiness ? (
        <DashboardCard title="Business statistics">
          {businessStatsQuery.isLoading ? (
            <LogoLoader label="Loading business statistics..." size={32} />
          ) : businessStats ? (
            <>
              <BusinessStatRow
                label="Revenue this week"
                value={formatMoney(
                  businessStats.revenue.weekRevenue,
                  businessStats.currency
                )}
              />
              <BusinessStatRow
                label="Revenue this month"
                value={formatMoney(
                  businessStats.revenue.monthRevenue,
                  businessStats.currency
                )}
              />
              <BusinessStatRow
                label="Average booking"
                value={formatMoney(
                  businessStats.averageBookingValue,
                  businessStats.currency
                )}
              />
              <BusinessStatRow
                label="Saved by clients"
                value={String(businessStats.counts.savedByClients)}
              />
              {businessStats.topServices[0] ? (
                <TopServiceRow
                  currency={businessStats.currency}
                  service={businessStats.topServices[0]}
                />
              ) : null}
            </>
          ) : (
            <Text style={styles.body}>
              Business statistics will appear after bookings begin.
            </Text>
          )}
        </DashboardCard>
      ) : null}

      <DashboardCard title="Today's schedule">
        {todaysSchedule.length ? (
          todaysSchedule
            .slice(0, 4)
            .map((booking) => <BookingRow booking={booking} key={booking._id} />)
        ) : (
          <Text style={styles.body}>No bookings yet today.</Text>
        )}
      </DashboardCard>

      <View style={styles.quickActions}>
        <QuickAction
          icon="add-circle-outline"
          label="Add Service"
          onPress={() => router.push("/(provider)/services")}
          primary
          width={halfCardWidth}
        />
        <QuickAction
          icon="calendar-outline"
          label="Bookings"
          onPress={() => router.push("/(provider)/bookings")}
          width={halfCardWidth}
        />
        <QuickAction
          icon={isBusiness ? "people-outline" : "images-outline"}
          label={isBusiness ? "Team" : "Portfolio"}
          onPress={() =>
            router.push(isBusiness ? "/(provider)/team" : "/(provider)/portfolio")
          }
          width={halfCardWidth}
        />
        <QuickAction
          icon="person-outline"
          label="Profile"
          onPress={() => router.push("/(provider)/profile")}
          width={halfCardWidth}
        />
      </View>

      <View style={styles.insightsGrid}>
        <InsightCard
          icon="star"
          label="Rating"
          value={(profile?.averageRating || 0).toFixed(1)}
          width={halfCardWidth}
        />
        <InsightCard
          icon="chatbox-ellipses-outline"
          label="Reviews"
          value={String(profile?.reviewCount || 0)}
          width={halfCardWidth}
        />
        <InsightCard
          icon="cut-outline"
          label="Active services"
          value={String(businessStats?.counts.activeServices ?? activeServices.length)}
          width={halfCardWidth}
        />
        <InsightCard
          icon={isBusiness ? "people-outline" : "images-outline"}
          label={isBusiness ? "Bookable staff" : "Portfolio"}
          value={String(
            isBusiness
              ? businessStats?.counts.bookableEmployees || 0
              : profile?.portfolio?.length || 0
          )}
          width={halfCardWidth}
        />
      </View>
    </Screen>
  );
}

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

type MetricCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  width: ViewStyle["width"];
};

function MetricCard({ icon, label, value, width }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { width }]}>
      <View style={styles.metricIcon}>
        <Ionicons color={colors.primary} name={icon} size={18} />
      </View>
      <Text numberOfLines={2} style={styles.metricLabel}>
        {label}
      </Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

type BusinessStatRowProps = {
  label: string;
  value: string;
};

function BusinessStatRow({ label, value }: BusinessStatRowProps) {
  return (
    <View style={styles.businessStatRow}>
      <Text style={styles.businessStatLabel}>{label}</Text>
      <Text style={styles.businessStatValue}>{value}</Text>
    </View>
  );
}

type TopServiceRowProps = {
  currency: string;
  service: {
    bookings: number;
    category: string;
    name: string;
    revenue: number;
  };
};

function TopServiceRow({ currency, service }: TopServiceRowProps) {
  return (
    <View style={styles.topServiceRow}>
      <View style={styles.topServiceIcon}>
        <Ionicons color={colors.premium} name="star" size={18} />
      </View>
      <View style={styles.topServiceCopy}>
        <Text style={styles.topServiceTitle}>Top service</Text>
        <Text numberOfLines={1} style={styles.topServiceName}>
          {service.name}
        </Text>
      </View>
      <View style={styles.topServiceMeta}>
        <Text style={styles.topServiceBookings}>
          {service.bookings} bookings
        </Text>
        <Text style={styles.topServiceRevenue}>
          {formatMoney(service.revenue, currency)}
        </Text>
      </View>
    </View>
  );
}

type BookingRowProps = {
  booking: ProviderBooking;
};

function BookingRow({ booking }: BookingRowProps) {
  return (
    <Pressable
      onPress={() => router.push(`/(provider)/booking-details/${booking._id}`)}
      style={({ pressed }) => [
        styles.bookingRow,
        pressed ? styles.bookingRowPressed : null,
      ]}
    >
      <View style={styles.bookingTime}>
        <Text style={styles.bookingTimeText}>{booking.bookingTime}</Text>
        <Text style={styles.bookingDateText}>
          {formatBookingDate(booking.bookingDate)}
        </Text>
      </View>
      <View style={styles.bookingCopy}>
        <Text style={styles.bookingTitle}>
          {booking.client?.name || "Client"}
        </Text>
        <Text style={styles.bookingMeta}>
          {booking.service?.name || "Service"}
          {booking.employee?.name ? ` · ${booking.employee.name}` : ""}
        </Text>
      </View>
      <View style={styles.bookingStatus}>
        <Text style={styles.bookingStatusText}>{booking.status}</Text>
      </View>
    </Pressable>
  );
}

type QuickActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  primary?: boolean;
  width: ViewStyle["width"];
};

function QuickAction({
  icon,
  label,
  onPress,
  primary = false,
  width,
}: QuickActionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.quickAction,
        { width },
        primary ? styles.primaryAction : null,
      ]}
    >
      <Ionicons
        color={primary ? colors.surface : colors.primary}
        name={icon}
        size={21}
      />
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.quickActionText, primary ? styles.primaryActionText : null]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type InsightCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  width: ViewStyle["width"];
};

function InsightCard({ icon, label, value, width }: InsightCardProps) {
  return (
    <View style={[styles.insightCard, { width }]}>
      <Ionicons color={colors.premium} name={icon} size={18} />
      <Text style={styles.insightValue}>{value}</Text>
      <Text numberOfLines={2} style={styles.insightLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  identityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  avatar: {
    borderRadius: 34,
    height: 68,
    width: 68,
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 34,
    borderWidth: 1,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: "900",
  },
  identityCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 29,
  },
  subtitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  metaText: {
    color: colors.muted,
    fontSize: 13,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statusPill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  offlinePill: {
    backgroundColor: colors.surfaceMuted,
  },
  statusDot: {
    backgroundColor: colors.success,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  offlineDot: {
    backgroundColor: colors.muted,
  },
  statusText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  approvalPill: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  approvalText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  setupCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  setupCardPressed: {
    opacity: 0.74,
  },
  setupHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  setupTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
  },
  progressTrack: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 8,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 108,
    padding: spacing.xs,
  },
  metricIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
  },
  metricValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  businessStatRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
  },
  businessStatLabel: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
  },
  businessStatValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  topServiceRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
    padding: spacing.sm,
  },
  topServiceIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  topServiceCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  topServiceTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  topServiceName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  topServiceMeta: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  topServiceBookings: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  topServiceRevenue: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  bookingRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  bookingRowPressed: {
    opacity: 0.75,
  },
  bookingTime: {
    width: 58,
  },
  bookingTimeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  bookingDateText: {
    color: colors.muted,
    fontSize: 12,
  },
  bookingCopy: {
    flex: 1,
    minWidth: 0,
  },
  bookingTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  bookingMeta: {
    color: colors.muted,
    fontSize: 13,
  },
  bookingStatus: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  bookingStatusText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  quickAction: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 78,
    padding: spacing.xs,
  },
  primaryAction: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickActionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  primaryActionText: {
    color: colors.surface,
  },
  insightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  insightCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 3,
    minHeight: 82,
    padding: spacing.sm,
  },
  insightValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  insightLabel: {
    color: colors.muted,
    fontSize: 12,
    textAlign: "center",
  },
});
