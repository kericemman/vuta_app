import { useCallback, useMemo } from "react";
import { useAppAccessStore } from "../store/appAccess.store";
import { MarketplaceListParams } from "../types/marketplace";

const nearbyRadiusKm = 25;
const isNearbyDiscoveryEnabled = false;

export function useMarketplaceLocation() {
  const location = useAppAccessStore((state) => state.location);
  const locationPermission = useAppAccessStore(
    (state) => state.locationPermission
  );
  const isRequesting = useAppAccessStore((state) => state.isRequesting);
  const requestDeviceLocation = useAppAccessStore(
    (state) => state.requestLocation
  );
  const isUsingDeviceLocation =
    isNearbyDiscoveryEnabled &&
    locationPermission === "granted" &&
    Boolean(location);

  const params = useMemo<Pick<
    MarketplaceListParams,
    "area" | "city" | "country" | "lat" | "lng" | "radiusKm"
  >>(() => {
    if (isNearbyDiscoveryEnabled && locationPermission === "granted" && location) {
      return {
        lat: Number(location.latitude.toFixed(6)),
        lng: Number(location.longitude.toFixed(6)),
        radiusKm: nearbyRadiusKm,
      };
    }

    return {};
  }, [location, locationPermission]);

  const label = isUsingDeviceLocation
    ? "Near you"
    : "Showing all approved beauty profiles";

  const requestLocation = useCallback(async () => {
    if (!isNearbyDiscoveryEnabled) {
      return;
    }

    await requestDeviceLocation();
  }, [requestDeviceLocation]);

  return {
    isNearbyDiscoveryEnabled,
    isRequestingLocation: isRequesting,
    isUsingDeviceLocation,
    label,
    locationPermission,
    params,
    requestLocation,
  };
}
