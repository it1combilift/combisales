import { FormNavigationProps } from "../types";
import { Button } from "@/components/ui/button";
import { FORM_STEPS } from "../constants";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, ArrowRight, Send, Save, FileDown } from "lucide-react";

/**
 * Form navigation footer with back, next, and save buttons
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
}: FormNavigationProps) {
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
            {isFirstStep ? "Salir" : "Atrás"}
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

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isLastStep ? (
            <>
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onSaveChanges}
                    disabled={isDisabled || !allStepsComplete}
                    title={
                      !allStepsComplete
                        ? "Completa todos los pasos para guardar"
                        : "Guardar cambios"
                    }
                  >
                    {isSavingChanges ? (
                      <Spinner variant="ellipsis" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    {!isSavingChanges && (
                      <span className="hidden sm:inline text-xs font-medium">
                        Guardar
                      </span>
                    )}
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isDisabled || !allStepsComplete}
                    title={
                      !allStepsComplete
                        ? "Completa todos los pasos para guardar"
                        : "Enviar"
                    }
                  >
                    {isSubmitting ? (
                      <Spinner variant="ellipsis" />
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        <span className="hidden sm:inline text-xs font-medium">
                          Enviar
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
                    disabled={isDisabled}
                    title={
                      !allStepsComplete
                        ? "Completa todos los pasos para guardar"
                        : "Guardar como borrador"
                    }
                  >
                    {isSavingDraft ? (
                      <Spinner variant="ellipsis" />
                    ) : (
                      <FileDown className="size-3.5" />
                    )}
                    <span className="hidden sm:inline text-xs font-medium">
                      Borrador
                    </span>
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isDisabled || !allStepsComplete}
                    title={
                      !allStepsComplete
                        ? "Completa todos los pasos para guardar"
                        : "Enviar"
                    }
                  >
                    {isSubmitting ? (
                      <Spinner variant="ellipsis" />
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        <span className="text-xs font-medium hidden sm:inline">
                          Enviar
                        </span>
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
              <span className="text-xs font-medium">Siguiente</span>
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
