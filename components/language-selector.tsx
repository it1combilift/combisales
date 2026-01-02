"use client";

import { Globe, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { locales, type Locale } from "@/lib/i18n/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSelectorProps {
  showFlag?: boolean;
  showFullName?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}

export function LanguageSelector({
  showFlag = true,
  showFullName = false,
  size = "default",
}: LanguageSelectorProps) {
  const { locale, setLocale, localeConfig, t } = useI18n();

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className="gap-2"
          aria-label={t("header.selectLanguage")}
        >
          {showFlag && <span className="text-base">{localeConfig.flag}</span>}
          {size !== "icon" && (
            <span className="font-medium">
              {showFullName ? localeConfig.name : localeConfig.shortName}
            </span>
          )}
          {size === "icon" && <Globe className="size-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {Object.values(locales).map((localeOption) => (
          <DropdownMenuItem
            key={localeOption.code}
            onClick={() => handleLanguageChange(localeOption.code)}
            className="flex items-center justify-between gap-3 cursor-pointer"
            aria-label={localeOption.name}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{localeOption.flag}</span>
              <span>{localeOption.name}</span>
            </div>
            {locale === localeOption.code && (
              <Check className="size-4 text-primary" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
