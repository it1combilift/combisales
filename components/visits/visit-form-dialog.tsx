"use client";

import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { VisitFormType } from "@prisma/client";
import { useEffect, useState, useCallback } from "react";
import FormularioCSSAnalisis from "../formulario-css-analisis";
import { useFormProtection } from "@/hooks/use-form-protection";
import { useLanguageValidation } from "@/hooks/use-language-validation";
import { FORM_OPTIONS, VisitFormDialogProps } from "@/interfaces/visits";
import FormularioLogisticaAnalisis from "../formulario-logistica-analisis";
import FormularioIndustrialAnalisis from "../formulario-industrial-analisis";
import { UnsavedChangesDialog } from "@/components/ui/unsaved-changes-dialog";
import { LanguageValidationAlert } from "@/components/ui/language-validation-alert";
import FormularioStraddleCarrierAnalisis from "../formulario-straddle-carrier-analisis";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function VisitFormDialog({
  open,
  onOpenChange,
  customer,
  zohoTaskId,
  onSuccess,
  existingVisit,
}: VisitFormDialogProps) {
  const { t, locale } = useI18n();
  const [selectedFormType, setSelectedFormType] =
    useState<VisitFormType | null>(null);

  // ==================== LANGUAGE VALIDATION ====================
  const { showLanguageWarning, canSubmit } = useLanguageValidation({ locale });

  // ==================== FORM PROTECTION ====================
  const handleClose = useCallback(() => {
    setSelectedFormType(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const {
    setIsDirty,
    showConfirmDialog,
    handleOpenChange,
    confirmClose,
    cancelClose,
  } = useFormProtection({ onClose: handleClose });

  // Handle dirty state from forms
  const handleDirtyChange = useCallback(
    (dirty: boolean) => {
      setIsDirty(dirty);
    },
    [setIsDirty],
  );

  useEffect(() => {
    if (existingVisit && open) {
      setSelectedFormType(existingVisit.formType as VisitFormType);
    } else if (!open) {
      setSelectedFormType(null);
      setIsDirty(false);
    }
  }, [existingVisit, open, setIsDirty]);

  const handleBack = () => {
    if (existingVisit) {
      handleOpenChange(false);
    } else {
      setSelectedFormType(null);
      setIsDirty(false);
    }
  };

  const handleSuccess = () => {
    setSelectedFormType(null);
    setIsDirty(false);
    onSuccess();
    onOpenChange(false);
  };

  const isEditing = !!existingVisit;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="
            max-w-[95vw] sm:max-w-dvw max-h-[90vh]
            bg-background border border-border rounded-2xl
            p-0 overflow-hidden
          "
        >
          {/* Show form selector only for new visits */}
          {!selectedFormType && !isEditing ? (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* HEADER */}
              <div className="px-3 py-3 border-b border-border">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-sm font-semibold leading-tight tracking-tight text-balance">
                    {t("visits.registerVisit")}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium md:text-sm text-muted-foreground leading-snug text-balance">
                    {t("visits.selectFormTypeDescription")}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div
                className="
                  flex-1 overflow-y-auto
                  px-3 py-3
                "
              >
                {/* Language validation alert for SELLER users */}
                <LanguageValidationAlert
                  show={showLanguageWarning}
                  className="mb-4"
                />

                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-3">
                  {FORM_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isAvailable = option.available && canSubmit;

                    return (
                      <button
                        key={option.type}
                        disabled={!isAvailable}
                        onClick={() =>
                          isAvailable && setSelectedFormType(option.type)
                        }
                        className={`
                          group relative overflow-hidden rounded-lg p-3 text-left
                          border transition-all duration-300
                          ${
                            isAvailable
                              ? "bg-card border-border hover:border-primary/50 hover:shadow-md hover:-translate-y-px cursor-pointer"
                              : "bg-muted border-border/30 cursor-not-allowed opacity-50"
                          }
                        `}
                        style={{ minHeight: "82px" }}
                      >
                        <div className="flex items-start justify-between">
                          <div
                            className={`
                              size-8 flex items-center justify-center rounded-md
                              transition-all duration-300 
                              ${
                                isAvailable
                                  ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }
                            `}
                          >
                            <Icon className="size-4" />
                          </div>
                        </div>

                        <div className="mt-2 space-y-1">
                          <h3 className="text-xs leading-tight line-clamp-2 text-balance font-balance font-semibold">
                            {t(
                              `visits.formTypes.${
                                option.type === VisitFormType.ANALISIS_CSS
                                  ? "css"
                                  : option.type ===
                                      VisitFormType.ANALISIS_INDUSTRIAL
                                    ? "industrial"
                                    : option.type ===
                                        VisitFormType.ANALISIS_LOGISTICA
                                      ? "logistica"
                                      : "straddleCarrier"
                              }` as any,
                            )}
                          </h3>
                          <p
                            title={t(
                              `visits.formTypes.descriptions.${
                                option.type === VisitFormType.ANALISIS_CSS
                                  ? "css"
                                  : option.type ===
                                      VisitFormType.ANALISIS_INDUSTRIAL
                                    ? "industrial"
                                    : option.type ===
                                        VisitFormType.ANALISIS_LOGISTICA
                                      ? "logistica"
                                      : "straddleCarrier"
                              }` as any,
                            )}
                            className="text-xs text-muted-foreground leading-snug line-clamp-2 text-balance truncate"
                          >
                            {t(
                              `visits.formTypes.descriptions.${
                                option.type === VisitFormType.ANALISIS_CSS
                                  ? "css"
                                  : option.type ===
                                      VisitFormType.ANALISIS_INDUSTRIAL
                                    ? "industrial"
                                    : option.type ===
                                        VisitFormType.ANALISIS_LOGISTICA
                                      ? "logistica"
                                      : "straddleCarrier"
                              }` as any,
                            )}
                          </p>
                        </div>

                        {isAvailable && (
                          <div
                            className="
                              mt-2 flex items-center gap-1 text-xs font-medium text-primary 
                              opacity-0 group-hover:opacity-100 transition-opacity
                            "
                          >
                            {t("visits.select")}
                            <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {selectedFormType === VisitFormType.ANALISIS_CSS && (
                <FormularioCSSAnalisis
                  customer={customer}
                  zohoTaskId={zohoTaskId}
                  onBack={handleBack}
                  onSuccess={handleSuccess}
                  existingVisit={existingVisit}
                  onDirtyChange={handleDirtyChange}
                />
              )}
              {selectedFormType === VisitFormType.ANALISIS_INDUSTRIAL && (
                <FormularioIndustrialAnalisis
                  customer={customer}
                  zohoTaskId={zohoTaskId}
                  onBack={handleBack}
                  onSuccess={handleSuccess}
                  existingVisit={existingVisit}
                  onDirtyChange={handleDirtyChange}
                />
              )}
              {selectedFormType === VisitFormType.ANALISIS_LOGISTICA && (
                <FormularioLogisticaAnalisis
                  customer={customer}
                  zohoTaskId={zohoTaskId}
                  onBack={handleBack}
                  onSuccess={handleSuccess}
                  existingVisit={existingVisit}
                  onDirtyChange={handleDirtyChange}
                />
              )}
              {selectedFormType === VisitFormType.ANALISIS_STRADDLE_CARRIER && (
                <FormularioStraddleCarrierAnalisis
                  customer={customer}
                  zohoTaskId={zohoTaskId}
                  onBack={handleBack}
                  onSuccess={handleSuccess}
                  existingVisit={existingVisit}
                  onDirtyChange={handleDirtyChange}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Unsaved changes confirmation */}
      <UnsavedChangesDialog
        open={showConfirmDialog}
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
    </>
  );
}
