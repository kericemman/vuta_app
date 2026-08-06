import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { BackButton } from "../../../src/components/BackButton";
import { LogoLoader } from "../../../src/components/BrandLogo";
import { LoadingScreen } from "../../../src/components/LoadingScreen";
import { BusinessTeamRail } from "../../../src/components/marketplace/BusinessTeamRail";
import { PortfolioGrid } from "../../../src/components/marketplace/PortfolioGrid";
import { ServiceCard } from "../../../src/components/marketplace/ServiceCard";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { Screen } from "../../../src/components/Screen";
import { colors, radii, spacing } from "../../../src/constants/theme";
import { getApiErrorMessage } from "../../../src/services/api";
import { createBooking } from "../../../src/services/booking.service";
import { startConversation } from "../../../src/services/message.service";
import {
  getServiceById,
  listProviderEmployees,
  listServices,
} from "../../../src/services/marketplace.service";
import { listProviderReviews } from "../../../src/services/review.service";
import { useAuthStore } from "../../../src/store/auth.store";
import { useRecentlyViewedStore } from "../../../src/store/recentlyViewed.store";
import { BusinessEmployee, ServiceMode } from "../../../src/types/provider";
import { Review } from "../../../src/types/review";
import {
  formatMoney,
  getLocationLabel,
  getServiceImage,
} from "../../../src/utils/marketplace";
import { getGridItemWidth } from "../../../src/utils/responsiveGrid";

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const dayLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { weekday: "short" });

const monthDayLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { day: "numeric", month: "short" });

const toDateValue = (date: Date) => date.toISOString().slice(0, 10);

export default function ClientServiceDetailsScreen() {
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ employeeId?: string; id?: string }>();
  const serviceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const preselectedEmployeeId = Array.isArray(params.employeeId)
    ? params.employeeId[0]
    : params.employeeId;
  const userId = useAuthStore((state) => state.user?.id);
  const recordServiceView = useRecentlyViewedStore(
    (state) => state.recordServiceView
  );
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(() =>
    toDateValue(new Date())
  );
  const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(
    preselectedEmployeeId
  );
  const [serviceMode, setServiceMode] =
    useState<Exclude<ServiceMode, "both">>("provider_location");

  const calendarDays = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return date;
      }),
    []
  );

  const serviceQuery = useQuery({
    enabled: Boolean(serviceId),
    queryKey: ["service-details", serviceId],
    queryFn: () => getServiceById(serviceId || ""),
    retry: 1,
  });

  const service = serviceQuery.data;
  const provider = service?.provider;
  const providerId = provider?._id;
  const imageUrl = service ? getServiceImage(service) : undefined;
  const isBusiness = provider?.accountType === "business";
  const portfolio = isBusiness ? [] : provider?.portfolio ?? [];

  useEffect(() => {
    if (service) {
      void recordServiceView(userId, service);
    }
  }, [recordServiceView, service, userId]);

  useEffect(() => {
    if (preselectedEmployeeId) {
      setSelectedEmployeeId(preselectedEmployeeId);
    }
  }, [preselectedEmployeeId]);

  const employeesQuery = useQuery({
    enabled: Boolean(providerId && service?._id),
    queryKey: [
      "provider-employees",
      providerId,
      service?._id,
      selectedDate,
      selectedTime,
    ],
    queryFn: () =>
      listProviderEmployees(
        providerId || "",
        service?._id,
        selectedDate,
        selectedTime
      ),
    retry: 1,
    staleTime: 15_000,
  });

  const teamQuery = useQuery({
    enabled: Boolean(providerId && isBusiness),
    queryKey: ["provider-employees", providerId, "business-team"],
    queryFn: () => listProviderEmployees(providerId || ""),
    retry: 1,
    staleTime: 60_000,
  });

  const providerServicesQuery = useQuery({
    enabled: Boolean(providerId),
    queryKey: ["provider-services", providerId, "service-details"],
    queryFn: () => listServices({ providerId, limit: 20 }),
    retry: 1,
    staleTime: 60_000,
  });

  const reviewsQuery = useQuery({
    enabled: Boolean(providerId),
    queryKey: ["provider-reviews", providerId],
    queryFn: () => listProviderReviews(providerId || "", 3),
    retry: 1,
  });

  const employees = employeesQuery.data ?? [];
  const providerServices = useMemo(
    () =>
      (providerServicesQuery.data ?? []).filter(
        (providerService) => providerService._id !== service?._id
      ),
    [providerServicesQuery.data, service?._id]
  );
  const slotWidth = getGridItemWidth(width, 4);
  const supportedModes = useMemo<Array<Exclude<ServiceMode, "both">>>(() => {
    const mode = provider?.serviceMode || "both";

    if (mode === "home_service") {
      return ["home_service"];
    }

    if (mode === "provider_location") {
      return ["provider_location"];
    }

    return ["provider_location", "home_service"];
  }, [provider?.serviceMode]);

  useEffect(() => {
    if (!supportedModes.includes(serviceMode)) {
      setServiceMode(supportedModes[0]);
    }
  }, [serviceMode, supportedModes]);

  useEffect(() => {
    if (
      selectedEmployeeId &&
      !employees.some((employee) => employee._id === selectedEmployeeId)
    ) {
      setSelectedEmployeeId(undefined);
    }
  }, [employees, selectedEmployeeId]);

  const bookingMutation = useMutation({
    mutationFn: () => {
      if (!service || !provider?._id) {
        throw new Error("Service is not ready for booking.");
      }

      if (serviceMode === "home_service" && !address.trim()) {
        throw new Error("Enter an address for home service.");
      }

      return createBooking({
        address: address.trim() || undefined,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        employeeId: selectedEmployeeId,
        notes: notes.trim() || undefined,
        providerId: provider._id,
        serviceId: service._id,
        serviceMode,
      });
    },
    onMutate: () => setError(""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      router.replace("/(client)/bookings");
    },
    onError: (bookingError) => {
      setError(getApiErrorMessage(bookingError));
    },
  });

  const messageMutation = useMutation({
    mutationFn: () => {
      if (!providerId) {
        throw new Error("This profile is not ready for messaging.");
      }

      return startConversation({ providerId });
    },
    onMutate: () => setError(""),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/(client)/chat/${conversation._id}`);
    },
    onError: (messageError) => {
      setError(getApiErrorMessage(messageError));
    },
  });

  if (serviceQuery.isLoading) {
    return (
      <LoadingScreen label="Opening service..." showBackButton size={82} />
    );
  }

  if (!service || !provider) {
    return (
      <Screen fixedHeader={<BackButton label="Back" />}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Service unavailable</Text>
          <Text style={styles.emptyText}>
            This service may be inactive or waiting for approval.
          </Text>
        </View>
      </Screen>
    );
  }

  const providerName = provider.businessName || provider.user?.name || "Beauty profile";
  const location = getLocationLabel(provider);

  return (
    <Screen fixedHeader={<BackButton label="Back" />}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.heroImage} />
      ) : (
        <View style={styles.heroFallback}>
          <Text style={styles.heroFallbackText}>{service.category}</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>{service.name}</Text>
        <Text style={styles.price}>
          {formatMoney(service.currency, service.price)}
        </Text>
        {service.description ? (
          <Text style={styles.description}>{service.description}</Text>
        ) : null}
      </View>

      <View style={styles.providerCard}>
        <View style={styles.providerIcon}>
          <Ionicons color={colors.primary} name="person-outline" size={20} />
        </View>
        <View style={styles.providerCopy}>
          <Text style={styles.providerName}>{providerName}</Text>
          <Text style={styles.providerMeta}>
            {service.category}
            {location ? ` · ${location}` : ""}
          </Text>
        </View>
        <Text style={styles.rating}>
          {(provider.averageRating || 0).toFixed(1)}
        </Text>
        <Pressable
          disabled={messageMutation.isPending}
          onPress={() => messageMutation.mutate()}
          style={styles.messageProviderButton}
        >
          <Ionicons color={colors.primary} name="chatbubble-outline" size={16} />
          <Text style={styles.messageProviderText}>Message</Text>
        </Pressable>
      </View>

      {!isBusiness ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <PortfolioGrid
            emptyMessage="This professional has not uploaded portfolio work yet."
            images={portfolio}
            showEmpty
          />
        </View>
      ) : null}

      {isBusiness ? (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Team</Text>
            <Text style={styles.reviewCount}>
              {teamQuery.data?.length || 0} specialists
            </Text>
          </View>
          {teamQuery.isLoading ? (
            <LogoLoader label="Loading team..." size={28} />
          ) : teamQuery.data?.length ? (
            <BusinessTeamRail employees={teamQuery.data} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Team coming soon</Text>
              <Text style={styles.emptyText}>
                This business has not added public team members yet.
              </Text>
            </View>
          )}
        </View>
      ) : null}

      {providerServicesQuery.isLoading ? (
        <View style={styles.section}>
          <LogoLoader label="Loading more services..." size={28} />
        </View>
      ) : providerServices.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isBusiness
              ? "More services from this business"
              : "More services by this professional"}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.serviceRail}>
              {providerServices.map((providerService) => (
                <ServiceCard
                  key={providerService._id}
                  onPress={() =>
                    router.push({
                      pathname: "/(client)/services/[id]",
                      params: { id: providerService._id },
                    })
                  }
                  service={providerService}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Recent reviews</Text>
          <Text style={styles.reviewCount}>{provider.reviewCount || 0} total</Text>
        </View>
        {reviewsQuery.isLoading ? (
          <LogoLoader label="Loading reviews..." size={28} />
        ) : reviewsQuery.data?.length ? (
          <View style={styles.reviewList}>
            {reviewsQuery.data.map((review) => (
              <ReviewSnippet key={review._id} review={review} />
            ))}
          </View>
        ) : (
          <Text style={styles.description}>
            No reviews yet. Completed bookings will build this profile's
            rating.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.calendarRow}>
            {calendarDays.map((date) => {
              const value = toDateValue(date);
              const selected = selectedDate === value;

              return (
                <Pressable
                  key={value}
                  onPress={() => setSelectedDate(value)}
                  style={[
                    styles.dayCard,
                    selected ? styles.selectedDayCard : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayName,
                      selected ? styles.selectedDayText : null,
                    ]}
                  >
                    {dayLabel(date)}
                  </Text>
                  <Text
                    style={[
                      styles.dayDate,
                      selected ? styles.selectedDayText : null,
                    ]}
                  >
                    {monthDayLabel(date)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose time</Text>
        <View style={styles.slotGrid}>
          {timeSlots.map((slot) => {
            const selected = selectedTime === slot;

            return (
              <Pressable
                key={slot}
                onPress={() => setSelectedTime(slot)}
                style={[
                  styles.slot,
                  { width: slotWidth },
                  selected ? styles.selectedSlot : null,
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    selected ? styles.selectedSlotText : null,
                  ]}
                >
                  {slot}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isBusiness ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose specialist</Text>
          {employeesQuery.isLoading ? (
            <LogoLoader label="Checking specialists..." size={28} />
          ) : employees.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.specialistRow}>
                <Pressable
                  onPress={() => setSelectedEmployeeId(undefined)}
                  style={[
                    styles.anySpecialistCard,
                    !selectedEmployeeId ? styles.selectedSpecialistCard : null,
                  ]}
                >
                  <View style={styles.anySpecialistIcon}>
                    <Ionicons
                      color={!selectedEmployeeId ? colors.surface : colors.primary}
                      name="people-outline"
                      size={20}
                    />
                  </View>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.specialistName,
                      !selectedEmployeeId ? styles.selectedSpecialistText : null,
                    ]}
                  >
                    Any available
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.specialistMeta,
                      !selectedEmployeeId ? styles.selectedSpecialistMeta : null,
                    ]}
                  >
                    Fastest match
                  </Text>
                </Pressable>
                {employees.map((employee) => (
                  <SpecialistCard
                    employee={employee}
                    key={employee._id}
                    onPress={() => setSelectedEmployeeId(employee._id)}
                    selected={selectedEmployeeId === employee._id}
                  />
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No specialist for this time</Text>
              <Text style={styles.emptyText}>
                Try another time or request the booking without selecting a
                specialist.
              </Text>
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service location</Text>
        <View style={styles.modeRow}>
          {supportedModes.map((mode) => {
            const selected = serviceMode === mode;

            return (
              <Pressable
                key={mode}
                onPress={() => setServiceMode(mode)}
                style={[styles.modeCard, selected ? styles.selectedMode : null]}
              >
                <Ionicons
                  color={selected ? colors.primary : colors.muted}
                  name={mode === "home_service" ? "home-outline" : "business-outline"}
                  size={18}
                />
                <Text style={styles.modeText}>
                  {mode === "home_service" ? "Home service" : "Business location"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {serviceMode === "home_service" ? (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            onChangeText={setAddress}
            placeholder="Enter your address"
            placeholderTextColor={colors.muted}
            style={styles.textInput}
            value={address}
          />
        </View>
      ) : null}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Add style notes or special requests"
          placeholderTextColor={colors.muted}
          style={[styles.textInput, styles.notesInput]}
          textAlignVertical="top"
          value={notes}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label="Request booking"
        loading={bookingMutation.isPending}
        onPress={() => bookingMutation.mutate()}
      />
    </Screen>
  );
}

type SpecialistCardProps = {
  employee: BusinessEmployee;
  onPress: () => void;
  selected: boolean;
};

function ReviewSnippet({ review }: { review: Review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text numberOfLines={1} style={styles.reviewClient}>
          {review.client?.name || "Client"}
        </Text>
        <View style={styles.reviewStars}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Ionicons
              color={value <= review.rating ? colors.premium : colors.border}
              key={value}
              name={value <= review.rating ? "star" : "star-outline"}
              size={14}
            />
          ))}
        </View>
      </View>
      {review.comment ? (
        <Text style={styles.reviewText}>{review.comment}</Text>
      ) : null}
    </View>
  );
}

function SpecialistCard({ employee, onPress, selected }: SpecialistCardProps) {
  const initials =
    employee.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "V";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.specialistCard,
        selected ? styles.selectedSpecialistCard : null,
      ]}
    >
      {employee.profileImage ? (
        <Image source={{ uri: employee.profileImage }} style={styles.specialistImage} />
      ) : (
        <View style={styles.specialistFallback}>
          <Text
            style={[
              styles.specialistInitials,
              selected ? styles.selectedSpecialistText : null,
            ]}
          >
            {initials}
          </Text>
        </View>
      )}
      <Text
        numberOfLines={1}
        style={[
          styles.specialistName,
          selected ? styles.selectedSpecialistText : null,
        ]}
      >
        {employee.name}
      </Text>
      <Text
        numberOfLines={1}
        style={[
          styles.specialistMeta,
          selected ? styles.selectedSpecialistMeta : null,
        ]}
      >
        {employee.jobTitle || employee.specializations?.[0] || "Specialist"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    aspectRatio: 1.35,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    width: "100%",
  },
  heroFallback: {
    alignItems: "center",
    aspectRatio: 1.35,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    justifyContent: "center",
    width: "100%",
  },
  heroFallbackText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
  },
  price: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  providerCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  providerIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  providerCopy: {
    flex: 1,
  },
  providerName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  providerMeta: {
    color: colors.muted,
    fontSize: 13,
  },
  rating: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  messageProviderButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  messageProviderText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  reviewCount: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  reviewList: {
    gap: spacing.sm,
  },
  reviewCard: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  reviewHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  reviewClient: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  specialistRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  serviceRail: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  anySpecialistCard: {
    alignItems: "center",
    borderRadius: radii.md,
    gap: 4,
    minHeight: 136,
    padding: spacing.sm,
    width: 116,
  },
  anySpecialistIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  specialistCard: {
    alignItems: "center",
    borderRadius: radii.md,
    gap: 4,
    minHeight: 136,
    padding: spacing.sm,
    width: 116,
  },
  selectedSpecialistCard: {
    backgroundColor: colors.primary,
  },
  specialistImage: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 28,
    height: 56,
    width: 56,
  },
  specialistFallback: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  specialistInitials: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
  },
  specialistName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  specialistMeta: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
  },
  selectedSpecialistText: {
    color: colors.surface,
  },
  selectedSpecialistMeta: {
    color: colors.surfaceMuted,
  },
  calendarRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  dayCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 2,
    minHeight: 70,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: 82,
  },
  selectedDayCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayName: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  dayDate: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  selectedDayText: {
    color: colors.surface,
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  slot: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  selectedSlot: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  selectedSlotText: {
    color: colors.surface,
  },
  modeRow: {
    gap: spacing.sm,
  },
  modeCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  selectedMode: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
  },
  modeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "400",
  },
  textInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  notesInput: {
    minHeight: 94,
    paddingTop: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  emptyState: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
