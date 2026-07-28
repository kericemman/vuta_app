import { Redirect } from "expo-router";
import { LoadingScreen } from "../src/components/LoadingScreen";
import { useAuthStore } from "../src/store/auth.store";

export default function IndexScreen() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === "client") {
    return <Redirect href="/(client)/home" />;
  }

  if (user.role === "admin") {
    return <Redirect href="/admin" />;
  }

  return <Redirect href="/(provider)/dashboard" />;
}
