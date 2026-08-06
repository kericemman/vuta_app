import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { CategoryScroller } from "../../src/components/marketplace/CategoryScroller";
import { ProviderCard } from "../../src/components/marketplace/ProviderCard";
import { SectionHeader } from "../../src/components/marketplace/SectionHeader";
import { ServiceCard } from "../../src/components/marketplace/ServiceCard";
import { TrustBanner } from "../../src/components/marketplace/TrustBanner";
import { Screen } from "../../src/components/Screen";
import {
  sampleProviders,
  sampleServices,
  serviceCategories,
} from "../../src/constants/marketplace";
import { colors, radii, spacing } from "../../src/constants/theme";
import { useDebouncedValue } from "../../src/hooks/useDebouncedValue";
import { useMarketplaceLocation } from "../../src/hooks/useMarketplaceLocation";
import {
  canSaveProvider,
  useSavedProviders,
} from "../../src/hooks/useSavedProviders";
import {
  listProviders,
  listServices,
} from "../../src/services/marketplace.service";
import { listUpcomingClientBookings } from "../../src/services/booking.service";
import { startConversation } from "../../src/services/message.service";
import { getUnreadNotificationCount } from "../../src/services/notification.service";
import { useAuthStore } from "../../src/store/auth.store";
import { useRecentlyViewedStore } from "../../src/store/recentlyViewed.store";
import { ProviderSummary } from "../../src/types/marketplace";
import { ProviderBooking } from "../../src/types/provider";
import {
  filterProviders,
  filterServices,
} from "../../src/utils/marketplace";
import { formatBookingDate } from "../../src/utils/provider";

const HOME_LIMIT = 8;
const CATEGORY_PROVIDER_LIMIT = 100;
const CATEGORY_RAIL_LIMIT = 12;
const BUSINESS_RAIL_LIMIT = 24;
const UPCOMING_BOOKINGS_LIMIT = 2;

const openProviderDetails = (providerId: string) =>
  router.push({
    pathname: "/(client)/providers/[id]",
    params: { id: providerId },
  });

export default function ClientHomeScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const clearRecentServices = useRecentlyViewedStore(
    (state) => state.clearServices
  );
  const hydrateRecentServices = useRecentlyViewedStore(
    (state) => state.hydrate
  );
  const isRecentServicesHydrated = useRecentlyViewedStore(
    (state) => state.isHydrated
  );
  const recentServices = useRecentlyViewedStore((state) => state.services);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const debouncedQuery = useDebouncedValue(query.trim());
  const hasFilters = Boolean(debouncedQuery || selectedCategory);
  const marketplaceLocation = useMarketplaceLocation();
  const { isSavedProvider, isSavingProvider, toggleSavedProvider } =
    useSavedProviders();

  const providersQuery = useQuery({
    queryKey: [
      "client-home-providers",
      debouncedQuery,
      selectedCategory,
      marketplaceLocation.params,
    ],
    queryFn: () =>
      listProviders({
        ...marketplaceLocation.params,
        category: selectedCategory,
        limit: CATEGORY_PROVIDER_LIMIT,
        q: debouncedQuery,
      }),
    retry: 1,
    staleTime: 60_000,
  });

  const servicesQuery = useQuery({
    queryKey: [
      "client-home-services",
      debouncedQuery,
      selectedCategory,
      marketplaceLocation.params,
    ],
    queryFn: () =>
      listServices({
        ...marketplaceLocation.params,
        category: selectedCategory,
        limit: HOME_LIMIT,
        q: debouncedQuery,
      }),
    retry: 1,
    staleTime: 60_000,
  });

  const unreadNotificationsQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 60_000,
    retry: 1,
    staleTime: 5_000,
  });

  const upcomingBookingsQuery = useQuery({
    queryKey: ["client-bookings", "upcoming", UPCOMING_BOOKINGS_LIMIT],
    queryFn: () => listUpcomingClientBookings(UPCOMING_BOOKINGS_LIMIT),
    retry: 1,
    staleTime: 30_000,
  });

  const messageBookingMutation = useMutation({
    mutationFn: (bookingId: string) => startConversation({ bookingId }),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/(client)/chat/${conversation._id}`);
    },
  });

  const providers = useMemo(() => {
    if (providersQuery.data?.length) {
      return providersQuery.data;
    }

    return __DEV__
      ? filterProviders(sampleProviders, debouncedQuery, selectedCategory)
      : [];
  }, [debouncedQuery, providersQuery.data, selectedCategory]);

  const services = useMemo(() => {
    if (servicesQuery.data?.length) {
      return servicesQuery.data;
    }

    return __DEV__
      ? filterServices(sampleServices, debouncedQuery, selectedCategory)
      : [];
  }, [debouncedQuery, selectedCategory, servicesQuery.data]);

  const firstName = user?.name?.split(" ")[0] || "there";
  const isLoading = providersQuery.isLoading || servicesQuery.isLoading;
  const isOpeningHome =
    isLoading || upcomingBookingsQuery.isLoading || !isRecentServicesHydrated;
  const unreadNotificationCount = unreadNotificationsQuery.data ?? 0;
  const upcomingBookings = upcomingBookingsQuery.data ?? [];
  const liveProviders = providersQuery.data ?? [];
  const professionalCategoryGroups = useMemo(
    () => buildProfessionalCategoryGroups(liveProviders, selectedCategory),
    [liveProviders, selectedCategory]
  );
  const businessProviders = useMemo(
    () =>
      liveProviders
        .filter((provider) => provider.accountType === "business")
        .slice(0, BUSINESS_RAIL_LIMIT),
    [liveProviders]
  );

  useEffect(() => {
    void hydrateRecentServices(user?.id);
  }, [hydrateRecentServices, user?.id]);

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory(undefined);
  };

  if (isOpeningHome) {
    return <LoadingScreen label="Loading marketplace..." showBackButton={false} />;
  }

  return (
    <Screen showBackButton={false}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.78}
            numberOfLines={1}
            style={styles.title}
          >
            Hello, {firstName}
          </Text>
          <Text numberOfLines={2} style={styles.location}>
            Book your next beauty experience with trusted professionals.
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Open notifications"
          onPress={() => router.push("/(client)/notifications")}
          style={({ pressed }) => [
            styles.notification,
            pressed ? styles.notificationPressed : null,
          ]}
        >
          <Ionicons
            color={colors.text}
            name="notifications-outline"
            size={24}
          />
          {unreadNotificationCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadNotificationCount > 99
                  ? "99+"
                  : unreadNotificationCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          autoCapitalize="none"
          onChangeText={setQuery}
          placeholder="Search services or professionals"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          value={query}
        />
        <Pressable
          disabled={!hasFilters}
          onPress={clearFilters}
          style={[
            styles.filterButton,
            hasFilters ? styles.activeFilterButton : null,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              hasFilters ? styles.activeFilterText : null,
            ]}
          >
            {hasFilters ? "Clear" : "Filter"}
          </Text>
        </Pressable>
      </View>

      <CategoryScroller
        categories={serviceCategories}
        onSelect={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      <TrustBanner />

      <SectionHeader
        actionLabel="See all"
        onActionPress={() => router.push("/(client)/explore")}
        title={
          marketplaceLocation.isUsingDeviceLocation
            ? "Closest beauty profiles"
            : "Recommended for you"
        }
      />
      {providers.length ? (
        <HorizontalRail>
          {providers.map((provider) => (
            <ProviderCard
              isSaved={isSavedProvider(provider._id)}
              isSaving={isSavingProvider(provider._id)}
              key={provider._id}
              onPress={() => openProviderDetails(provider._id)}
              onToggleSave={() => toggleSavedProvider(provider._id)}
              provider={provider}
              saveDisabled={!canSaveProvider(provider._id)}
              variant="plain"
            />
          ))}
        </HorizontalRail>
      ) : (
        <EmptyState message="No matching beauty profiles yet. Try another service or location." />
      )}

      <SectionHeader
        actionLabel="See all"
        onActionPress={() => router.push("/(client)/explore")}
        title={
          marketplaceLocation.isUsingDeviceLocation
            ? "Services near you"
            : "Top services"
        }
      />
      {services.length ? (
        <HorizontalRail>
          {services.map((service) => {
            const providerId = service.provider?._id;

            return (
              <ServiceCard
                isSaved={isSavedProvider(providerId)}
                isSaving={isSavingProvider(providerId)}
                key={service._id}
                onPress={() =>
                  router.push({
                    pathname: "/(client)/services/[id]",
                    params: { id: service._id },
                  })
                }
                onToggleSave={() => toggleSavedProvider(providerId)}
                saveDisabled={!canSaveProvider(providerId)}
                service={service}
              />
            );
          })}
        </HorizontalRail>
      ) : (
        <EmptyState message="No matching services yet. Try clearing your search." />
      )}

      <SectionHeader
        actionLabel="See all"
        onActionPress={() => router.push("/(client)/bookings")}
        title={upcomingBookings.length > 1 ? "Upcoming bookings" : "Upcoming booking"}
      />
      {upcomingBookings.length ? (
        <View style={styles.upcomingList}>
          {upcomingBookings.map((booking) => (
            <UpcomingBookingCard
              booking={booking}
              isMessaging={
                messageBookingMutation.isPending &&
                messageBookingMutation.variables === booking._id
              }
              key={booking._id}
              onMessage={() => messageBookingMutation.mutate(booking._id)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.bookingCard}>
          <View style={styles.bookingCopy}>
            <Text style={styles.bookingTitle}>Ready to book?</Text>
            <Text style={styles.bookingBody}>
              Choose a service, compare professionals and businesses, and
              request a time that works for you.
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(client)/explore")}
            style={styles.bookingButton}
          >
            <Text style={styles.bookingButtonText}>Browse</Text>
          </Pressable>
        </View>
      )}

      {isRecentServicesHydrated && recentServices.length ? (
        <>
          <SectionHeader
            actionLabel="Clear"
            onActionPress={() => clearRecentServices(user?.id)}
            title="Recently viewed"
          />
          <HorizontalRail>
            {recentServices.map((service) => {
              const providerId = service.provider?._id;

              return (
                <ServiceCard
                  isSaved={isSavedProvider(providerId)}
                  isSaving={isSavingProvider(providerId)}
                  key={service._id}
                  onPress={() =>
                    router.push({
                      pathname: "/(client)/services/[id]",
                      params: { id: service._id },
                    })
                  }
                  onToggleSave={() => toggleSavedProvider(providerId)}
                  saveDisabled={!canSaveProvider(providerId)}
                  service={service}
                />
              );
            })}
          </HorizontalRail>
        </>
      ) : null}

      {professionalCategoryGroups.length ? (
        <>
          {professionalCategoryGroups.map((group) => (
            <CategoryProviderRail
              group={group}
              key={`professional-${group.category}`}
            />
          ))}
        </>
      ) : null}

      {businessProviders.length ? (
        <>
          <SectionHeader title="Business" />
          <HorizontalRail>
            {businessProviders.map((provider) => (
              <ProviderCard
                key={provider._id}
                onPress={() => openProviderDetails(provider._id)}
                provider={provider}
                variant="plain"
              />
            ))}
          </HorizontalRail>
        </>
      ) : null}
    </Screen>
  );
}

type CategoryProviderGroupData = {
  category: string;
  providers: ProviderSummary[];
};

const buildProfessionalCategoryGroups = (
  providers: ProviderSummary[],
  selectedCategory?: string
): CategoryProviderGroupData[] => {
  const categories = selectedCategory
    ? serviceCategories.filter((category) => category.value === selectedCategory)
    : serviceCategories;
  const professionalProviders = providers.filter(
    (provider) => provider.accountType !== "business"
  );

  return categories
    .map((category) => {
      const matchingProviders = professionalProviders.filter((provider) =>
        provider.categories?.includes(category.value)
      );

      return {
        category: category.label,
        providers: matchingProviders.slice(0, CATEGORY_RAIL_LIMIT),
      };
    })
    .filter((group) => group.providers.length > 0);
};

type CategoryProviderRailProps = {
  group: CategoryProviderGroupData;
};

function CategoryProviderRail({ group }: CategoryProviderRailProps) {
  return (
    <>
      <SectionHeader title={group.category} />
      <HorizontalRail>
        {group.providers.map((provider) => (
          <ProviderCard
            key={provider._id}
            onPress={() => openProviderDetails(provider._id)}
            provider={provider}
          />
        ))}
      </HorizontalRail>
    </>
  );
}

type HorizontalRailProps = {
  children: ReactNode;
};

function HorizontalRail({ children }: HorizontalRailProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.rail}
    >
      <View style={styles.railContent}>{children}</View>
    </ScrollView>
  );
}

type EmptyStateProps = {
  message: string;
};

function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

type UpcomingBookingCardProps = {
  booking: ProviderBooking;
  isMessaging: boolean;
  onMessage: () => void;
};

function UpcomingBookingCard({
  booking,
  isMessaging,
  onMessage,
}: UpcomingBookingCardProps) {
  const providerName =
    booking.provider?.businessName || booking.provider?.user?.name || "Beauty profile";
  const locationLabel = [booking.provider?.area, booking.provider?.city]
    .filter(Boolean)
    .join(", ");
  const statusLabel =
    booking.rescheduleRequest?.status === "pending"
      ? "Reschedule requested"
      : booking.status === "accepted"
        ? "Confirmed"
        : "Pending";

  return (
    <View style={styles.upcomingCard}>
      <View style={styles.upcomingHeader}>
        <View style={styles.bookingIcon}>
          <Ionicons color={colors.primary} name="calendar-outline" size={20} />
        </View>
        <View style={styles.upcomingCopy}>
          <Text numberOfLines={1} style={styles.upcomingTitle}>
            {booking.service?.name || "Beauty service"}
          </Text>
          <Text numberOfLines={1} style={styles.upcomingProvider}>
            {providerName}
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            booking.status === "accepted" ? styles.confirmedPill : null,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              booking.status === "accepted" ? styles.confirmedStatusText : null,
            ]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.bookingMetaGrid}>
        <View style={styles.bookingMetaItem}>
          <Ionicons color={colors.premium} name="time-outline" size={15} />
          <Text numberOfLines={1} style={styles.bookingMetaText}>
            {formatBookingDate(booking.bookingDate)} at {booking.bookingTime}
          </Text>
        </View>
        {locationLabel ? (
          <View style={styles.bookingMetaItem}>
            <Ionicons color={colors.premium} name="location-outline" size={15} />
            <Text numberOfLines={1} style={styles.bookingMetaText}>
              {locationLabel}
            </Text>
          </View>
        ) : null}
        {booking.employee?.name ? (
          <View style={styles.bookingMetaItem}>
            <Ionicons color={colors.premium} name="person-outline" size={15} />
            <Text numberOfLines={1} style={styles.bookingMetaText}>
              with {booking.employee.name}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bookingActions}>
        <Pressable
          onPress={() => router.push(`/(client)/booking-details/${booking._id}`)}
          style={({ pressed }) => [
            styles.bookingActionButton,
            pressed ? styles.bookingActionPressed : null,
          ]}
        >
          <Text style={styles.bookingActionText}>View details</Text>
        </Pressable>
        <Pressable
          disabled={isMessaging}
          onPress={onMessage}
          style={({ pressed }) => [
            styles.messageActionButton,
            isMessaging ? styles.bookingActionDisabled : null,
            pressed && !isMessaging ? styles.bookingActionPressed : null,
          ]}
        >
          <Ionicons color={colors.primary} name="chatbubble-outline" size={15} />
          <Text style={styles.messageActionText}>
            {isMessaging ? "Opening" : "Message"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.xs,
  },
  title: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  location: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  notification: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexShrink: 0,
    height: 48,
    justifyContent: "center",
    marginTop: spacing.sm,
    width: 48,
  },
  notificationPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 9,
    height: 18,
    justifyContent: "center",
    minWidth: 18,
    paddingHorizontal: 5,
    position: "absolute",
    right: 7,
    top: 5,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: "700",
  },
  searchRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 58,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    minHeight: 54,
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 24,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  activeFilterText: {
    color: colors.surface,
  },
  rail: {
    marginHorizontal: -spacing.sm,
  },
  railContent: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  emptyState: {
    paddingVertical: spacing.sm,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  bookingCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  upcomingList: {
    gap: spacing.sm,
  },
  upcomingCard: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  upcomingHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  bookingIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  upcomingCopy: {
    flex: 1,
    minWidth: 0,
  },
  upcomingTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  upcomingProvider: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  confirmedPill: {
    backgroundColor: "#E8F7EE",
  },
  statusText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  confirmedStatusText: {
    color: colors.success,
  },
  bookingMetaGrid: {
    gap: spacing.xs,
  },
  bookingMetaItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  bookingMetaText: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
  },
  bookingActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  bookingActionButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 18,
    flex: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: spacing.sm,
  },
  messageActionButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: spacing.sm,
  },
  bookingActionDisabled: {
    opacity: 0.55,
  },
  bookingActionPressed: {
    opacity: 0.82,
  },
  bookingActionText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
  },
  messageActionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  bookingCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  bookingTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  bookingBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  bookingButton: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bookingButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "700",
  },
});
