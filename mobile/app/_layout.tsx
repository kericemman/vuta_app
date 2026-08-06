import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useSegments } from "expo-router";
import { useEffect, useMemo } from "react";
import { LoadingScreen } from "../src/components/LoadingScreen";
import { OverTheAirUpdatePrompt } from "../src/components/OverTheAirUpdatePrompt";
import { SafeModeScreen } from "../src/components/SafeModeScreen";
import { useAppAccessBootstrap } from "../src/hooks/useAppAccessBootstrap";
import { usePushNotificationRouting } from "../src/hooks/usePushNotificationRouting";
import { usePushTokenRegistration } from "../src/hooks/usePushTokenRegistration";
import { useRealtimeUpdates } from "../src/hooks/useRealtimeUpdates";
import { changeAppLanguage } from "../src/i18n";
import { VutaI18nProvider } from "../src/i18n/I18nProvider";
import { useAppConfigStore } from "../src/store/appConfig.store";
import { useAuthStore } from "../src/store/auth.store";
import { useNavigationHistoryStore } from "../src/store/navigationHistory.store";

const queryClient = new QueryClient();

function RealtimeBridge() {
  useAppAccessBootstrap();
  usePushNotificationRouting();
  usePushTokenRegistration();
  useRealtimeUpdates();

  return null;
}

const getHistoryHref = (pathname: string, segments: string[]) => {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const routeGroups = segments.filter((segment) => /^\(.+\)$/.test(segment));

  if (!routeGroups.length) {
    return normalizedPathname;
  }

  const groupPrefix = `/${routeGroups.join("/")}`;

  if (normalizedPathname === "/") {
    return groupPrefix;
  }

  if (normalizedPathname.startsWith(groupPrefix)) {
    return normalizedPathname;
  }

  return `${groupPrefix}${normalizedPathname}`;
};

function NavigationHistoryBridge() {
  const pathname = usePathname();
  const segments = useSegments();
  const record = useNavigationHistoryStore((state) => state.record);
  const historyHref = useMemo(
    () => getHistoryHref(pathname, segments as string[]),
    [pathname, segments]
  );

  useEffect(() => {
    record(historyHref);
  }, [historyHref, record]);

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

  useEffect(() => {
    if (user?.language) {
      changeAppLanguage(user.language).catch(() => undefined);
    }
  }, [user?.language]);

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
    <VutaI18nProvider>
      <QueryClientProvider client={queryClient}>
        <RealtimeBridge />
        <NavigationHistoryBridge />
        <RootNavigator />
        <OverTheAirUpdatePrompt />
      </QueryClientProvider>
    </VutaI18nProvider>
  );
}
