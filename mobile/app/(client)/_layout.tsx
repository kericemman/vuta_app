import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { colors } from "../../src/constants/theme";
import { useLiveTabBadges } from "../../src/hooks/useLiveTabBadges";
import { useAuthStore } from "../../src/store/auth.store";

export default function ClientLayout() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);
  const tabBadges = useLiveTabBadges({
    enabled: isHydrated && user?.role === "client",
    scope: "client",
  });

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== "client") {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="search" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          tabBarBadge: tabBadges.bookingBadge,
          tabBarBadgeStyle: styles.tabBarBadge,
          title: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="calendar-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="heart-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarBadge: tabBadges.messageBadge,
          tabBarBadgeStyle: styles.tabBarBadge,
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="chatbubble-ellipses-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="person-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="preferences"
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
        name="notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="services/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="providers/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="providers/[id]/team/[employeeId]"
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
