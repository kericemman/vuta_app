import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../../../../../src/components/BackButton";
import { LoadingScreen } from "../../../../../src/components/LoadingScreen";
import { ServiceCard } from "../../../../../src/components/marketplace/ServiceCard";
import { Screen } from "../../../../../src/components/Screen";
import { colors, radii, spacing } from "../../../../../src/constants/theme";
import {
  getProviderById,
  listProviderEmployees,
} from "../../../../../src/services/marketplace.service";
import { BusinessEmployee } from "../../../../../src/types/provider";
import { ServiceSummary } from "../../../../../src/types/marketplace";
import {
  formatMoney,
  getInitials,
  getLocationLabel,
  getProviderName,
} from "../../../../../src/utils/marketplace";

export default function ClientBusinessTeamMemberScreen() {
  const params = useLocalSearchParams<{ employeeId?: string; id?: string }>();
  const providerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const employeeId = Array.isArray(params.employeeId)
    ? params.employeeId[0]
    : params.employeeId;

  const providerQuery = useQuery({
    enabled: Boolean(providerId),
    queryKey: ["provider-details", providerId],
    queryFn: () => getProviderById(providerId || ""),
    retry: 1,
  });

  const employeesQuery = useQuery({
    enabled: Boolean(providerId),
    queryKey: ["provider-employees", providerId, "team-member-detail"],
    queryFn: () => listProviderEmployees(providerId || ""),
    retry: 1,
    staleTime: 60_000,
  });

  const provider = providerQuery.data?.provider;
  const businessName = provider ? getProviderName(provider) : "Business";
  const location = provider ? getLocationLabel(provider) : "";
  const employee = employeesQuery.data?.find((item) => item._id === employeeId);
  const services =
    employee?.services?.filter((service) => service.isActive !== false) || [];

  if (providerQuery.isLoading || employeesQuery.isLoading) {
    return (
      <LoadingScreen label="Opening team member..." showBackButton size={82} />
    );
  }

  if (!provider || !employee) {
    return (
      <Screen fixedHeader={<BackButton label="Back" />}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Team member unavailable</Text>
          <Text style={styles.emptyText}>
            This specialist may no longer be available for bookings.
          </Text>
        </View>
      </Screen>
    );
  }

  const openBooking = (service: ServiceSummary) => {
    router.push({
      pathname: "/(client)/services/[id]",
      params: {
        employeeId: employee._id,
        id: service._id,
      },
    });
  };

  return (
    <Screen fixedHeader={<BackButton label="Back" />}>
      <View style={styles.heroCard}>
        {employee.profileImage ? (
          <Image source={{ uri: employee.profileImage }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroFallback}>
            <Text style={styles.heroInitials}>{getInitials(employee.name)}</Text>
          </View>
        )}
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>{businessName}</Text>
          <Text style={styles.title}>{employee.name}</Text>
          <Text style={styles.subtitle}>
            {employee.jobTitle || employee.specializations?.[0] || "Specialist"}
            {location ? ` · ${location}` : ""}
          </Text>
        </View>
      </View>

      {employee.bio ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>{employee.bio}</Text>
        </View>
      ) : null}

      {employee.specializations?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          <View style={styles.chipRow}>
            {employee.specializations.map((specialization) => (
              <View style={styles.chip} key={specialization}>
                <Text style={styles.chipText}>{specialization}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking details</Text>
        <View style={styles.bookingPanel}>
          <BookingDetail
            icon="briefcase-outline"
            label="Business"
            value={businessName}
          />
          <BookingDetail
            icon="person-outline"
            label="Specialist"
            value={employee.name}
          />
          <BookingDetail
            icon="sparkles-outline"
            label="Services"
            value={`${services.length} available`}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services to book</Text>
        {services.length ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.serviceRail}>
                {services.map((service) => (
                  <ServiceCard
                    key={service._id}
                    onPress={() => openBooking(service)}
                    service={{
                      ...service,
                      provider,
                    }}
                  />
                ))}
              </View>
            </ScrollView>
            <View style={styles.serviceList}>
              {services.map((service) => (
                <Pressable
                  key={`${service._id}-row`}
                  onPress={() => openBooking(service)}
                  style={({ pressed }) => [
                    styles.serviceRow,
                    pressed ? styles.pressedRow : null,
                  ]}
                >
                  <View style={styles.serviceCopy}>
                    <Text numberOfLines={1} style={styles.serviceName}>
                      {service.name}
                    </Text>
                    <Text numberOfLines={1} style={styles.serviceMeta}>
                      {service.duration ? `${service.duration} min · ` : ""}
                      {formatMoney(service.currency, service.price)}
                    </Text>
                  </View>
                  <View style={styles.bookPill}>
                    <Text style={styles.bookText}>Book</Text>
                    <Ionicons
                      color={colors.surface}
                      name="chevron-forward"
                      size={14}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No services linked yet</Text>
            <Text style={styles.emptyText}>
              This team member is visible, but no bookable services have been
              assigned yet.
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

type BookingDetailProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function BookingDetail({ icon, label, value }: BookingDetailProps) {
  return (
    <View style={styles.bookingDetail}>
      <View style={styles.detailIcon}>
        <Ionicons color={colors.primary} name={icon} size={17} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  heroImage: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 42,
    height: 84,
    width: 84,
  },
  heroFallback: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 42,
    height: 84,
    justifyContent: "center",
    width: 84,
  },
  heroInitials: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: "900",
  },
  heroCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 32,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  bookingPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  bookingDetail: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  detailIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  serviceRail: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  serviceList: {
    gap: spacing.sm,
  },
  serviceRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  pressedRow: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  serviceCopy: {
    flex: 1,
    minWidth: 0,
  },
  serviceName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  serviceMeta: {
    color: colors.muted,
    fontSize: 13,
  },
  bookPill: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    flexDirection: "row",
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  bookText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "900",
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
