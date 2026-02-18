"use client";

import { useTranslation } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Send, Loader2 } from "lucide-react";

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onClose?: () => void;
}

export function FormNavigation({
  currentStep,
  totalSteps,
  isFirstStep,
  isLastStep,
  isSubmitting,
  onNext,
  onPrevious,
  onSubmit,
  onClose,
}: FormNavigationProps) {
  const { t } = useTranslation();

  return (
    <footer className="shrink-0 px-3 py-3 border-t bg-linear-to-t from-muted/30 to-background/80 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Back / Previous button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={isFirstStep ? onClose : onPrevious}
          disabled={isSubmitting}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline text-xs font-medium">
            {isFirstStep ? t("common.cancel") : t("common.previous")}
          </span>
        </Button>

        {/* Step indicator pill */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/60 border border-border/50">
          <span className="text-xs font-bold text-primary">{currentStep}</span>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-xs text-muted-foreground font-medium">
            {totalSteps}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isLastStep ? (
            <Button
              type="button"
              size="sm"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span className="hidden sm:inline text-xs font-medium">
                    {t("inspectionsPage.form.submit")}
                  </span>
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onNext}
              disabled={isSubmitting}
            >
              <span className="text-xs font-medium">{t("common.next")}</span>
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
