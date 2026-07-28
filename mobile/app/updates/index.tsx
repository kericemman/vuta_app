import { Redirect } from "expo-router";
import { AppUpdatesScreen } from "../../src/components/updates/AppUpdatesScreen";
import { useAuthStore } from "../../src/store/auth.store";

const allowedRoles = ["client", "beauty_professional", "beauty_business"];

export default function UpdatesRoute() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Redirect href="/" />;
  }

  return <AppUpdatesScreen />;
}
