import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { colors } from "../../src/constants/theme";
import { useLiveTabBadges } from "../../src/hooks/useLiveTabBadges";
import { useAuthStore } from "../../src/store/auth.store";

const providerRoles = ["beauty_professional", "beauty_business"];

export default function ProviderLayout() {
  const { t } = useTranslation();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);
  const tabBadges = useLiveTabBadges({
    enabled: isHydrated && Boolean(user && providerRoles.includes(user.role)),
    scope: "provider",
  });

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!providerRoles.includes(user.role)) {
    return <Redirect href="/" />;
  }

  const isBusiness = user.role === "beauty_business";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("tabs.dashboard"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          tabBarBadge: tabBadges.bookingBadge,
          tabBarBadgeStyle: styles.tabBarBadge,
          title: t("tabs.bookings"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="calendar-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: t("tabs.services"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="list-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarBadge: tabBadges.messageBadge,
          tabBarBadgeStyle: styles.tabBarBadge,
          title: t("tabs.messages"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="chatbubble-ellipses-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          href: isBusiness ? null : undefined,
          title: t("tabs.portfolio"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="images-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          href: isBusiness ? undefined : null,
          title: t("tabs.team"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="people-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="person-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="professional-profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="business-profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="language"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="feedback"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="booking-details/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBadge: {
    backgroundColor: colors.cta,
    color: colors.surface,
    fontSize: 10,
    fontWeight: "800",
  },
});
