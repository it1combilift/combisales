"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { VisitFormType } from "@prisma/client";
import { Customer } from "@/interfaces/visits";
import { FORM_TYPE_LABELS } from "@/interfaces/visits";
import FormularioCSSAnalisis from "./formulario-css-analisis";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  ArrowRight,
  ClipboardList,
  Factory,
  Forklift,
  Ship,
} from "lucide-react";

interface VisitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  onSuccess: () => void;
}

const FORM_OPTIONS = [
  {
    type: VisitFormType.ANALISIS_CSS,
    icon: ClipboardList,
    description: "Análisis de Combi CSS para manejo de contenedores.",
    available: true,
  },
  {
    type: VisitFormType.ANALISIS_INDUSTRIAL,
    icon: Factory,
    description: "Análisis de soluciones industriales y logística interna.",
    available: false,
  },
  {
    type: VisitFormType.ANALISIS_LOGISTICA,
    icon: Forklift,
    description: "Análisis de operaciones logísticas y almacenamiento.",
    available: false,
  },
  {
    type: VisitFormType.ANALISIS_STRADDLE_CARRIER,
    icon: Ship,
    description: "Análisis de Straddle Carrier para terminales portuarias.",
    available: false,
  },
];

export default function VisitFormDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: VisitFormDialogProps) {
  const [selectedFormType, setSelectedFormType] =
    useState<VisitFormType | null>(null);

  const handleBack = () => setSelectedFormType(null);

  const handleSuccess = () => {
    setSelectedFormType(null);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-w-[95vw] sm:max-w-dvw max-h-[90vh]
          bg-background border border-border rounded-2xl
          p-0 overflow-hidden
        "
      >
        {!selectedFormType ? (
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* HEADER */}
            <div className="px-4 sm:px-6 py-4 border-b border-border">
              <DialogHeader className="text-left ">
                <DialogTitle className="text-base font-semibold leading-tight tracking-tight text-pretty">
                  Registrar visita
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-snug text-pretty">
                  Selecciona el tipo de análisis para documentar esta visita.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* OPTIONS SCROLLABLE */}
            <div
              className="
                flex-1 overflow-y-auto
                px-4 sm:px-6 py-4
              "
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                            Próximamente
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 space-y-1">
                        <h3 className="font-semibold text-xs leading-tight line-clamp-2">
                          {FORM_TYPE_LABELS[option.type]}
                        </h3>
                        <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                          {option.description}
                        </p>
                      </div>

                      {isAvailable && (
                        <div
                          className="
                            mt-2 flex items-center gap-1 text-[10px] font-medium text-primary 
                            opacity-0 group-hover:opacity-100 transition-opacity
                          "
                        >
                          Seleccionar
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
                onBack={handleBack}
                onSuccess={handleSuccess}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
