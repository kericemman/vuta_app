import { useEffect, useRef } from "react";
import { useAppConfigStore } from "../store/appConfig.store";
import { useAppAccessStore } from "../store/appAccess.store";
import { useAuthStore } from "../store/auth.store";

export function useAppAccessBootstrap() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const appConfigLoading = useAppConfigStore((state) => state.isLoading);
  const isBlockingMode = useAppConfigStore(
    (state) => state.config.security.isBlockingMode
  );
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);
  const bootstrapPermissions = useAppAccessStore(
    (state) => state.bootstrapPermissions
  );
  const requestAppAccess = useAppAccessStore((state) => state.requestAppAccess);
  const resetAppAccess = useAppAccessStore((state) => state.resetAppAccess);
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (appConfigLoading || isBlockingMode || !accessToken || !user) {
      hasRequestedRef.current = false;
      resetAppAccess();
      return;
    }

    if (hasRequestedRef.current) {
      return;
    }

    hasRequestedRef.current = true;
    bootstrapPermissions().finally(() => {
      requestAppAccess();
    });
  }, [
    accessToken,
    appConfigLoading,
    bootstrapPermissions,
    isBlockingMode,
    isHydrated,
    requestAppAccess,
    resetAppAccess,
    user,
  ]);
}
