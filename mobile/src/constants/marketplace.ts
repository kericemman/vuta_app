import { ProviderSummary, ServiceSummary } from "../types/marketplace";

export type ServiceCategory = {
  icon: string;
  label: string;
  shortLabel: string;
  value: string;
};

export const serviceCategories: ServiceCategory[] = [
  { icon: "hair-dryer", label: "Hair", shortLabel: "Hair", value: "Hair" },
  { icon: "hand-back-right-outline", label: "Nails", shortLabel: "Nails", value: "Nails" },
  { icon: "brush", label: "Makeup", shortLabel: "Makeup", value: "Makeup" },
  { icon: "spa", label: "Spa", shortLabel: "Spa", value: "Spa" },
  { icon: "face-man-shimmer", label: "Barber", shortLabel: "Barber", value: "Barber" },
];

export const sampleProviders: ProviderSummary[] = [
  {
    _id: "sample-provider-tola",
    accountType: "individual",
    area: "Kilimani",
    averageRating: 4.9,
    businessName: "Tola A.",
    categories: ["Hair"],
    city: "Nairobi",
    country: "Kenya",
    reviewCount: 128,
    user: {
      name: "Tola A.",
    },
  },
  {
    _id: "sample-provider-bimpe",
    accountType: "individual",
    area: "Westlands",
    averageRating: 4.9,
    businessName: "Bimpe O.",
    categories: ["Makeup"],
    city: "Nairobi",
    country: "Kenya",
    reviewCount: 96,
    user: {
      name: "Bimpe O.",
    },
  },
  {
    _id: "sample-provider-sarah",
    accountType: "individual",
    area: "Lavington",
    averageRating: 4.8,
    businessName: "Nail Pro Sarah",
    categories: ["Nails"],
    city: "Nairobi",
    country: "Kenya",
    reviewCount: 74,
    user: {
      name: "Sarah N.",
    },
  },
];

export const sampleServices: ServiceSummary[] = [
  {
    _id: "sample-service-silk-press",
    category: "Hair",
    currency: "KES",
    duration: 90,
    name: "Silk Press",
    price: 18000,
    provider: {
      _id: "sample-provider-tola",
      area: "Kilimani",
      businessName: "Tola A.",
      city: "Nairobi",
    },
  },
  {
    _id: "sample-service-glam",
    category: "Makeup",
    currency: "KES",
    duration: 75,
    name: "Full Glam Makeup",
    price: 25000,
    provider: {
      _id: "sample-provider-bimpe",
      area: "Westlands",
      businessName: "Bimpe O.",
      city: "Nairobi",
    },
  },
  {
    _id: "sample-service-manicure",
    category: "Nails",
    currency: "KES",
    duration: 60,
    name: "Gel Manicure",
    price: 10000,
    provider: {
      _id: "sample-provider-sarah",
      area: "Lavington",
      businessName: "Nail Pro Sarah",
      city: "Nairobi",
    },
  },
];

export const clientPreferenceOptions = [
  "Hair",
  "Makeup",
  "Nails",
  "Spa",
  "Barber",
  "Home service",
  "Verified beauty profiles",
  "Budget friendly",
  "Premium experiences",
  "Weekend bookings",
];
