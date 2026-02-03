"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";

import {
  type Locale,
  type LocaleConfig,
  locales,
  defaultLocale,
  LOCALE_STORAGE_KEY,
} from "./types";

import {
  getTranslations,
  getNestedValue,
  interpolate,
  pluralize,
  type TranslationKeys,
} from "./translations";
import { Role } from "@prisma/client";

interface I18nContextType {
  locale: Locale;
  localeConfig: LocaleConfig;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  tp: (key: string, count: number) => string;
  formatNumber: (value: number) => string;
  formatDate: (date: Date) => string;
  formatCurrency: (value: number, currency?: string) => string;
  translations: TranslationKeys;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale ?? defaultLocale,
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasAppliedRoleDefault, setHasAppliedRoleDefault] = useState(false);

  const { data: session, status } = useSession();

  // Determine if the user is a SELLER or ADMIN (should default to English)
  const isSellerOrAdmin =
    session?.user?.role === Role.ADMIN || session?.user?.role === Role.SELLER;

  // Load saved locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem(
      LOCALE_STORAGE_KEY,
    ) as Locale | null;

    if (savedLocale && locales[savedLocale]) {
      // User has a saved preference - respect it
      setLocaleState(savedLocale);
      setHasAppliedRoleDefault(true); // Mark as handled since user has explicit preference
    }

    setIsHydrated(true);
  }, []);

  // Apply role-based default language ONLY when:
  // 1. Session is authenticated (status === "authenticated")
  // 2. User is SELLER or ADMIN
  // 3. We haven't already applied the role default
  // 4. No saved locale exists (first time users)
  useEffect(() => {
    if (
      status === "authenticated" &&
      isSellerOrAdmin &&
      !hasAppliedRoleDefault &&
      isHydrated
    ) {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);

      // Only apply role-based default if user has no saved preference
      if (!savedLocale) {
        setLocaleState("en");
        localStorage.setItem(LOCALE_STORAGE_KEY, "en");
      }

      setHasAppliedRoleDefault(true);
    }
  }, [status, isSellerOrAdmin, hasAppliedRoleDefault, isHydrated]);

  // Update HTML lang attribute when locale changes
  useEffect(() => {
    if (isHydrated) {
      document.documentElement.lang = locale;
    }
  }, [locale, isHydrated]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (locales[newLocale]) {
      setLocaleState(newLocale);
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
  }, []);

  const translations = getTranslations(locale);
  const localeConfig = locales[locale];

  // Translation function with interpolation support
  const t = useCallback(
    (key: string, values?: Record<string, string | number>): string => {
      const translation = getNestedValue(
        translations as unknown as Record<string, unknown>,
        key,
      );
      return values ? interpolate(translation, values) : translation;
    },
    [translations],
  );

  // Pluralization function
  const tp = useCallback(
    (key: string, count: number): string => {
      return pluralize(translations, key, count);
    },
    [translations],
  );

  // Number formatting
  const formatNumber = useCallback(
    (value: number): string => {
      return new Intl.NumberFormat(locale, localeConfig.numberFormat).format(
        value,
      );
    },
    [locale, localeConfig.numberFormat],
  );

  // Date formatting
  const formatDate = useCallback(
    (date: Date): string => {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    },
    [locale],
  );

  // Currency formatting
  const formatCurrency = useCallback(
    (value: number, currency = "USD"): string => {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(value);
    },
    [locale],
  );

  // Prevent hydration mismatch by rendering default until hydrated
  const contextValue: I18nContextType = {
    locale,
    localeConfig,
    setLocale,
    t,
    tp,
    formatNumber,
    formatDate,
    formatCurrency,
    translations,
  };

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

// Convenience hook for just translations
export function useTranslation() {
  const { t, tp, locale } = useI18n();
  return { t, tp, locale };
}
