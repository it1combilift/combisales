import { FORM_STEPS } from "../constants";
import { FormNavigationProps } from "../types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, ArrowRight, Send, Save, FileDown } from "lucide-react";

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
}: FormNavigationProps) {
  const isDisabled =
    isSubmitting ||
    isSavingDraft ||
    isSavingChanges ||
    isUploading ||
    deletingFileId !== null;

  return (
    <footer className="shrink-0 px-2 py-2 border-t bg-muted/20">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Back button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={isFirstStep ? onBack : onPrev}
          disabled={isDisabled}
          className="text-muted-foreground hover:text-foreground h-8 px-2"
        >
          <ArrowLeft className="size-3.5" />
          <span className="hidden sm:inline text-xs font-medium ml-1">
            {isFirstStep ? "Salir" : "Atrás"}
          </span>
        </Button>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-[11px]">
          <span className="font-bold text-primary">{currentStep}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground font-medium">
            {FORM_STEPS.length}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {isLastStep ? (
            <>
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onSaveChanges}
                      disabled={
                      isDisabled ||
                      !allStepsComplete ||
                      isUploading ||
                      deletingFileId !== null ||
                      isSavingChanges ||
                      isSubmitting
                    }
                    className="h-8 px-2"
                    title={
                      !allStepsComplete
                        ? "Completa todos los pasos"
                        : "Guardar cambios"
                    }
                  >
                    {isSavingChanges ? (
                      <Spinner variant="ellipsis" className="size-3" />
                    ) : (
                      <>
                        <Save className="size-3.5" />
                        <span className="hidden sm:inline text-xs ml-1">
                          Guardar
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
                      isUploading ||
                      deletingFileId !== null ||
                      isSavingChanges ||
                      isSubmitting
                    }
                    className="h-8 px-2"
                    title={
                      !allStepsComplete
                        ? "Completa todos los pasos"
                        : "Guardar y enviar"
                    }
                  >
                    {isSubmitting ? (
                      <Spinner variant="ellipsis" className="size-3" />
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        <span className="hidden sm:inline text-xs ml-1">
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
                    className="h-8 px-2"
                    title={
                      !allStepsComplete
                        ? "Completa todos los pasos"
                        : "Borrador"
                    }
                  >
                    {isSavingDraft ? (
                      <Spinner variant="ellipsis" />
                    ) : (
                      <>
                        <FileDown className="size-3.5" />
                        <span className="hidden sm:inline text-xs">
                          Borrador
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
                      isUploading ||
                      deletingFileId !== null ||
                      isSavingChanges ||
                      isSubmitting
                    }
                    className="h-8 px-2"
                    title={
                      !allStepsComplete
                        ? "Completa todos los pasos"
                        : "Guardar y enviar"
                    }
                  >
                    {isSubmitting ? (
                      <Spinner variant="ellipsis" className="size-3" />
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        <span className="text-xs hidden sm:inline">Enviar</span>
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
              className="h-8 px-3"
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
