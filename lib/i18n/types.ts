export type Locale = "es" | "en";

export interface LocaleConfig {
  code: Locale;
  name: string;
  shortName: string;
  flag: string;
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
}

export const locales: Record<Locale, LocaleConfig> = {
  es: {
    code: "es",
    name: "Español",
    shortName: "ES",
    flag: "🇪🇸",
    dateFormat: "dd/MM/yyyy",
    numberFormat: {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  },
  en: {
    code: "en",
    name: "English",
    shortName: "EN",
    flag: "🇺🇸",
    dateFormat: "MM/dd/yyyy",
    numberFormat: {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  },
};

export const defaultLocale: Locale = "es";

export const LOCALE_STORAGE_KEY = "app-locale";
