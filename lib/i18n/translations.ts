import type { Locale } from "./types";
import es from "@/locales/es.json";
import en from "@/locales/en.json";

export type TranslationKeys = typeof es;

const translations: Record<Locale, TranslationKeys> = {
  es,
  en,
};

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || translations.es;
}

// Helper to get nested keys like "common.save"
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): string {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof current === "string" ? current : path;
}

// Interpolation helper for variables like {{count}}
export function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return values[key]?.toString() ?? `{{${key}}}`;
  });
}

// Pluralization helper
export function pluralize(
  translations: TranslationKeys,
  key: string,
  count: number
): string {
  const pluralKey =
    count === 0 ? `${key}_zero` : count === 1 ? `${key}_one` : `${key}_other`;
  const translation = getNestedValue(
    translations as unknown as Record<string, unknown>,
    `plurals.${pluralKey}`
  );
  return interpolate(translation, { count });
}
