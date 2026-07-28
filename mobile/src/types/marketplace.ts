export type PortfolioImage = {
  caption?: string;
  publicId?: string;
  url: string;
};

export type ProviderAccountType = "individual" | "business";

export type ProviderSummary = {
  _id: string;
  accountType?: ProviderAccountType;
  area?: string;
  averageRating?: number;
  bio?: string;
  businessName?: string;
  categories?: string[];
  city?: string;
  country?: string;
  distanceKm?: number;
  portfolio?: PortfolioImage[];
  reviewCount?: number;
  serviceMode?: "both" | "home_service" | "provider_location";
  user?: {
    name?: string;
    phone?: string;
    profileImage?: string;
  };
};

export type ServiceSummary = {
  _id: string;
  category: string;
  currency: string;
  description?: string;
  duration?: number;
  imageUrl?: string;
  isActive?: boolean;
  name: string;
  price: number;
  provider?: {
    _id: string;
    accountType?: ProviderAccountType;
    area?: string;
    averageRating?: number;
    bio?: string;
    businessName?: string;
    categories?: string[];
    city?: string;
    country?: string;
    distanceKm?: number;
    portfolio?: PortfolioImage[];
    reviewCount?: number;
    serviceMode?: "both" | "home_service" | "provider_location";
    user?: {
      name?: string;
      phone?: string;
      profileImage?: string;
    };
    verificationStatus?: string;
  };
};

export type ProviderDetails = {
  provider: ProviderSummary;
  services: ServiceSummary[];
};

export type FavouriteSummary = {
  _id: string;
  createdAt?: string;
  provider: ProviderSummary;
  updatedAt?: string;
};

export type MarketplaceListParams = {
  area?: string;
  category?: string;
  city?: string;
  country?: string;
  limit?: number;
  lat?: number;
  lng?: number;
  maxPrice?: number;
  minPrice?: number;
  minRating?: number;
  page?: number;
  providerId?: string;
  q?: string;
  radiusKm?: number;
  serviceMode?: "both" | "home_service" | "provider_location";
};
