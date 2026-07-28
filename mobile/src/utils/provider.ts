import { defaultAvailability } from "../constants/provider";
import { User } from "../types/auth";
import {
  ProviderBooking,
  ProviderProfile,
  ProviderProfilePayload,
} from "../types/provider";

export const formatMoney = (amount = 0, currency = "KES") =>
  `${currency === "KES" ? "KES " : `${currency} `}${Math.round(
    amount
  ).toLocaleString()}`;

export const formatBookingDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
};

export const isToday = (value: string) => {
  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const getProviderDisplayName = (
  profile: ProviderProfile | null | undefined,
  user: User | null | undefined
) => profile?.businessName || user?.name || "there";

export const getProviderLocation = (
  profile: ProviderProfile | null | undefined,
  user: User | null | undefined
) =>
  [profile?.area || user?.area, profile?.city || user?.city]
    .filter(Boolean)
    .join(", ");

export const getProfileCompletion = (
  profile: ProviderProfile | null | undefined
) => {
  if (!profile) {
    return 0;
  }

  const checks = [
    Boolean(profile.bio),
    Boolean(profile.categories?.length),
    Boolean(profile.area && profile.city && profile.country),
    Boolean(profile.serviceMode),
    Boolean(profile.availability?.length),
    Boolean(profile.portfolio?.length),
  ];
  const completed = checks.filter(Boolean).length;

  return Math.round((completed / checks.length) * 100);
};

export const buildProviderPayload = (
  profile: ProviderProfile,
  overrides: Partial<ProviderProfilePayload> = {}
): ProviderProfilePayload => ({
  accountType: profile.accountType,
  area: profile.area,
  availability: profile.availability?.length
    ? profile.availability
    : defaultAvailability,
  bio: profile.bio,
  businessName: profile.businessName,
  categories: profile.categories ?? [],
  city: profile.city,
  country: profile.country,
  isActive: profile.isActive,
  serviceMode: profile.serviceMode || "both",
  ...overrides,
});

export const getDashboardSummary = (bookings: ProviderBooking[] = []) => {
  const todayBookings = bookings.filter((booking) =>
    isToday(booking.bookingDate)
  );
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  );
  const todayEarnings = todayBookings
    .filter((booking) => booking.status === "completed")
    .reduce((sum, booking) => sum + booking.price, 0);

  return {
    pendingRequests: pendingBookings.length,
    todayBookings: todayBookings.length,
    todayEarnings,
  };
};
