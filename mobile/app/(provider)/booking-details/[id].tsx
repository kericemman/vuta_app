import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../../../src/components/BackButton";
import { BookingDetailSummary } from "../../../src/components/BookingDetailSummary";
import { LogoLoader } from "../../../src/components/BrandLogo";
import { LoadingScreen } from "../../../src/components/LoadingScreen";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { Screen } from "../../../src/components/Screen";
import { colors, radii, spacing } from "../../../src/constants/theme";
import { getApiErrorMessage } from "../../../src/services/api";
import {
  assignBookingEmployee,
  getMyProviderProfileStatus,
  getProviderBookingById,
  listBusinessEmployees,
  respondBookingReschedule,
  updateBookingStatus,
} from "../../../src/services/provider.service";
import { startConversation } from "../../../src/services/message.service";
import { getBookingReview } from "../../../src/services/review.service";
import {
  BookingStatus,
  BusinessEmployee,
  ProviderBooking,
} from "../../../src/types/provider";
import { Review } from "../../../src/types/review";

const bookingDetailKey = (bookingId?: string) =>
  ["provider-booking-detail", bookingId] as const;

export default function ProviderBookingDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const bookingId = params.id;
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["provider-profile"],
    queryFn: getMyProviderProfileStatus,
  });

  const isBusinessProfile = profileQuery.data?.accountType === "business";

  const bookingQuery = useQuery({
    queryKey: bookingDetailKey(bookingId),
    queryFn: () => getProviderBookingById(bookingId || ""),
    enabled: Boolean(bookingId),
  });

  const employeesQuery = useQuery({
    queryKey: ["business-employees"],
    queryFn: listBusinessEmployees,
    enabled: Boolean(isBusinessProfile),
  });

  const reviewQuery = useQuery({
    queryKey: ["booking-review", bookingId],
    queryFn: () => getBookingReview(bookingId || ""),
    enabled: Boolean(bookingId && bookingQuery.data?.status === "completed"),
  });

  const refreshBookings = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["provider-bookings"] }),
      queryClient.invalidateQueries({ queryKey: bookingDetailKey(bookingId) }),
    ]);
  };

  const statusMutation = useMutation({
    mutationFn: (status: BookingStatus) =>
      updateBookingStatus(bookingId || "", status),
    onSuccess: refreshBookings,
  });

  const assignMutation = useMutation({
    mutationFn: (employeeId?: string | null) =>
      assignBookingEmployee(bookingId || "", employeeId),
    onSuccess: refreshBookings,
  });

  const rescheduleMutation = useMutation({
    mutationFn: (status: "accepted" | "declined") =>
      respondBookingReschedule(bookingId || "", status),
    onSuccess: refreshBookings,
  });

  const messageMutation = useMutation({
    mutationFn: () => startConversation({ bookingId: bookingId || "" }),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/(provider)/chat/${conversation._id}`);
    },
  });

  const booking = bookingQuery.data;
  const employees = employeesQuery.data ?? [];
  const error =
    bookingQuery.error ||
    profileQuery.error ||
    reviewQuery.error ||
    statusMutation.error ||
    assignMutation.error ||
    rescheduleMutation.error ||
    messageMutation.error;
  const isUpdating =
    statusMutation.isPending ||
    assignMutation.isPending ||
    rescheduleMutation.isPending;

  if (bookingQuery.isLoading || profileQuery.isLoading) {
    return (
      <LoadingScreen label="Loading booking..." showBackButton size={82} />
    );
  }

  return (
    <Screen
      fixedHeader={
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Booking details</Text>
            <Text style={styles.subtitle}>Manage this appointment</Text>
          </View>
        </View>
      }
    >
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{getApiErrorMessage(error)}</Text>
        </View>
      ) : null}

      {booking ? (
        <>
          <BookingDetailSummary booking={booking} viewer="provider" />

          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Conversation</Text>
            <Text style={styles.actionBody}>
              Message the client about this booking.
            </Text>
            <PrimaryButton
              label="Message client"
              loading={messageMutation.isPending}
              onPress={() => messageMutation.mutate()}
            />
          </View>

          <RescheduleResponseCard
            booking={booking}
            isUpdating={rescheduleMutation.isPending}
            onRespond={(status) => rescheduleMutation.mutate(status)}
          />

          {isBusinessProfile ? (
            <SpecialistAssignment
              booking={booking}
              employees={employees}
              isAssigning={assignMutation.isPending}
              onAssign={(employeeId) => assignMutation.mutate(employeeId)}
            />
          ) : null}

          <ProviderActions
            booking={booking}
            isUpdating={isUpdating}
            onStatusChange={(status) => statusMutation.mutate(status)}
          />

          <BookingReviewCard
            isLoading={reviewQuery.isLoading}
            review={reviewQuery.data ?? null}
            visible={booking.status === "completed"}
          />
        </>
      ) : null}
    </Screen>
  );
}

type SpecialistAssignmentProps = {
  booking: ProviderBooking;
  employees: BusinessEmployee[];
  isAssigning: boolean;
  onAssign: (employeeId?: string | null) => void;
};

type BookingReviewCardProps = {
  isLoading: boolean;
  review: Review | null;
  visible: boolean;
};

function BookingReviewCard({
  isLoading,
  review,
  visible,
}: BookingReviewCardProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.actionCard}>
      <Text style={styles.actionTitle}>Client review</Text>
      {isLoading ? (
        <LogoLoader label="Loading review..." size={28} />
      ) : review ? (
        <>
          <StarRow rating={review.rating} />
          <Text style={styles.reviewClient}>
            {review.client?.name || "Client"}
          </Text>
          {review.comment ? (
            <Text style={styles.reviewComment}>{review.comment}</Text>
          ) : (
            <Text style={styles.actionBody}>No written comment.</Text>
          )}
        </>
      ) : (
        <Text style={styles.actionBody}>
          The client has not reviewed this completed booking yet.
        </Text>
      )}
    </View>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Ionicons
          color={value <= rating ? colors.premium : colors.border}
          key={value}
          name={value <= rating ? "star" : "star-outline"}
          size={24}
        />
      ))}
    </View>
  );
}

type RescheduleResponseCardProps = {
  booking: ProviderBooking;
  isUpdating: boolean;
  onRespond: (status: "accepted" | "declined") => void;
};

function RescheduleResponseCard({
  booking,
  isUpdating,
  onRespond,
}: RescheduleResponseCardProps) {
  const request = booking.rescheduleRequest;

  if (!request?.status) {
    return null;
  }

  const pending = request.status === "pending";

  return (
    <View style={styles.actionCard}>
      <View style={styles.cardTitleRow}>
        <Text style={styles.actionTitle}>
          {pending ? "Reschedule requested" : "Latest reschedule"}
        </Text>
        <View style={[styles.requestPill, pending ? styles.pendingPill : null]}>
          <Text style={styles.requestPillText}>{request.status}</Text>
        </View>
      </View>
      <Text style={styles.actionBody}>
        {pending
          ? "Review the new date and time before approving."
          : "This is the most recent reschedule decision for this booking."}
      </Text>

      <View style={styles.requestSummary}>
        <DetailText label="Requested date" value={formatShortDate(request.requestedDate)} />
        <DetailText label="Requested time" value={request.requestedTime || "-"} />
        {request.reason ? <DetailText label="Reason" value={request.reason} /> : null}
      </View>

      {pending ? (
        <View style={styles.actionRow}>
          <PrimaryButton
            label="Decline"
            loading={isUpdating}
            onPress={() => onRespond("declined")}
            style={styles.actionButton}
            variant="secondary"
          />
          <PrimaryButton
            label="Approve"
            loading={isUpdating}
            onPress={() => onRespond("accepted")}
            style={styles.actionButton}
          />
        </View>
      ) : null}
    </View>
  );
}

function DetailText({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.detailTextRow}>
      <Text style={styles.detailTextLabel}>{label}</Text>
      <Text style={styles.detailTextValue}>{value || "-"}</Text>
    </View>
  );
}

const formatShortDate = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function SpecialistAssignment({
  booking,
  employees,
  isAssigning,
  onAssign,
}: SpecialistAssignmentProps) {
  const canAssign =
    ["pending", "accepted"].includes(booking.status) &&
    Boolean(booking.service?._id);
  const assignedEmployeeId = booking.employee?._id;
  const assignableEmployees = employees.filter(
    (employee) =>
      employee.status === "active" &&
      employee.isBookable !== false &&
      employee.services?.some((service) => service._id === booking.service?._id)
  );
  const anyAvailableSelected =
    !assignedEmployeeId && assignableEmployees.length > 0;

  if (!canAssign) {
    return null;
  }

  return (
    <View style={styles.actionCard}>
      <Text style={styles.actionTitle}>Specialist</Text>
      <Text style={styles.actionBody}>
        Assign a bookable team member for this service and time.
      </Text>

      <View style={styles.employeeChips}>
        <Pressable
          disabled={isAssigning || !assignableEmployees.length}
          onPress={() => onAssign(null)}
          style={[
            styles.employeeChip,
            anyAvailableSelected ? styles.employeeChipActive : null,
          ]}
        >
          <Text
            style={[
              styles.employeeChipText,
              anyAvailableSelected ? styles.employeeChipTextActive : null,
            ]}
          >
            Any available
          </Text>
        </Pressable>

        {assignableEmployees.map((employee) => {
          const selected = employee._id === assignedEmployeeId;

          return (
            <Pressable
              disabled={isAssigning || selected}
              key={employee._id}
              onPress={() => onAssign(employee._id)}
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
        <Text style={styles.emptyText}>
          Assign this service to an active, bookable employee first.
        </Text>
      ) : null}
    </View>
  );
}

type ProviderActionsProps = {
  booking: ProviderBooking;
  isUpdating: boolean;
  onStatusChange: (status: BookingStatus) => void;
};

function ProviderActions({
  booking,
  isUpdating,
  onStatusChange,
}: ProviderActionsProps) {
  return (
    <View style={styles.actionCard}>
      <Text style={styles.actionTitle}>Booking actions</Text>
      {booking.status === "pending" ? (
        <View style={styles.actionRow}>
          <PrimaryButton
            label="Decline"
            loading={isUpdating}
            onPress={() => onStatusChange("declined")}
            style={styles.actionButton}
            variant="secondary"
          />
          <PrimaryButton
            label="Accept"
            loading={isUpdating}
            onPress={() => onStatusChange("accepted")}
            style={styles.actionButton}
          />
        </View>
      ) : null}

      {booking.status === "accepted" ? (
        <PrimaryButton
          label="Mark completed"
          loading={isUpdating}
          onPress={() => onStatusChange("completed")}
        />
      ) : null}

      {!["pending", "accepted"].includes(booking.status) ? (
        <View style={styles.lockedAction}>
          <Ionicons color={colors.muted} name="lock-closed-outline" size={18} />
          <Text style={styles.lockedText}>
            No actions are available for this booking status.
          </Text>
        </View>
      ) : null}
    </View>
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
  errorCard: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "800",
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  actionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  cardTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  actionBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  requestPill: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pendingPill: {
    backgroundColor: colors.premium,
    borderColor: colors.premium,
  },
  requestPillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  requestSummary: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  detailTextRow: {
    gap: 2,
  },
  detailTextLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  detailTextValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  starRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  reviewClient: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  reviewComment: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  employeeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  employeeChip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 160,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
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
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  lockedAction: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  lockedText: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
