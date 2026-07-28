import { User } from "./auth";
import {
  PortfolioImage,
  ProviderAccountType,
  ServiceSummary,
} from "./marketplace";

export type ServiceMode = "both" | "provider_location" | "home_service";

export type ProviderVerificationStatus = "pending" | "approved" | "rejected";

export type ProviderAvailability = {
  closesAt?: string;
  day?: string;
  isAvailable?: boolean;
  opensAt?: string;
};

export type ProviderProfile = {
  _id: string;
  accountType: ProviderAccountType;
  area: string;
  availability?: ProviderAvailability[];
  averageRating?: number;
  bio?: string;
  businessName?: string;
  businessNameChangeRequest?: {
    decisionNote?: string;
    reason?: string;
    requestedAt?: string;
    requestedName?: string;
    reviewedAt?: string;
    status?: ProviderVerificationStatus;
  };
  categories?: string[];
  city: string;
  country: string;
  isActive?: boolean;
  portfolio?: PortfolioImage[];
  reviewCount?: number;
  serviceMode?: ServiceMode;
  user?: Pick<User, "id" | "name" | "phone" | "profileImage">;
  verificationStatus?: ProviderVerificationStatus;
};

export type ProviderProfilePayload = {
  accountType?: ProviderAccountType;
  area: string;
  availability?: ProviderAvailability[];
  bio?: string;
  businessName?: string;
  businessNameChangeReason?: string;
  categories?: string[];
  city: string;
  country: string;
  isActive?: boolean;
  serviceMode?: ServiceMode;
};

export type ProviderServicePayload = {
  category?: string;
  currency?: string;
  description?: string;
  duration?: number;
  imageUrl?: string;
  isActive?: boolean;
  name?: string;
  price?: number;
};

export type BusinessEmployeeStatus = "active" | "off_duty" | "inactive";

export type BusinessEmployeeRole = "owner" | "manager" | "staff";

export type BusinessEmployee = {
  _id: string;
  availability?: ProviderAvailability[];
  bio?: string;
  business: string;
  email?: string;
  isBookable?: boolean;
  jobTitle?: string;
  name: string;
  phone?: string;
  profileImage?: string;
  profileImagePublicId?: string;
  role?: BusinessEmployeeRole;
  services?: ServiceSummary[];
  sortOrder?: number;
  specializations?: string[];
  status?: BusinessEmployeeStatus;
};

export type BusinessEmployeePayload = {
  availability?: ProviderAvailability[];
  bio?: string;
  email?: string;
  isBookable?: boolean;
  jobTitle?: string;
  name?: string;
  phone?: string;
  profileImage?: string;
  profileImagePublicId?: string;
  role?: BusinessEmployeeRole;
  services?: string[];
  sortOrder?: number;
  specializations?: string[];
  status?: BusinessEmployeeStatus;
};

export type BusinessStats = {
  averageBookingValue: number;
  averageRating: number;
  bookingStatusBreakdown: Record<BookingStatus, number>;
  counts: {
    activeEmployees: number;
    activeServices: number;
    bookableEmployees: number;
    savedByClients: number;
    todayBookings: number;
    totalEmployees: number;
    totalServices: number;
    upcomingBookings: number;
  };
  currency: string;
  generatedAt: string;
  portfolioCount: number;
  revenue: {
    monthRevenue: number;
    todayRevenue: number;
    totalRevenue: number;
    weekRevenue: number;
  };
  reviewCount: number;
  topServices: Array<{
    bookings: number;
    category: string;
    name: string;
    revenue: number;
    serviceId: string;
  }>;
};

export type BookingStatus =
  | "accepted"
  | "cancelled"
  | "completed"
  | "declined"
  | "pending";

export type RescheduleStatus = "accepted" | "declined" | "pending";

export type ProviderBooking = {
  _id: string;
  address?: string;
  bookingDate: string;
  bookingTime: string;
  client?: {
    _id?: string;
    name?: string;
    phone?: string;
    profileImage?: string;
  };
  currency: string;
  createdAt?: string;
  employee?: Pick<
    BusinessEmployee,
    | "_id"
    | "isBookable"
    | "jobTitle"
    | "name"
    | "profileImage"
    | "specializations"
    | "status"
  >;
  price: number;
  notes?: string;
  provider?: {
    _id?: string;
    area?: string;
    businessName?: string;
    city?: string;
    country?: string;
    user?: {
      name?: string;
      phone?: string;
      profileImage?: string;
    };
  };
  rescheduleRequest?: {
    createdAt?: string;
    reason?: string;
    requestedBy?: string;
    requestedDate?: string;
    requestedTime?: string;
    respondedAt?: string;
    respondedBy?: string;
    status?: RescheduleStatus;
    updatedAt?: string;
  };
  service?: Pick<
    ServiceSummary,
    "_id" | "category" | "currency" | "duration" | "name" | "price"
  >;
  serviceMode: ServiceMode;
  status: BookingStatus;
  updatedAt?: string;
};
