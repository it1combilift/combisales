"use client";

import { ArrowRight, User, ChevronLeft } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VisitFormType } from "@prisma/client";
import { FORM_TYPE_LABELS, Visit } from "@/interfaces/visits";
import FormularioCSSAnalisis from "@/components/formulario-css-analisis";
import { FORM_OPTIONS } from "@/interfaces/visits";
import FormularioLogisticaAnalisis from "@/components/formulario-logistica-analisis";
import FormularioIndustrialAnalisis from "@/components/formulario-industrial-analisis";
import FormularioStraddleCarrierAnalisis from "@/components/formulario-straddle-carrier-analisis";
import { useI18n } from "@/lib/i18n/context";
import { DealerSellerSelector } from "./dealer-seller-selector";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface DealerVisitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  existingVisit?: Visit;
}

interface SellerInfo {
  id: string;
  name: string | null;
  email: string;
}

export default function DealerVisitFormDialog({
  open,
  onOpenChange,
  onSuccess,
  existingVisit,
}: DealerVisitFormDialogProps) {
  const { t } = useI18n();

  // Step management: 1 = seller selection, 2 = form type selection, 3 = form filling
  const [currentStep, setCurrentStep] = useState<
    "seller" | "formType" | "form"
  >("seller");
  const [selectedSeller, setSelectedSeller] = useState<SellerInfo | null>(null);
  const [selectedFormType, setSelectedFormType] =
    useState<VisitFormType | null>(null);
  const [sellers, setSellers] = useState<SellerInfo[]>([]);
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);

  // Fetch assigned sellers for the current DEALER
  const fetchAssignedSellers = useCallback(async () => {
    setIsLoadingSellers(true);
    try {
      const response = await axios.get("/api/users/assigned-sellers");
      if (response.status === 200) {
        setSellers(response.data.sellers);
      }
    } catch (error) {
      console.error("Error fetching assigned sellers:", error);
    } finally {
      setIsLoadingSellers(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchAssignedSellers();
    }
  }, [open, fetchAssignedSellers]);

  // Reset state when dialog closes or when editing
  useEffect(() => {
    if (existingVisit && open) {
      // If editing, skip to form
      setSelectedFormType(existingVisit.formType as VisitFormType);
      if (existingVisit.assignedSeller) {
        setSelectedSeller(existingVisit.assignedSeller);
        setCurrentStep("form");
      } else {
        setCurrentStep("seller");
      }
    } else if (!open) {
      setSelectedFormType(null);
      setSelectedSeller(null);
      setCurrentStep("seller");
    }
  }, [existingVisit, open]);

  const handleBack = () => {
    if (currentStep === "form") {
      if (existingVisit) {
        onOpenChange(false);
      } else {
        setCurrentStep("formType");
        setSelectedFormType(null);
      }
    } else if (currentStep === "formType") {
      setCurrentStep("seller");
    }
  };

  const handleSellerSelected = (seller: SellerInfo) => {
    setSelectedSeller(seller);
    setCurrentStep("formType");
  };

  const handleFormTypeSelected = (formType: VisitFormType) => {
    setSelectedFormType(formType);
    setCurrentStep("form");
  };

  const handleSuccess = () => {
    setSelectedFormType(null);
    setSelectedSeller(null);
    setCurrentStep("seller");
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
        {/* Step 1: Seller Selection */}
        {currentStep === "seller" && !isEditing && (
          <div className="flex flex-col h-full max-h-[90vh]">
            <div className="px-2 md:px-3 py-3 border-b border-border">
              <DialogHeader className="text-left">
                <DialogTitle className="text-xs sm:text-sm font-semibold leading-tight tracking-tight text-balance">
                  {t("dealerPage.dialog.selectSeller")}
                </DialogTitle>
                <DialogDescription className="text-[10px] md:text-xs text-muted-foreground leading-snug text-balance">
                  {t("dealerPage.dialog.selectSellerDescription")}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-2 md:px-3 py-2 md:py-3">
              <DealerSellerSelector
                sellers={sellers}
                isLoading={isLoadingSellers}
                onSelect={handleSellerSelected}
                selectedSellerId={selectedSeller?.id}
              />
            </div>
          </div>
        )}

        {/* Step 2: Form Type Selection */}
        {currentStep === "formType" && !isEditing && (
          <div className="flex flex-col h-full max-h-[90vh]">
            <div className="px-2 md:px-3 py-3 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep("seller")}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="size-4" />
                  {t("common.back")}
                </Button>
              </div>
              <DialogHeader className="text-left">
                <DialogTitle className="text-xs sm:text-sm font-semibold leading-tight tracking-tight text-balance">
                  {t("visits.registerVisit")}
                </DialogTitle>
                <DialogDescription className="text-[10px] md:text-xs text-muted-foreground leading-snug text-balance">
                  {t("visits.selectFormTypeDescription")}
                </DialogDescription>
              </DialogHeader>
              {/* Selected seller indicator */}
              {selectedSeller && (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="size-3" />
                  <span>
                    {t("dealerPage.dialog.assignedTo")}:{" "}
                    <strong>
                      {selectedSeller.name || selectedSeller.email}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-2 md:px-3 py-2 md:py-3">
              <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-3">
                {FORM_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isAvailable = option.available;

                  return (
                    <button
                      key={option.type}
                      disabled={!isAvailable}
                      onClick={() =>
                        isAvailable && handleFormTypeSelected(option.type)
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
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
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
        )}

        {/* Step 3: Form filling */}
        {currentStep === "form" && selectedFormType && (
          <>
            {selectedFormType === VisitFormType.ANALISIS_CSS && (
              <FormularioCSSAnalisis
                zohoTaskId={undefined}
                customer={undefined}
                onBack={handleBack}
                onSuccess={handleSuccess}
                existingVisit={existingVisit}
                assignedSellerId={selectedSeller?.id}
              />
            )}
            {selectedFormType === VisitFormType.ANALISIS_INDUSTRIAL && (
              <FormularioIndustrialAnalisis
                zohoTaskId={undefined}
                customer={undefined}
                onBack={handleBack}
                onSuccess={handleSuccess}
                existingVisit={existingVisit}
                assignedSellerId={selectedSeller?.id}
              />
            )}
            {selectedFormType === VisitFormType.ANALISIS_LOGISTICA && (
              <FormularioLogisticaAnalisis
                zohoTaskId={undefined}
                customer={undefined}
                onBack={handleBack}
                onSuccess={handleSuccess}
                existingVisit={existingVisit}
                assignedSellerId={selectedSeller?.id}
              />
            )}
            {selectedFormType === VisitFormType.ANALISIS_STRADDLE_CARRIER && (
              <FormularioStraddleCarrierAnalisis
                zohoTaskId={undefined}
                customer={undefined}
                onBack={handleBack}
                onSuccess={handleSuccess}
                existingVisit={existingVisit}
                assignedSellerId={selectedSeller?.id}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
