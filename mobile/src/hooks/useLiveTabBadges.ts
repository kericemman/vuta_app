import { useQuery } from "@tanstack/react-query";
import { listMyClientBookings } from "../services/booking.service";
import { listConversations } from "../services/message.service";
import { listMyBookings } from "../services/provider.service";
import { ProviderBooking } from "../types/provider";

type BadgeScope = "client" | "provider";
type TabBadge = number | string | undefined;

type UseLiveTabBadgesOptions = {
  enabled: boolean;
  scope: BadgeScope;
};

const messagePollIntervalMs = 30_000;
const bookingPollIntervalMs = 45_000;

const clientBookingsQueryKey = ["client-bookings"] as const;
const providerBookingsQueryKey = ["provider-bookings"] as const;
const conversationsQueryKey = ["conversations"] as const;

export function useLiveTabBadges({ enabled, scope }: UseLiveTabBadgesOptions) {
  const conversationsQuery = useQuery({
    queryKey: conversationsQueryKey,
    queryFn: listConversations,
    enabled,
    refetchInterval: messagePollIntervalMs,
    retry: 1,
  });

  const bookingsQuery = useQuery({
    queryKey:
      scope === "client" ? clientBookingsQueryKey : providerBookingsQueryKey,
    queryFn: scope === "client" ? listMyClientBookings : listMyBookings,
    enabled,
    refetchInterval: bookingPollIntervalMs,
    retry: 1,
  });

  const unreadMessageCount = (conversationsQuery.data ?? []).reduce(
    (total, conversation) => total + (conversation.unreadCount || 0),
    0
  );
  const pendingBookingCount = (bookingsQuery.data ?? []).filter(isPendingBooking)
    .length;

  return {
    bookingBadge: getTabBadge(pendingBookingCount),
    messageBadge: getTabBadge(unreadMessageCount),
    pendingBookingCount,
    unreadMessageCount,
  };
}

const getTabBadge = (count: number): TabBadge => {
  if (count <= 0) {
    return undefined;
  }

  return count > 99 ? "99+" : count;
};

const isPendingBooking = (booking: ProviderBooking) =>
  booking.status === "pending" || booking.rescheduleRequest?.status === "pending";
