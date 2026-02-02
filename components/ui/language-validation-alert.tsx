"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface LanguageValidationAlertProps {
  show: boolean;
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
      <AlertTitle className="text-pretty text-sm">
        {t("forms.languageValidation.title")}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span className="text-xs text-pretty">
          {t("forms.languageValidation.description")}
        </span>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleSwitchToEnglish}
          className="shrink-0"
        >
          <Languages className="size-4" />
          {t("forms.languageValidation.switchLanguage")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
