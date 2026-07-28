import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { ServiceSummary } from "../types/marketplace";
import { getServiceImage } from "../utils/marketplace";

const MAX_RECENT_SERVICES = 8;
const STORAGE_PREFIX = "vuta:recently-viewed-services";

export type RecentlyViewedService = ServiceSummary & {
  viewedAt: string;
};

type RecentlyViewedState = {
  hydratedUserId: string | null;
  isHydrated: boolean;
  services: RecentlyViewedService[];
  clearServices: (userId?: string | null) => Promise<void>;
  hydrate: (userId?: string | null) => Promise<void>;
  recordServiceView: (
    userId: string | null | undefined,
    service: ServiceSummary
  ) => Promise<void>;
};

const getStorageKey = (userId?: string | null) =>
  `${STORAGE_PREFIX}:${userId || "guest"}`;

const buildServiceSnapshot = (
  service: ServiceSummary
): RecentlyViewedService => {
  const imageUrl = getServiceImage(service);

  return {
    _id: service._id,
    category: service.category,
    currency: service.currency,
    description: service.description,
    duration: service.duration,
    imageUrl,
    isActive: service.isActive,
    name: service.name,
    price: service.price,
    provider: service.provider
      ? {
          _id: service.provider._id,
          area: service.provider.area,
          averageRating: service.provider.averageRating,
          businessName: service.provider.businessName,
          city: service.provider.city,
          country: service.provider.country,
          distanceKm: service.provider.distanceKm,
          reviewCount: service.provider.reviewCount,
          serviceMode: service.provider.serviceMode,
          user: service.provider.user
            ? {
                name: service.provider.user.name,
                phone: service.provider.user.phone,
                profileImage: service.provider.user.profileImage,
              }
            : undefined,
          verificationStatus: service.provider.verificationStatus,
        }
      : undefined,
    viewedAt: new Date().toISOString(),
  };
};

const readRecentServices = async (userId?: string | null) => {
  const stored = await AsyncStorage.getItem(getStorageKey(userId));

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.slice(0, MAX_RECENT_SERVICES)
      : [];
  } catch {
    await AsyncStorage.removeItem(getStorageKey(userId));
    return [];
  }
};

export const useRecentlyViewedStore = create<RecentlyViewedState>(
  (set, get) => ({
    hydratedUserId: null,
    isHydrated: false,
    services: [],

    clearServices: async (userId) => {
      await AsyncStorage.removeItem(getStorageKey(userId));
      set({
        hydratedUserId: userId || "guest",
        isHydrated: true,
        services: [],
      });
    },

    hydrate: async (userId) => {
      const normalizedUserId = userId || "guest";

      if (
        get().isHydrated &&
        get().hydratedUserId === normalizedUserId
      ) {
        return;
      }

      const services = await readRecentServices(userId);
      set({
        hydratedUserId: normalizedUserId,
        isHydrated: true,
        services,
      });
    },

    recordServiceView: async (userId, service) => {
      const normalizedUserId = userId || "guest";

      if (!get().isHydrated || get().hydratedUserId !== normalizedUserId) {
        await get().hydrate(userId);
      }

      const snapshot = buildServiceSnapshot(service);
      const services = [
        snapshot,
        ...get().services.filter((item) => item._id !== service._id),
      ].slice(0, MAX_RECENT_SERVICES);

      await AsyncStorage.setItem(
        getStorageKey(userId),
        JSON.stringify(services)
      );
      set({
        hydratedUserId: normalizedUserId,
        isHydrated: true,
        services,
      });
    },
  })
);
