import * as Localization from "expo-localization";
import * as SecureStore from "expo-secure-store";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  LANGUAGE_STORAGE_KEY,
  defaultLanguageCode,
  normalizeAppLanguageCode,
} from "./languages";
import { resources } from "./resources";

let initPromise: Promise<typeof i18n> | null = null;

const getDeviceLanguage = () =>
  Localization.getLocales()[0]?.languageCode || defaultLanguageCode;

const getInitialLanguage = async () => {
  const storedLanguage = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);

  return normalizeAppLanguageCode(storedLanguage || getDeviceLanguage());
};

export const initI18n = async () => {
  if (i18n.isInitialized) return i18n;
  if (initPromise) return initPromise;

  initPromise = getInitialLanguage().then(async (language) => {
    await i18n.use(initReactI18next).init({
      fallbackLng: defaultLanguageCode,
      interpolation: {
        escapeValue: false,
      },
      lng: language,
      resources,
      returnNull: false,
    });

    return i18n;
  });

  return initPromise;
};

export const changeAppLanguage = async (language: string) => {
  const appLanguage = normalizeAppLanguageCode(language);

  await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, appLanguage);
  await i18n.changeLanguage(appLanguage);

  return {
    appLanguage,
  };
};

export { i18n };
