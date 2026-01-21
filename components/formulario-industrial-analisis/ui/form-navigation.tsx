import { FORM_STEPS } from "../constants";
import { VisitStatus } from "@prisma/client";
import { FormNavigationProps } from "../types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/lib/i18n/context";

import {
  ArrowLeft,
  ArrowRight,
  Send,
  Save,
  FileDown,
  CheckCircle,
} from "lucide-react";

/**
 * Form navigation footer
 */
export function FormNavigation({
  currentStep,
  isFirstStep,
  isLastStep,
  isEditing,
  allStepsComplete,
  isSubmitting,
  isSavingDraft,
  isSavingChanges,
  isUploading,
  deletingFileId,
  onBack,
  onPrev,
  onNext,
  onSaveDraft,
  onSaveChanges,
  visitIsCompleted,
  readOnly = false,
}: FormNavigationProps) {
  const { t } = useI18n();
  const isDisabled =
    isSubmitting ||
    isSavingDraft ||
    isSavingChanges ||
    isUploading ||
    deletingFileId !== null;

  return (
    <footer className="shrink-0 px-3 py-3 border-t bg-linear-to-t from-muted/30 to-background/80 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Back button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={isFirstStep ? onBack : onPrev}
          disabled={isDisabled}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline text-xs font-medium">
            {isFirstStep
              ? t("visits.formNavigation.backToSelection")
              : t("visits.formNavigation.previousStep")}
          </span>
        </Button>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/60 border border-border/50">
          <span className="text-xs font-bold text-primary">{currentStep}</span>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-xs text-muted-foreground font-medium">
            {FORM_STEPS.length}
          </span>
        </div>

        {/* Action buttons - hidden in readOnly mode except for navigation */}
        <div className="flex items-center gap-2">
          {/* In readOnly mode, only show Next button for navigation */}
          {readOnly ? (
            !isLastStep && (
              <Button
                type="button"
                size="sm"
                onClick={onNext}
                disabled={isDisabled}
              >
                <span className="text-xs font-medium">
                  {t("visits.formNavigation.nextStep")}
                </span>
                <ArrowRight className="size-3.5" />
              </Button>
            )
          ) : isLastStep ? (
            <>
              {isEditing && !visitIsCompleted ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onSaveChanges}
                    disabled={isDisabled || !onSaveChanges}
                    title={
                      !onSaveChanges
                        ? t("forms.languageValidation.title")
                        : !allStepsComplete
                          ? t("visits.formNavigation.completeAllSteps")
                          : t("visits.formNavigation.saveChanges")
                    }
                  >
                    {isSavingChanges ? (
                      <Spinner variant="ellipsis" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    {!isSavingChanges && (
                      <span className="hidden sm:inline text-xs font-medium">
                        {t("visits.formNavigation.saveChanges")}
                      </span>
                    )}
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isDisabled || !allStepsComplete}
                    title={
                      !allStepsComplete
                        ? t("visits.formNavigation.completeAllSteps")
                        : t("visits.formNavigation.submit")
                    }
                  >
                    {isSubmitting ? (
                      <Spinner variant="ellipsis" />
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        <span className="hidden sm:inline text-xs font-medium">
                          {t("visits.formNavigation.submit")}
                        </span>
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onSaveDraft}
                    disabled={isDisabled || !onSaveDraft}
                    className={visitIsCompleted ? "hidden" : ""}
                    title={
                      !onSaveDraft
                        ? t("forms.languageValidation.title")
                        : !allStepsComplete
                          ? t("visits.formNavigation.completeAllSteps")
                          : t("visits.formNavigation.saveDraft")
                    }
                  >
                    {isSavingDraft ? (
                      <Spinner variant="ellipsis" />
                    ) : (
                      <>
                        <FileDown className="size-3.5" />
                        <span className="hidden sm:inline text-xs font-medium">
                          {t("visits.formNavigation.saveDraft")}
                        </span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      isDisabled ||
                      !allStepsComplete ||
                      visitIsCompleted === VisitStatus.COMPLETADA
                    }
                    className={
                      visitIsCompleted
                        ? "px-2 opacity-50 cursor-not-allowed"
                        : ""
                    }
                    title={
                      !allStepsComplete
                        ? t("visits.formNavigation.completeAllSteps")
                        : t("visits.formNavigation.submit")
                    }
                  >
                    {isSubmitting ? (
                      <Spinner variant="ellipsis" />
                    ) : (
                      <>
                        {visitIsCompleted ? (
                          <>
                            <CheckCircle className="size-3.5" />
                            <span className="hidden sm:inline text-xs font-medium">
                              {t("tasks.completed")}
                            </span>
                          </>
                        ) : (
                          <>
                            <Send className="size-3.5" />
                            <span className="hidden sm:inline text-xs font-medium">
                              {t("visits.formNavigation.submit")}
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </>
              )}
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onNext}
              disabled={isDisabled}
            >
              <span className="text-xs font-medium">
                {t("visits.formNavigation.nextStep")}
              </span>
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
