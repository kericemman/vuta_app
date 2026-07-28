import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DashboardCard } from "../../src/components/DashboardCard";
import { LogoLoader } from "../../src/components/BrandLogo";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { colors, radii, spacing } from "../../src/constants/theme";
import { getApiErrorMessage } from "../../src/services/api";
import {
  assignBookingEmployee,
  getMyProviderProfileStatus,
  listBusinessEmployees,
  listMyBookings,
  updateBookingStatus,
} from "../../src/services/provider.service";
import {
  BookingStatus,
  BusinessEmployee,
  ProviderBooking,
} from "../../src/types/provider";
import { formatBookingDate, formatMoney } from "../../src/utils/provider";

export default function ProviderBookingsScreen() {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const profileQuery = useQuery({
    queryKey: ["provider-profile"],
    queryFn: getMyProviderProfileStatus,
  });

  const profile = profileQuery.data ?? null;
  const isBusinessProfile = profile?.accountType === "business";

  const bookingsQuery = useQuery({
    queryKey: ["provider-bookings"],
    queryFn: listMyBookings,
    enabled: Boolean(profile),
  });

  const employeesQuery = useQuery({
    queryKey: ["business-employees"],
    queryFn: listBusinessEmployees,
    enabled: Boolean(isBusinessProfile),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: BookingStatus;
    }) => updateBookingStatus(bookingId, status),
    onMutate: () => setError(""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-bookings"] });
    },
    onError: (statusError) => {
      setError(getApiErrorMessage(statusError));
    },
  });

  const assignEmployeeMutation = useMutation({
    mutationFn: ({
      bookingId,
      employeeId,
    }: {
      bookingId: string;
      employeeId?: string | null;
    }) => assignBookingEmployee(bookingId, employeeId),
    onMutate: () => setError(""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-bookings"] });
    },
    onError: (assignError) => {
      setError(getApiErrorMessage(assignError));
    },
  });

  if (profileQuery.isLoading) {
    return (
      <LoadingScreen label="Loading bookings..." showBackButton size={82} />
    );
  }

  if (!profile) {
    return (
      <Screen>
        <Text style={styles.title}>Bookings</Text>
        <DashboardCard title="Profile setup required">
          <Text style={styles.body}>
            Complete your professional profile before receiving bookings.
          </Text>
          <PrimaryButton
            label="Set up profile"
            onPress={() => router.push("/(provider)/profile")}
          />
        </DashboardCard>
      </Screen>
    );
  }

  const bookings = bookingsQuery.data ?? [];
  const employees = employeesQuery.data ?? [];
  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bookings</Text>
          <Text style={styles.subtitle}>{pendingCount} pending requests</Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <DashboardCard title="Requests">
        {bookingsQuery.isLoading ? (
          <LogoLoader label="Loading requests..." size={32} />
        ) : bookings.length ? (
          bookings.map((booking) => (
            <BookingCard
              booking={booking}
              employees={employees}
              isBusinessProfile={Boolean(isBusinessProfile)}
              isAssigning={assignEmployeeMutation.isPending}
              isUpdating={statusMutation.isPending}
              key={booking._id}
              onAssignEmployee={(employeeId) =>
                assignEmployeeMutation.mutate({
                  bookingId: booking._id,
                  employeeId,
                })
              }
              onStatusChange={(status) =>
                statusMutation.mutate({ bookingId: booking._id, status })
              }
            />
          ))
        ) : (
          <Text style={styles.body}>No bookings yet.</Text>
        )}
      </DashboardCard>
    </Screen>
  );
}

type BookingCardProps = {
  booking: ProviderBooking;
  employees: BusinessEmployee[];
  isAssigning: boolean;
  isBusinessProfile: boolean;
  isUpdating: boolean;
  onAssignEmployee: (employeeId?: string | null) => void;
  onStatusChange: (status: BookingStatus) => void;
};

function BookingCard({
  booking,
  employees,
  isAssigning,
  isBusinessProfile,
  isUpdating,
  onAssignEmployee,
  onStatusChange,
}: BookingCardProps) {
  const canAssign =
    isBusinessProfile &&
    ["pending", "accepted"].includes(booking.status) &&
    Boolean(booking.service?._id);
  const assignedEmployeeId = booking.employee?._id;
  const serviceId = booking.service?._id;
  const assignableEmployees = employees.filter(
    (employee) =>
      employee.status === "active" &&
      employee.isBookable !== false &&
      employee.services?.some((service) => service._id === serviceId)
  );
  const anyAvailableSelected =
    !assignedEmployeeId && assignableEmployees.length > 0;

  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.clientIcon}>
          <Ionicons color={colors.primary} name="person-outline" size={18} />
        </View>
        <View style={styles.bookingCopy}>
          <Text style={styles.clientName}>{booking.client?.name || "Client"}</Text>
          <Text style={styles.serviceName}>
            {booking.service?.name || "Service"}
          </Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>

      <View style={styles.detailGrid}>
        <Detail icon="calendar-outline" text={formatBookingDate(booking.bookingDate)} />
        <Detail icon="time-outline" text={booking.bookingTime} />
        <Detail
          icon="wallet-outline"
          text={formatMoney(booking.price, booking.currency)}
        />
        {booking.employee?.name ? (
          <Detail icon="people-outline" text={booking.employee.name} />
        ) : null}
      </View>

      <Pressable
        onPress={() => router.push(`/(provider)/booking-details/${booking._id}`)}
        style={({ pressed }) => [
          styles.viewDetailsButton,
          pressed ? styles.viewDetailsButtonPressed : null,
        ]}
      >
        <Text style={styles.viewDetailsText}>View details</Text>
        <Ionicons color={colors.primary} name="chevron-forward" size={16} />
      </Pressable>

      {canAssign ? (
        <View style={styles.assignmentPanel}>
          <View style={styles.assignmentHeader}>
            <Text style={styles.assignmentTitle}>Specialist</Text>
            <Text style={styles.assignmentMeta}>
              {booking.employee?.name || "Any available"}
            </Text>
          </View>

          <View style={styles.employeeChips}>
            <Pressable
              disabled={isAssigning || !assignableEmployees.length}
              onPress={() => onAssignEmployee(null)}
              style={[
                styles.employeeChip,
                anyAvailableSelected ? styles.employeeChipActive : null,
              ]}
            >
              <Text
                style={[
                  styles.employeeChipText,
                  anyAvailableSelected
                    ? styles.employeeChipTextActive
                    : null,
                ]}
              >
                Any available
              </Text>
            </Pressable>

            {assignableEmployees.map((employee) => {
              const selected = assignedEmployeeId === employee._id;

              return (
                <Pressable
                  disabled={isAssigning || selected}
                  key={employee._id}
                  onPress={() => onAssignEmployee(employee._id)}
                  style={[
                    styles.employeeChip,
                    selected ? styles.employeeChipActive : null,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.employeeChipText,
                      selected ? styles.employeeChipTextActive : null,
                    ]}
                  >
                    {employee.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {!assignableEmployees.length ? (
            <Text style={styles.assignmentEmpty}>
              Assign this service to a bookable employee first.
            </Text>
          ) : null}
        </View>
      ) : null}

      {booking.status === "pending" ? (
        <View style={styles.actionRow}>
          <Pressable
            disabled={isUpdating}
            onPress={() => onStatusChange("declined")}
            style={[styles.actionButton, styles.declineButton]}
          >
            <Text style={styles.declineText}>Decline</Text>
          </Pressable>
          <Pressable
            disabled={isUpdating}
            onPress={() => onStatusChange("accepted")}
            style={[styles.actionButton, styles.acceptButton]}
          >
            <Text style={styles.acceptText}>Accept</Text>
          </Pressable>
        </View>
      ) : null}

      {booking.status === "accepted" ? (
        <Pressable
          disabled={isUpdating}
          onPress={() => onStatusChange("completed")}
          style={styles.completeButton}
        >
          <Text style={styles.completeText}>Mark completed</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type DetailProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

function Detail({ icon, text }: DetailProps) {
  return (
    <View style={styles.detailItem}>
      <Ionicons color={colors.premium} name={icon} size={15} />
      <Text numberOfLines={1} style={styles.detailText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  bookingCard: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  bookingHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  clientIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  bookingCopy: {
    flex: 1,
  },
  clientName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  serviceName: {
    color: colors.muted,
    fontSize: 13,
  },
  statusPill: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  detailItem: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  detailText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    maxWidth: 120,
  },
  viewDetailsButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 4,
    paddingVertical: spacing.xs,
  },
  viewDetailsButtonPressed: {
    opacity: 0.7,
  },
  viewDetailsText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  assignmentPanel: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  assignmentHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  assignmentTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  assignmentMeta: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
    textAlign: "right",
  },
  employeeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  employeeChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 150,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  employeeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  employeeChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  employeeChipTextActive: {
    color: colors.surface,
  },
  assignmentEmpty: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: radii.md,
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  declineButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  declineText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "800",
  },
  acceptText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "800",
  },
  completeButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    minHeight: 44,
    justifyContent: "center",
  },
  completeText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "900",
  },
});
