import ISO6391 from "iso-639-1";

export const LANGUAGE_STORAGE_KEY = "vuta.app.language";

export type AfricanLanguage = {
  code: string;
  fallbackName?: string;
  fallbackNativeName?: string;
  region: string;
};

export const africanLanguages: AfricanLanguage[] = [
  { code: "en", region: "Widely used" },
  { code: "sw", region: "East Africa" },
  { code: "ar", region: "North Africa, Sudan, Sahel" },
  { code: "fr", region: "West, Central, North Africa" },
  { code: "pt", region: "Angola, Mozambique, Guinea-Bissau" },
];

export const defaultLanguageCode = "en";

export const isAppLanguageCode = (value?: string | null) =>
  Boolean(value && africanLanguages.some((language) => language.code === value));

export const normalizeAppLanguageCode = (value?: string | null) => {
  if (!value) return defaultLanguageCode;

  const baseCode = value.toLowerCase().split(/[-_]/)[0];

  return isAppLanguageCode(baseCode) ? baseCode : defaultLanguageCode;
};

export const getLanguageName = (language: AfricanLanguage) =>
  ISO6391.getName(language.code) || language.fallbackName || language.code;

export const getNativeLanguageName = (language: AfricanLanguage) =>
  ISO6391.getNativeName(language.code) ||
  language.fallbackNativeName ||
  getLanguageName(language);
