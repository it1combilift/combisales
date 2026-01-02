"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { VisitFormType } from "@prisma/client";
import { FORM_TYPE_LABELS } from "@/interfaces/visits";
import FormularioCSSAnalisis from "../formulario-css-analisis";
import { FORM_OPTIONS, VisitFormDialogProps } from "@/interfaces/visits";
import FormularioLogisticaAnalisis from "../formulario-logistica-analisis";
import FormularioIndustrialAnalisis from "../formulario-industrial-analisis";
import FormularioStraddleCarrierAnalisis from "../formulario-straddle-carrier-analisis";
import { useI18n } from "@/lib/i18n/context";

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
  const { t } = useI18n();
  const [selectedFormType, setSelectedFormType] =
    useState<VisitFormType | null>(null);

  useEffect(() => {
    if (existingVisit && open) {
      setSelectedFormType(existingVisit.formType as VisitFormType);
    } else if (!open) {
      setSelectedFormType(null);
    }
  }, [existingVisit, open]);

  const handleBack = () => {
    if (existingVisit) {
      onOpenChange(false);
    } else {
      setSelectedFormType(null);
    }
  };

  const handleSuccess = () => {
    setSelectedFormType(null);
    onSuccess();
    onOpenChange(false);
  };

  const isEditing = !!existingVisit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <div className="px-2 md:px-3 py-3 border-b border-border">
              <DialogHeader className="text-left">
                <DialogTitle className="text-xs sm:text-sm font-semibold leading-tight tracking-tight text-balance">
                  {t("visits.registerVisit")}
                </DialogTitle>
                <DialogDescription className="text-[10px] md:text-xs text-muted-foreground leading-snug text-balance">
                  {t("visits.selectFormTypeDescription")}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div
              className="
                flex-1 overflow-y-auto
                px-2 md:px-3 py-2 md:py-3
              "
            >
              <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-3">
                {FORM_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isAvailable = option.available;

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
                        cursor-pointer
                        ${
                          isAvailable
                            ? "bg-card border-border hover:border-primary/50 hover:shadow-md hover:-translate-y-px"
                            : "bg-muted/30 border-border/30 cursor-not-allowed opacity-50"
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

                        {!isAvailable && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-medium"
                          >
                            {t("visits.comingSoon")}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 space-y-1">
                        <h3 className="text-[10px] leading-tight line-clamp-2 text-balance font-balance font-semibold md:text-xs">
                          {FORM_TYPE_LABELS[option.type]}
                        </h3>
                        <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2 text-balance truncate">
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
                            }` as any
                          )}
                        </p>
                      </div>

                      {isAvailable && (
                        <div
                          className="
                            mt-2 flex items-center gap-1 text-[10px] font-medium text-primary 
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
              />
            )}
            {selectedFormType === VisitFormType.ANALISIS_INDUSTRIAL && (
              <FormularioIndustrialAnalisis
                customer={customer}
                zohoTaskId={zohoTaskId}
                onBack={handleBack}
                onSuccess={handleSuccess}
                existingVisit={existingVisit}
              />
            )}
            {selectedFormType === VisitFormType.ANALISIS_LOGISTICA && (
              <FormularioLogisticaAnalisis
                customer={customer}
                zohoTaskId={zohoTaskId}
                onBack={handleBack}
                onSuccess={handleSuccess}
                existingVisit={existingVisit}
              />
            )}
            {selectedFormType === VisitFormType.ANALISIS_STRADDLE_CARRIER && (
              <FormularioStraddleCarrierAnalisis
                customer={customer}
                zohoTaskId={zohoTaskId}
                onBack={handleBack}
                onSuccess={handleSuccess}
                existingVisit={existingVisit}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
