import { Redirect } from "expo-router";
import { AppUpdateDetailScreen } from "../../src/components/updates/AppUpdateDetailScreen";
import { useAuthStore } from "../../src/store/auth.store";

const allowedRoles = ["client", "beauty_professional", "beauty_business"];

export default function UpdateDetailRoute() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Redirect href="/" />;
  }

  return <AppUpdateDetailScreen />;
}
