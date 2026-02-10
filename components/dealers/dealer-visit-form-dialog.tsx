"use client";

import axios from "axios";
import { Visit } from "@/interfaces/visits";
import { useI18n } from "@/lib/i18n/context";
import { VisitFormType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FORM_OPTIONS } from "@/interfaces/visits";
import { useEffect, useState, useCallback } from "react";
import { useFormProtection } from "@/hooks/use-form-protection";
import { ArrowRight, UserCheck, AlertCircle } from "lucide-react";
import FormularioCSSAnalisis from "@/components/formulario-css-analisis";
import { UnsavedChangesDialog } from "@/components/ui/unsaved-changes-dialog";
import FormularioLogisticaAnalisis from "@/components/formulario-logistica-analisis";
import FormularioIndustrialAnalisis from "@/components/formulario-industrial-analisis";
import FormularioStraddleCarrierAnalisis from "@/components/formulario-straddle-carrier-analisis";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn, getInitials } from "@/lib/utils";

export interface DealerVisitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  existingVisit?: Visit;
  /** If true, the user is a SELLER editing their own clone - skip seller selection */
  isSellerEditing?: boolean;
  /** If true, the form opens in read-only mode (SELLER viewing original visit) */
  readOnly?: boolean;
}

interface SellerInfo {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
}

export default function DealerVisitFormDialog({
  open,
  onOpenChange,
  onSuccess,
  existingVisit,
  isSellerEditing = false,
  readOnly = false,
}: DealerVisitFormDialogProps) {
  const { t } = useI18n();

  // Step management: "formType" = form type selection, "form" = form filling
  // Seller selection step removed - DEALER has exactly ONE assigned seller
  const [currentStep, setCurrentStep] = useState<"formType" | "form">(
    "formType",
  );
  const [selectedSeller, setSelectedSeller] = useState<SellerInfo | null>(null);
  const [selectedFormType, setSelectedFormType] =
    useState<VisitFormType | null>(null);
  const [isLoadingSeller, setIsLoadingSeller] = useState(true);
  const [sellerError, setSellerError] = useState<string | null>(null);

  // ==================== FORM PROTECTION ====================
  const handleClose = useCallback(() => {
    setSelectedFormType(null);
    setSelectedSeller(null);
    setCurrentStep("formType");
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

  // Auto-fetch the single assigned seller for the current DEALER
  // DEALER now has exactly ONE seller assigned
  const fetchAssignedSeller = useCallback(async () => {
    // Skip fetching if SELLER is editing - they don't need seller
    if (isSellerEditing) {
      setIsLoadingSeller(false);
      return;
    }

    setIsLoadingSeller(true);
    setSellerError(null);
    try {
      const response = await axios.get("/api/users/assigned-sellers");
      if (response.status === 200) {
        const sellers = response.data.sellers;
        if (sellers && sellers.length > 0) {
          // Auto-select the first (and only) seller
          setSelectedSeller(sellers[0]);
        } else {
          setSellerError(t("dealerPage.errors.noSellerAssigned"));
        }
      }
    } catch (error) {
      console.error("Error fetching assigned seller:", error);
      setSellerError(t("dealerPage.errors.fetchSeller"));
    } finally {
      setIsLoadingSeller(false);
    }
  }, [isSellerEditing, t]);

  useEffect(() => {
    if (open && !existingVisit && !isSellerEditing) {
      // Fetch the assigned seller when creating a new visit (DEALER flow)
      fetchAssignedSeller();
    }
  }, [open, existingVisit, isSellerEditing, fetchAssignedSeller]);

  // Reset state when dialog closes or when editing
  useEffect(() => {
    if (existingVisit && open) {
      // If editing, skip directly to form
      setSelectedFormType(existingVisit.formType as VisitFormType);
      if (existingVisit.assignedSeller) {
        setSelectedSeller(existingVisit.assignedSeller);
      }
      // Always go directly to form when editing
      setCurrentStep("form");
    } else if (!open) {
      setSelectedFormType(null);
      setSelectedSeller(null);
      setCurrentStep("formType");
      setIsDirty(false);
    }
  }, [existingVisit, open, setIsDirty]);

  const handleBack = () => {
    if (currentStep === "form") {
      if (existingVisit) {
        handleOpenChange(false);
      } else {
        setCurrentStep("formType");
        setSelectedFormType(null);
        setIsDirty(false);
      }
    } else if (currentStep === "formType") {
      // Close dialog - no more seller selection step
      handleOpenChange(false);
    }
  };

  const handleFormTypeSelected = (formType: VisitFormType) => {
    setSelectedFormType(formType);
    setCurrentStep("form");
  };

  const handleSuccess = () => {
    setSelectedFormType(null);
    setSelectedSeller(null);
    setCurrentStep("formType");
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
            max-w-none
            w-[95vw] h-[90vh]
            md:w-[90vw] md:h-[80vh]
            bg-background p-0 overflow-hidden flex flex-col
          "
        >
          {/* Loading seller state */}
          {isLoadingSeller && !isEditing && (
            <div className="flex flex-col h-full items-center justify-center gap-4">
              <Spinner className="size-4" variant="bars" />
              <p className="animate-pulse">{t("common.loading")}</p>
            </div>
          )}

          {/* Error: No seller assigned */}
          {sellerError && !isLoadingSeller && !isEditing && (
            <div className="flex flex-col h-full items-center justify-center gap-4 p-6">
              <AlertCircle className="size-12 text-destructive" />
              <p className="text-center text-muted-foreground">{sellerError}</p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("common.close")}
              </Button>
            </div>
          )}

          {/* Form Type Selection - now the first step */}
          {currentStep === "formType" &&
            !isEditing &&
            !isLoadingSeller &&
            !sellerError && (
              <div className="flex flex-col h-full">
                <div className="px-2 md:px-3 py-3 border-b border-border">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-sm font-semibold leading-tight tracking-tight text-balance">
                      {t("visits.registerVisit")}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground leading-snug text-balance">
                      {t("visits.selectFormTypeDescription")}
                    </DialogDescription>
                  </DialogHeader>

                  {/* Selected seller indicator - auto-assigned */}
                  {selectedSeller && (
                    <div className="mt-2 flex flex-col gap-2 text-muted-foreground">
                      <span className="flex items-center gap-1 text-xs sm:text-sm">
                        <UserCheck className="size-3 sm:size-4" />
                        {t("dealerPage.dialog.assignedTo")}:
                      </span>
                      <div className="text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                        <Avatar className="size-8 sm:size-10 shrink-0">
                          {selectedSeller.image ? (
                            <AvatarImage
                              src={selectedSeller.image}
                              alt={selectedSeller.name || "Seller"}
                              className="object-center object-cover"
                            />
                          ) : null}
                          <AvatarFallback
                            className={cn("text-xs sm:text-sm font-medium")}
                          >
                            {getInitials(selectedSeller.name)}
                          </AvatarFallback>
                        </Avatar>
                        <strong className="line-clamp-1">
                          {selectedSeller.name || selectedSeller.email}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 w-full">
                  <div className="flex flex-col gap-3 justify-center items-center flex-wrap">
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
                            group overflow-hidden rounded-lg px-3 pb-2 pt-3 text-left
                                              transition-all duration-300
                                              cursor-pointer border border-border
                                              h-full
                                              md:py-4
                          ${
                            isAvailable
                              ? "bg-card border-border hover:border-primary/50 hover:shadow-md hover:-translate-y-px"
                              : "bg-muted/30 border-border/30 cursor-not-allowed opacity-50"
                          }
                        `}
                          style={{ height: "100%" }}
                        >
                          <div className="h-full flex justify-between items-center gap-3 w-full">
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
                            <div className="w-full flex flex-col gap-1 justify-center items-start">
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
                                className="text-xs text-muted-foreground text-pretty"
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
                          </div>

                          {isAvailable && (
                            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
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
              {(() => {
                // When editing a clone as SELLER, we should NOT pass originalArchivos
                // All files (including those from original) are now fully editable
                const originalArchivos: any[] = [];

                return (
                  <>
                    {selectedFormType === VisitFormType.ANALISIS_CSS && (
                      <FormularioCSSAnalisis
                        zohoTaskId={undefined}
                        customer={undefined}
                        onBack={handleBack}
                        onSuccess={handleSuccess}
                        existingVisit={existingVisit}
                        assignedSellerId={selectedSeller?.id}
                        originalArchivos={originalArchivos}
                        readOnly={readOnly}
                        enableCustomerEntry={true}
                        customerStepBeforeFiles={true}
                        onDirtyChange={handleDirtyChange}
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
                        originalArchivos={originalArchivos}
                        readOnly={readOnly}
                        enableCustomerEntry={true}
                        customerStepBeforeFiles={true}
                        onDirtyChange={handleDirtyChange}
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
                        originalArchivos={originalArchivos}
                        readOnly={readOnly}
                        enableCustomerEntry={true}
                        customerStepBeforeFiles={true}
                        onDirtyChange={handleDirtyChange}
                      />
                    )}
                    {selectedFormType ===
                      VisitFormType.ANALISIS_STRADDLE_CARRIER && (
                      <FormularioStraddleCarrierAnalisis
                        zohoTaskId={undefined}
                        customer={undefined}
                        onBack={handleBack}
                        onSuccess={handleSuccess}
                        existingVisit={existingVisit}
                        assignedSellerId={selectedSeller?.id}
                        originalArchivos={originalArchivos}
                        readOnly={readOnly}
                        enableCustomerEntry={true}
                        customerStepBeforeFiles={true}
                        onDirtyChange={handleDirtyChange}
                      />
                    )}
                  </>
                );
              })()}
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
