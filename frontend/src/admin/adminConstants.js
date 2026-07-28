import {
  FiBriefcase,
  FiCalendar,
  FiFileText,
  FiGlobe,
  FiGrid,
  FiImage,
  FiLayers,
  FiLink,
  FiMessageSquare,
  FiSettings,
  FiUsers,
} from "react-icons/fi";

export const ADMIN_SESSION_STORAGE = "vuta_admin_session";

export const adminSections = [
  { id: "overview", icon: FiGrid, label: "Dashboard", path: "/admin" },
  { id: "waitlist", icon: FiGlobe, label: "Waitlist", path: "/admin/waitlist" },
  {
    id: "partnerships",
    icon: FiLink,
    label: "Partnerships",
    path: "/admin/partnerships",
  },
  { id: "users", icon: FiUsers, label: "Users", path: "/admin/users" },
  {
    id: "feedback",
    icon: FiMessageSquare,
    label: "Feedback",
    path: "/admin/feedback",
  },
  {
    id: "providers",
    icon: FiBriefcase,
    label: "Providers",
    path: "/admin/providers",
  },
  {
    id: "services",
    icon: FiLayers,
    label: "Services",
    path: "/admin/services",
  },
  {
    id: "adCards",
    icon: FiImage,
    label: "Ad Cards",
    path: "/admin/ad-cards",
  },
  {
    id: "updates",
    icon: FiFileText,
    label: "Updates",
    path: "/admin/updates",
  },
  {
    id: "bookings",
    icon: FiCalendar,
    label: "Bookings",
    path: "/admin/bookings",
  },
  { id: "system", icon: FiSettings, label: "System", path: "/admin/system" },
];

export const roleLabels = {
  admin: "Admin",
  beauty_business: "Beauty business",
  beauty_professional: "Beauty professional",
  client: "Client",
};

export const waitlistTypeLabels = {
  beauty_business: "Business",
  beauty_professional: "Professional",
  client: "Client",
};

export const partnershipStatusLabels = {
  archived: "Archived",
  contacted: "Contacted",
  new: "New",
  qualified: "Qualified",
};

export const partnershipStatuses = Object.keys(partnershipStatusLabels);

export const partnershipTypeLabels = {
  beauty_supplier: "Beauty supplier",
  brand: "Beauty brand",
  corporate: "Corporate partner",
  influencer: "Influencer / creator",
  investor: "Investor",
  media: "Media",
  other: "Other",
  training_academy: "Training academy",
};

export const partnershipTypes = Object.keys(partnershipTypeLabels);

export const bookingStatuses = [
  "pending",
  "accepted",
  "declined",
  "cancelled",
  "completed",
];

export const adPlacementLabels = {
  business_home: "Business home",
  client_home: "Client home",
  professional_home: "Professional home",
};

export const adPlacements = Object.keys(adPlacementLabels);

export const updateAudienceLabels = {
  all: "Everyone",
  beauty_business: "Businesses",
  beauty_professional: "Professionals",
  client: "Clients",
};

export const updateAudiences = Object.keys(updateAudienceLabels);

export const updateStatuses = ["draft", "published"];

export const feedbackTopicLabels = {
  booking: "Bookings",
  general: "General",
  messages: "Messages",
  other: "Other",
  payments: "Payments",
  performance: "Performance",
  profile: "Profile",
  search: "Search",
};

export const feedbackTopics = Object.keys(feedbackTopicLabels);

export const feedbackStatusLabels = {
  archived: "Archived",
  new: "New",
  planned: "Planned",
  reviewed: "Reviewed",
};

export const feedbackStatuses = Object.keys(feedbackStatusLabels);
