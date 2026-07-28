import {
  BusinessProfileHome,
  ProfessionalProfileHome,
} from "../../src/components/provider/ProviderProfileHome";
import { useAuthStore } from "../../src/store/auth.store";

export default function ProviderProfileScreen() {
  const user = useAuthStore((state) => state.user);

  if (user?.role === "beauty_business") {
    return <BusinessProfileHome />;
  }

  return <ProfessionalProfileHome />;
}
