import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DashboardCard } from "../../src/components/DashboardCard";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { colors, radii, spacing } from "../../src/constants/theme";
import { listMyClientBookings } from "../../src/services/booking.service";
import { ProviderBooking } from "../../src/types/provider";
import { formatBookingDate, formatMoney } from "../../src/utils/provider";

export default function ClientBookingsScreen() {
  const bookingsQuery = useQuery({
    queryKey: ["client-bookings"],
    queryFn: listMyClientBookings,
    retry: 1,
  });

  const bookings = bookingsQuery.data ?? [];

  if (bookingsQuery.isLoading) {
    return (
      <LoadingScreen label="Loading bookings..." showBackButton size={82} />
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Bookings</Text>

      <DashboardCard title="Booking history">
        {bookings.length ? (
          bookings.map((booking) => (
            <BookingRow booking={booking} key={booking._id} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.body}>
              No bookings yet. Choose a service and request a time that works
              for you.
            </Text>
            <PrimaryButton
              label="Browse services"
              onPress={() => router.push("/(client)/explore")}
            />
          </View>
        )}
      </DashboardCard>
    </Screen>
  );
}

type BookingRowProps = {
  booking: ProviderBooking;
};

function BookingRow({ booking }: BookingRowProps) {
  const providerName =
    booking.provider?.businessName || booking.provider?.user?.name || "Beauty profile";

  return (
    <Pressable
      onPress={() => router.push(`/(client)/booking-details/${booking._id}`)}
      style={({ pressed }) => [
        styles.bookingRow,
        pressed ? styles.bookingRowPressed : null,
      ]}
    >
      <View style={styles.iconBox}>
        <Ionicons color={colors.primary} name="calendar-outline" size={19} />
      </View>
      <View style={styles.bookingCopy}>
        <Text style={styles.bookingTitle}>
          {booking.service?.name || "Service"}
        </Text>
        <Text style={styles.bookingMeta}>
          {providerName} · {formatBookingDate(booking.bookingDate)} at{" "}
          {booking.bookingTime}
          {booking.employee?.name ? ` · ${booking.employee.name}` : ""}
        </Text>
        <Text style={styles.bookingPrice}>
          {formatMoney(booking.price, booking.currency)}
        </Text>
      </View>
      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{booking.status}</Text>
      </View>
      <Ionicons color={colors.muted} name="chevron-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
    marginTop: spacing.lg,
  },
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  emptyState: {
    gap: spacing.md,
  },
  bookingRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  bookingRowPressed: {
    opacity: 0.75,
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  bookingCopy: {
    flex: 1,
    gap: 2,
  },
  bookingTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  bookingMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  bookingPrice: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  statusPill: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  statusText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },
});
