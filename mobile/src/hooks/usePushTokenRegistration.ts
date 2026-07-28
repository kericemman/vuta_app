import { useEffect, useRef } from "react";
import { registerCurrentDeviceForPush } from "../services/pushToken.service";
import { useAppAccessStore } from "../store/appAccess.store";
import { useAppConfigStore } from "../store/appConfig.store";
import { useAuthStore } from "../store/auth.store";

export function usePushTokenRegistration() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const appConfigLoading = useAppConfigStore((state) => state.isLoading);
  const isBlockingMode = useAppConfigStore(
    (state) => state.config.security.isBlockingMode
  );
  const notificationPermission = useAppAccessStore(
    (state) => state.notificationPermission
  );
  const user = useAuthStore((state) => state.user);
  const registrationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      appConfigLoading ||
      isBlockingMode ||
      !accessToken ||
      !user ||
      notificationPermission !== "granted"
    ) {
      registrationKeyRef.current = null;
      return;
    }

    const registrationKey = `${user.id}:${notificationPermission}`;

    if (registrationKeyRef.current === registrationKey) {
      return;
    }

    registrationKeyRef.current = registrationKey;
    registerCurrentDeviceForPush().catch((error) => {
      registrationKeyRef.current = null;
      console.warn("Push token registration failed:", error.message);
    });
  }, [
    accessToken,
    appConfigLoading,
    isBlockingMode,
    notificationPermission,
    user,
  ]);
}
