import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../constants/theme";
import { ProviderBooking } from "../types/provider";
import { formatBookingDate, formatMoney } from "../utils/provider";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type BookingDetailSummaryProps = {
  booking: ProviderBooking;
  viewer: "client" | "provider";
};

export function BookingDetailSummary({
  booking,
  viewer,
}: BookingDetailSummaryProps) {
  const providerName =
    booking.provider?.businessName || booking.provider?.user?.name || "Beauty profile";
  const providerLocation = [
    booking.provider?.area,
    booking.provider?.city,
    booking.provider?.country,
  ]
    .filter(Boolean)
    .join(", ");
  const clientName = booking.client?.name || "Client";
  const specialistName =
    booking.employee?.name ||
    (viewer === "client" ? "Any available specialist" : "Not assigned");

  return (
    <View style={styles.card}>
      <View style={styles.heroRow}>
        <View style={styles.serviceIcon}>
          <Ionicons color={colors.primary} name="sparkles-outline" size={22} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.serviceName}>
            {booking.service?.name || "Service booking"}
          </Text>
          <Text style={styles.serviceMeta}>
            {booking.service?.category || "Beauty service"}
          </Text>
        </View>
        <StatusPill status={booking.status} />
      </View>

      <View style={styles.rows}>
        <DetailRow
          icon="calendar-outline"
          label="Date"
          value={formatBookingDate(booking.bookingDate)}
        />
        <DetailRow icon="time-outline" label="Time" value={booking.bookingTime} />
        <DetailRow
          icon="wallet-outline"
          label="Price"
          value={formatMoney(booking.price, booking.currency)}
        />
        <DetailRow
          icon="location-outline"
          label="Mode"
          value={formatServiceMode(booking.serviceMode)}
        />
        {viewer === "client" ? (
          <>
            <DetailRow icon="business-outline" label="Profile" value={providerName} />
            {providerLocation ? (
              <DetailRow
                icon="map-outline"
                label="Location"
                value={providerLocation}
              />
            ) : null}
          </>
        ) : (
          <>
            <DetailRow icon="person-outline" label="Client" value={clientName} />
            {booking.client?.phone ? (
              <DetailRow
                icon="call-outline"
                label="Phone"
                value={booking.client.phone}
              />
            ) : null}
          </>
        )}
        <DetailRow icon="people-outline" label="Specialist" value={specialistName} />
        {booking.address ? (
          <DetailRow icon="home-outline" label="Address" value={booking.address} />
        ) : null}
        {booking.notes ? (
          <DetailRow icon="document-text-outline" label="Notes" value={booking.notes} />
        ) : null}
      </View>
    </View>
  );
}

type DetailRowProps = {
  icon: IoniconName;
  label: string;
  value: string;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons color={colors.primary} name={icon} size={18} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function StatusPill({ status }: { status: ProviderBooking["status"] }) {
  return (
    <View style={[styles.statusPill, getStatusStyle(status)]}>
      <Text
        style={[
          styles.statusText,
          status === "pending" ? styles.statusTextPending : null,
        ]}
      >
        {status.replace("_", " ")}
      </Text>
    </View>
  );
}

const formatServiceMode = (mode: ProviderBooking["serviceMode"]) => {
  if (mode === "home_service") {
    return "Home service";
  }

  if (mode === "provider_location") {
    return "Business location";
  }

  return "Flexible";
};

const getStatusStyle = (status: ProviderBooking["status"]) => {
  if (status === "accepted" || status === "completed") {
    return styles.statusPositive;
  }

  if (status === "cancelled" || status === "declined") {
    return styles.statusNegative;
  }

  return styles.statusPending;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  heroRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  serviceIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  heroCopy: {
    flex: 1,
  },
  serviceName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  serviceMeta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusPending: {
    backgroundColor: colors.premium,
  },
  statusPositive: {
    backgroundColor: colors.success,
  },
  statusNegative: {
    backgroundColor: colors.danger,
  },
  statusText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  statusTextPending: {
    color: colors.text,
  },
  rows: {
    gap: spacing.sm,
  },
  detailRow: {
    alignItems: "flex-start",
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
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  detailValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
    marginTop: 1,
  },
});
