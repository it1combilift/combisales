"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface LanguageValidationAlertProps {
  /** Whether to show the alert */
  show: boolean;
  /** Optional className for styling */
  className?: string;
}

/**
 * Alert component that warns SELLER users they must use English.
 * Provides a button to quickly switch to English.
 */
export function LanguageValidationAlert({
  show,
  className,
}: LanguageValidationAlertProps) {
  const { t, setLocale } = useI18n();

  if (!show) {
    return null;
  }

  const handleSwitchToEnglish = () => {
    setLocale("en");
  };

  return (
    <Alert variant="info" className={className}>
      <Languages className="size-4" />
      <AlertTitle>{t("forms.languageValidation.title")}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-balance">{t("forms.languageValidation.description")}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSwitchToEnglish}
          className="shrink-0 gap-2"
        >
          <Languages className="h-3.5 w-3.5" />
          {t("forms.languageValidation.switchLanguage")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
