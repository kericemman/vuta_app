import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { LoadingScreen } from "../src/components/LoadingScreen";
import { SafeModeScreen } from "../src/components/SafeModeScreen";
import { useAppAccessBootstrap } from "../src/hooks/useAppAccessBootstrap";
import { usePushNotificationRouting } from "../src/hooks/usePushNotificationRouting";
import { usePushTokenRegistration } from "../src/hooks/usePushTokenRegistration";
import { useRealtimeUpdates } from "../src/hooks/useRealtimeUpdates";
import { useAppConfigStore } from "../src/store/appConfig.store";
import { useAuthStore } from "../src/store/auth.store";

const queryClient = new QueryClient();

function RealtimeBridge() {
  useAppAccessBootstrap();
  usePushNotificationRouting();
  usePushTokenRegistration();
  useRealtimeUpdates();

  return null;
}

function RootNavigator() {
  const appConfigBootstrap = useAppConfigStore((state) => state.bootstrap);
  const appConfigError = useAppConfigStore((state) => state.error);
  const appConfigLoading = useAppConfigStore((state) => state.isLoading);
  const appConfigRefresh = useAppConfigStore((state) => state.refresh);
  const security = useAppConfigStore((state) => state.config.security);
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    bootstrap();
    appConfigBootstrap();
  }, [appConfigBootstrap, bootstrap]);

  useEffect(() => {
    if (security.mode === "incident_lockdown" && user) {
      setSession(null);
    }
  }, [security.mode, setSession, user]);

  if (!isHydrated || appConfigLoading) {
    return <LoadingScreen />;
  }

  if (security.isBlockingMode) {
    return (
      <SafeModeScreen
        error={appConfigError}
        isLoading={appConfigLoading}
        onRetry={appConfigRefresh}
        security={security}
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(client)" />
      <Stack.Screen name="(provider)" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeBridge />
      <RootNavigator />
    </QueryClientProvider>
  );
}
