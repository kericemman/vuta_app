import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BackButton } from "../../../src/components/BackButton";
import { BookingDetailSummary } from "../../../src/components/BookingDetailSummary";
import { LoadingScreen } from "../../../src/components/LoadingScreen";
import { PrimaryButton } from "../../../src/components/PrimaryButton";
import { Screen } from "../../../src/components/Screen";
import { colors, radii, spacing } from "../../../src/constants/theme";
import { getApiErrorMessage } from "../../../src/services/api";
import {
  getBookingById,
  requestBookingReschedule,
  updateClientBookingStatus,
} from "../../../src/services/booking.service";
import { startConversation } from "../../../src/services/message.service";
import {
  createReview,
  getBookingReview,
} from "../../../src/services/review.service";
import { ProviderBooking } from "../../../src/types/provider";
import { Review } from "../../../src/types/review";

const bookingDetailKey = (bookingId?: string) =>
  ["booking-detail", bookingId] as const;

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

const toDateValue = (date: Date) => date.toISOString().slice(0, 10);

const dayLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { weekday: "short" });

const monthDayLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { day: "numeric", month: "short" });

export default function ClientBookingDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const bookingId = params.id;
  const queryClient = useQueryClient();
  const [rescheduleDate, setRescheduleDate] = useState(() =>
    toDateValue(new Date())
  );
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState(timeSlots[0]);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const calendarDays = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return date;
      }),
    []
  );

  const bookingQuery = useQuery({
    queryKey: bookingDetailKey(bookingId),
    queryFn: () => getBookingById(bookingId || ""),
    enabled: Boolean(bookingId),
  });

  const reviewQuery = useQuery({
    queryKey: ["booking-review", bookingId],
    queryFn: () => getBookingReview(bookingId || ""),
    enabled: Boolean(bookingId && bookingQuery.data?.status === "completed"),
  });

  const cancelMutation = useMutation({
    mutationFn: () => updateClientBookingStatus(bookingId || "", "cancelled"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      queryClient.invalidateQueries({ queryKey: bookingDetailKey(bookingId) });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: () =>
      requestBookingReschedule(bookingId || "", {
        bookingDate: rescheduleDate,
        bookingTime: rescheduleTime,
        reason: rescheduleReason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      queryClient.invalidateQueries({ queryKey: bookingDetailKey(bookingId) });
      setRescheduleReason("");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      createReview({
        bookingId: bookingId || "",
        comment: reviewComment,
        rating: reviewRating,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-review", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["provider-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["service-details"] });
      queryClient.invalidateQueries({ queryKey: bookingDetailKey(bookingId) });
      setReviewComment("");
    },
  });

  const messageMutation = useMutation({
    mutationFn: () => startConversation({ bookingId: bookingId || "" }),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/(client)/chat/${conversation._id}`);
    },
  });

  const booking = bookingQuery.data;
  const canCancel =
    booking?.status === "pending" || booking?.status === "accepted";
  const pendingReschedule =
    booking?.rescheduleRequest?.status === "pending";
  const canRequestReschedule = Boolean(canCancel && !pendingReschedule);
  const error =
    bookingQuery.error ||
    cancelMutation.error ||
    rescheduleMutation.error ||
    messageMutation.error ||
    reviewMutation.error;

  useEffect(() => {
    if (!booking) {
      return;
    }

    setRescheduleDate(toDateValue(new Date(booking.bookingDate)));
    setRescheduleTime(booking.bookingTime);
  }, [booking?._id, booking?.bookingDate, booking?.bookingTime]);

  const confirmCancel = () => {
    Alert.alert(
      "Cancel booking",
      "This will notify the professional or business that you cancelled this booking.",
      [
        { style: "cancel", text: "Keep booking" },
        {
          onPress: () => cancelMutation.mutate(),
          style: "destructive",
          text: "Cancel booking",
        },
      ]
    );
  };

  if (bookingQuery.isLoading) {
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
            <Text style={styles.subtitle}>Track your appointment</Text>
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
          <BookingDetailSummary booking={booking} viewer="client" />

          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Conversation</Text>
            <Text style={styles.actionBody}>
              Message about this booking.
            </Text>
            <PrimaryButton
              label="Message"
              loading={messageMutation.isPending}
              onPress={() => messageMutation.mutate()}
            />
          </View>

          <ReschedulePanel
            booking={booking}
            canRequest={canRequestReschedule}
            calendarDays={calendarDays}
            isLoading={rescheduleMutation.isPending}
            onDateChange={setRescheduleDate}
            onReasonChange={setRescheduleReason}
            onSubmit={() => rescheduleMutation.mutate()}
            onTimeChange={setRescheduleTime}
            reason={rescheduleReason}
            selectedDate={rescheduleDate}
            selectedTime={rescheduleTime}
          />

          <ReviewPanel
            comment={reviewComment}
            existingReview={reviewQuery.data ?? null}
            isLoading={reviewMutation.isPending || reviewQuery.isLoading}
            onCommentChange={setReviewComment}
            onRatingChange={setReviewRating}
            onSubmit={() => reviewMutation.mutate()}
            rating={reviewRating}
            visible={booking.status === "completed"}
          />

          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Booking actions</Text>
            <Text style={styles.actionBody}>
              You can cancel while the booking is still pending or accepted.
            </Text>
            {canCancel ? (
              <PrimaryButton
                label="Cancel booking"
                loading={cancelMutation.isPending}
                onPress={confirmCancel}
                variant="secondary"
              />
            ) : (
              <View style={styles.lockedAction}>
                <Ionicons color={colors.muted} name="lock-closed-outline" size={18} />
                <Text style={styles.lockedText}>
                  No actions are available for this booking status.
                </Text>
              </View>
            )}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

type ReviewPanelProps = {
  comment: string;
  existingReview: Review | null;
  isLoading: boolean;
  onCommentChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onSubmit: () => void;
  rating: number;
  visible: boolean;
};

function ReviewPanel({
  comment,
  existingReview,
  isLoading,
  onCommentChange,
  onRatingChange,
  onSubmit,
  rating,
  visible,
}: ReviewPanelProps) {
  if (!visible) {
    return null;
  }

  if (existingReview) {
    return (
      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>Your review</Text>
        <StarRow rating={existingReview.rating} readOnly />
        {existingReview.comment ? (
          <Text style={styles.reviewComment}>{existingReview.comment}</Text>
        ) : (
          <Text style={styles.actionBody}>You rated this booking.</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.actionCard}>
      <Text style={styles.actionTitle}>Review this booking</Text>
      <Text style={styles.actionBody}>
        Your review helps clients choose trusted professionals.
      </Text>
      <StarRow rating={rating} onChange={onRatingChange} />
      <TextInput
        multiline
        onChangeText={onCommentChange}
        placeholder="Share what went well"
        placeholderTextColor={colors.muted}
        style={[styles.textInput, styles.reasonInput]}
        textAlignVertical="top"
        value={comment}
      />
      <PrimaryButton
        label="Submit review"
        loading={isLoading}
        onPress={onSubmit}
      />
    </View>
  );
}

type StarRowProps = {
  onChange?: (value: number) => void;
  rating: number;
  readOnly?: boolean;
};

function StarRow({ onChange, rating, readOnly = false }: StarRowProps) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((value) => {
        const active = value <= rating;

        return (
          <Pressable
            disabled={readOnly}
            key={value}
            onPress={() => onChange?.(value)}
            style={styles.starButton}
          >
            <Ionicons
              color={active ? colors.premium : colors.border}
              name={active ? "star" : "star-outline"}
              size={28}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

type ReschedulePanelProps = {
  booking: ProviderBooking;
  calendarDays: Date[];
  canRequest: boolean;
  isLoading: boolean;
  onDateChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
  onTimeChange: (value: string) => void;
  reason: string;
  selectedDate: string;
  selectedTime: string;
};

function ReschedulePanel({
  booking,
  calendarDays,
  canRequest,
  isLoading,
  onDateChange,
  onReasonChange,
  onSubmit,
  onTimeChange,
  reason,
  selectedDate,
  selectedTime,
}: ReschedulePanelProps) {
  const pendingRequest = booking.rescheduleRequest?.status === "pending";

  if (pendingRequest) {
    return (
      <View style={styles.actionCard}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.actionTitle}>Reschedule pending</Text>
          <View style={styles.pendingPill}>
            <Text style={styles.pendingPillText}>Waiting</Text>
          </View>
        </View>
        <Text style={styles.actionBody}>
          The professional or business will approve or decline this new time.
        </Text>
        <View style={styles.requestSummary}>
          <DetailText label="Requested date" value={formatShortDate(booking.rescheduleRequest?.requestedDate)} />
          <DetailText label="Requested time" value={booking.rescheduleRequest?.requestedTime || "-"} />
          {booking.rescheduleRequest?.reason ? (
            <DetailText label="Reason" value={booking.rescheduleRequest.reason} />
          ) : null}
        </View>
      </View>
    );
  }

  if (!canRequest) {
    return null;
  }

  return (
    <View style={styles.actionCard}>
      <Text style={styles.actionTitle}>Request new time</Text>
      <Text style={styles.actionBody}>
        Choose a new slot. Your current booking stays active until it is
        approved.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.calendarRow}>
          {calendarDays.map((date) => {
            const value = toDateValue(date);
            const selected = value === selectedDate;

            return (
              <Pressable
                key={value}
                onPress={() => onDateChange(value)}
                style={[styles.dayCard, selected ? styles.dayCardActive : null]}
              >
                <Text
                  style={[styles.dayName, selected ? styles.dayTextActive : null]}
                >
                  {dayLabel(date)}
                </Text>
                <Text
                  style={[styles.dayDate, selected ? styles.dayTextActive : null]}
                >
                  {monthDayLabel(date)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.timeGrid}>
        {timeSlots.map((slot) => {
          const selected = slot === selectedTime;

          return (
            <Pressable
              key={slot}
              onPress={() => onTimeChange(slot)}
              style={[styles.timeChip, selected ? styles.timeChipActive : null]}
            >
              <Text
                style={[
                  styles.timeChipText,
                  selected ? styles.timeChipTextActive : null,
                ]}
              >
                {slot}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        multiline
        onChangeText={onReasonChange}
        placeholder="Reason, optional"
        placeholderTextColor={colors.muted}
        style={[styles.textInput, styles.reasonInput]}
        textAlignVertical="top"
        value={reason}
      />

      <PrimaryButton
        label="Request reschedule"
        loading={isLoading}
        onPress={onSubmit}
      />
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
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  actionBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  pendingPill: {
    backgroundColor: colors.premium,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pendingPillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900",
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
  calendarRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  dayCard: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    minWidth: 74,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dayCardActive: {
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
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  dayTextActive: {
    color: colors.surface,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  timeChip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  timeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  timeChipTextActive: {
    color: colors.surface,
  },
  textInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  reasonInput: {
    minHeight: 84,
  },
  starRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  starButton: {
    paddingVertical: spacing.xs,
  },
  reviewComment: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
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
