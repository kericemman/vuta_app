import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { LoadingScreen } from "../components/LoadingScreen";
import { i18n, initI18n } from "./index";

type VutaI18nProviderProps = {
  children: ReactNode;
};

export function VutaI18nProvider({ children }: VutaI18nProviderProps) {
  const [isReady, setIsReady] = useState(i18n.isInitialized);

  useEffect(() => {
    let mounted = true;

    initI18n().finally(() => {
      if (mounted) {
        setIsReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
