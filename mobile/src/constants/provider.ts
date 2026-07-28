export const providerCategories = [
  "Hair",
  "Makeup",
  "Nails",
  "Spa",
  "Barber",
  "Lashes",
  "Brows",
  "Skincare",
];

export const businessSpecializationSuggestions = [
  "Hair Stylist",
  "Makeup Artist",
  "Nail Technician",
  "Barber",
  "Spa Therapist",
  "Lash Technician",
  "Brow Specialist",
  "Skincare Specialist",
  "Braider",
  "Colorist",
  "Massage Therapist",
  "Receptionist",
];

export const serviceModes = [
  {
    label: "Studio and home",
    value: "both",
  },
  {
    label: "At my location",
    value: "provider_location",
  },
  {
    label: "Home service",
    value: "home_service",
  },
] as const;

export const defaultAvailability = [
  { day: "Monday", opensAt: "09:00", closesAt: "18:00", isAvailable: true },
  { day: "Tuesday", opensAt: "09:00", closesAt: "18:00", isAvailable: true },
  { day: "Wednesday", opensAt: "09:00", closesAt: "18:00", isAvailable: true },
  { day: "Thursday", opensAt: "09:00", closesAt: "18:00", isAvailable: true },
  { day: "Friday", opensAt: "09:00", closesAt: "18:00", isAvailable: true },
  { day: "Saturday", opensAt: "10:00", closesAt: "16:00", isAvailable: true },
  { day: "Sunday", opensAt: "", closesAt: "", isAvailable: false },
];
