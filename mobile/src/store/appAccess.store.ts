import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { create } from "zustand";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type PermissionState = "denied" | "granted" | "undetermined" | "unknown";

export type AppCoordinates = {
  accuracy?: number | null;
  latitude: number;
  longitude: number;
  updatedAt: string;
};

type AppAccessState = {
  error: string | null;
  isRequesting: boolean;
  location: AppCoordinates | null;
  locationPermission: PermissionState;
  notificationPermission: PermissionState;
  bootstrapPermissions: () => Promise<void>;
  requestAppAccess: () => Promise<void>;
  requestLocation: () => Promise<void>;
  requestNotifications: () => Promise<void>;
  resetAppAccess: () => void;
};

const toPermissionState = (status?: string): PermissionState => {
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  if (status === "undetermined") return "undetermined";
  return "unknown";
};

const readDeviceLocation = async (): Promise<AppCoordinates> => {
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    accuracy: position.coords.accuracy,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    updatedAt: new Date(position.timestamp).toISOString(),
  };
};

export const useAppAccessStore = create<AppAccessState>((set, get) => ({
  error: null,
  isRequesting: false,
  location: null,
  locationPermission: "unknown",
  notificationPermission: "unknown",

  bootstrapPermissions: async () => {
    const notificationPermission = await Notifications.getPermissionsAsync();
    set({
      location: null,
      locationPermission: "unknown",
      notificationPermission: toPermissionState(notificationPermission.status),
    });
  },

  requestAppAccess: async () => {
    await get().requestNotifications();
  },

  requestLocation: async () => {
    set({ error: null, isRequesting: true });

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      const permissionState = toPermissionState(permission.status);

      if (permissionState !== "granted") {
        set({ location: null, locationPermission: permissionState });
        return;
      }

      set({
        location: await readDeviceLocation(),
        locationPermission: "granted",
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Location could not be loaded.",
      });
    } finally {
      set({ isRequesting: false });
    }
  },

  requestNotifications: async () => {
    try {
      const permission = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      set({
        notificationPermission: toPermissionState(permission.status),
      });
    } catch {
      set({ notificationPermission: "denied" });
    }
  },

  resetAppAccess: () => {
    set({
      error: null,
      isRequesting: false,
      location: null,
      locationPermission: "unknown",
      notificationPermission: "unknown",
    });
  },
}));
