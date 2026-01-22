import axios from "axios";
import { toast } from "sonner";
import { SaveType } from "../types";
import { FORM_STEPS, getFormSteps } from "../constants";
import { UseFormReturn } from "react-hook-form";
import { FormularioCSSSchema } from "../schemas";
import { VisitStatus, VisitFormType } from "@prisma/client";
import { useState, useCallback, useMemo, useEffect } from "react";

interface UseCSSAnalisisFormProps {
  form: UseFormReturn<FormularioCSSSchema>;
  customerId?: string; // Opcional: para visitas de cliente
  zohoTaskId?: string; // Opcional: para visitas de tarea
  isEditing: boolean;
  existingVisit?: any;
  onSuccess: () => void;
  t: (key: string) => string;
  locale: string;
  // Para visitas creadas por DEALER: vendedor asignado
  assignedSellerId?: string;
  // Para flujo DEALER: habilita los pasos de datos del cliente
  enableCustomerEntry?: boolean;
}

export function useCSSAnalisisForm({
  form,
  customerId,
  zohoTaskId,
  isEditing,
  existingVisit,
  onSuccess,
  t,
  locale,
  assignedSellerId,
  enableCustomerEntry = false,
}: UseCSSAnalisisFormProps) {
  // Get the appropriate steps based on enableCustomerEntry
  const formSteps = useMemo(
    () => getFormSteps(enableCustomerEntry),
    [enableCustomerEntry],
  );

  // ==================== STATE ====================
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    isEditing ? new Set(formSteps.map((s) => s.number)) : new Set(),
  );

  const VisitIsCompleted = existingVisit?.status === VisitStatus.COMPLETADA;

  // ==================== COMPUTED VALUES ====================
  const progress = useMemo(
    () => Math.round((currentStep / formSteps.length) * 100),
    [currentStep, formSteps.length],
  );

  // Watch required fields for real-time validation
  const descripcionProducto = form.watch("descripcionProducto");
  const contenedorTipos = form.watch("contenedorTipos");
  const contenedorMedidas = form.watch("contenedorMedidas");
  // Customer fields (for DEALER flow)
  const razonSocial = form.watch("razonSocial");
  const email = form.watch("email");
  const direccion = form.watch("direccion");

  // Real-time validation: check if all required fields are filled
  const allStepsComplete = useMemo((): boolean => {
    // Base validation for product/technical steps
    const productStepValid = Boolean(
      descripcionProducto && descripcionProducto.trim().length >= 10,
    );
    const containerStepValid = Boolean(
      contenedorTipos && contenedorTipos.length >= 1,
    );
    const measurementsStepValid = Boolean(
      contenedorMedidas && contenedorMedidas.length >= 1,
    );
    const filesStepValid = true;

    if (!enableCustomerEntry) {
      return (
        productStepValid &&
        containerStepValid &&
        measurementsStepValid &&
        filesStepValid
      );
    }

    // Additional validation for customer steps in DEALER flow
    const companyStepValid = Boolean(
      razonSocial && razonSocial.trim().length > 0,
    );
    const locationStepValid = Boolean(direccion && direccion.trim().length > 0);
    const commercialStepValid = true; // Optional fields

    return (
      companyStepValid &&
      locationStepValid &&
      commercialStepValid &&
      productStepValid &&
      containerStepValid &&
      measurementsStepValid &&
      filesStepValid
    );
  }, [
    descripcionProducto,
    contenedorTipos,
    contenedorMedidas,
    razonSocial,
    direccion,
    enableCustomerEntry,
  ]);

  // Update completedSteps based on real-time validation for visual feedback
  useEffect(() => {
    const newCompletedSteps = new Set<number>();

    if (enableCustomerEntry) {
      // DEALER flow: 7 steps (3 customer + 4 product)
      if (razonSocial && razonSocial.trim().length > 0)
        newCompletedSteps.add(1);
      if (direccion && direccion.trim().length > 0) newCompletedSteps.add(2);
      newCompletedSteps.add(3); // Commercial is optional
      if (descripcionProducto && descripcionProducto.trim().length >= 10)
        newCompletedSteps.add(4);
      if (contenedorTipos && contenedorTipos.length >= 1)
        newCompletedSteps.add(5);
      if (contenedorMedidas && contenedorMedidas.length >= 1)
        newCompletedSteps.add(6);
      newCompletedSteps.add(7); // Files are optional
    } else {
      // Normal flow: 4 steps
      if (descripcionProducto && descripcionProducto.trim().length >= 10)
        newCompletedSteps.add(1);
      if (contenedorTipos && contenedorTipos.length >= 1)
        newCompletedSteps.add(2);
      if (contenedorMedidas && contenedorMedidas.length >= 1)
        newCompletedSteps.add(3);
      newCompletedSteps.add(4); // Files are optional
    }

    setCompletedSteps(newCompletedSteps);
  }, [
    descripcionProducto,
    contenedorTipos,
    contenedorMedidas,
    razonSocial,
    direccion,
    enableCustomerEntry,
  ]);

  const currentStepConfig = formSteps[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === formSteps.length;

  // ==================== VALIDATION ====================
  const validateStep = useCallback(
    async (stepNumber: number) => {
      const stepConfig = formSteps[stepNumber - 1];
      const isValid = await form.trigger(stepConfig.fields as any);
      if (isValid) {
        setCompletedSteps((prev) => new Set([...prev, stepNumber]));
      } else {
        setCompletedSteps((prev) => {
          const next = new Set(prev);
          next.delete(stepNumber);
          return next;
        });
      }
      return isValid;
    },
    [form, formSteps],
  );

  // ==================== NAVIGATION ====================
  const handleNextStep = useCallback(async () => {
    await validateStep(currentStep);
    if (currentStep < formSteps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, validateStep, formSteps.length]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    async (stepId: number) => {
      await validateStep(currentStep);
      setCurrentStep(stepId);
    },
    [currentStep, validateStep],
  );

  // ==================== SAVE LOGIC ====================
  const saveVisit = async (
    data: FormularioCSSSchema,
    status: VisitStatus,
    saveType: SaveType = "submit",
  ) => {
    if (saveType === "submit") {
      setIsSubmitting(true);
    } else if (saveType === "draft") {
      setIsSavingDraft(true);
    } else {
      setIsSavingChanges(true);
    }

    try {
      let response;

      if (isEditing && existingVisit) {
        response = await axios.put(`/api/visits/${existingVisit.id}`, {
          visitData: { status, locale },
          formularioData: data,
        });

        if (response.status === 200) {
          const messages = {
            submit: t("toast.form.visitUpdatedSuccess"),
            draft: t("toast.form.draftUpdatedSuccess"),
            changes: t("toast.form.changesSuccess"),
          };
          toast.success(messages[saveType]);
          onSuccess();
        }
      } else {
        response = await axios.post("/api/visits", {
          visitData: {
            customerId,
            zohoTaskId,
            formType: VisitFormType.ANALISIS_CSS,
            visitDate: new Date(),
            status,
            locale,
            // Para visitas de DEALER: asignar vendedor
            assignedSellerId,
          },
          formularioData: data,
        });

        if (response.status === 201) {
          toast.success(
            saveType === "submit"
              ? t("toast.form.visitCreatedSuccess")
              : t("toast.form.draftSuccess"),
          );
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error saving visit:", error);
      toast.error(error.response?.data?.error || t("toast.form.visitError"));
    } finally {
      if (saveType === "submit") {
        setIsSubmitting(false);
      } else if (saveType === "draft") {
        setIsSavingDraft(false);
      } else {
        setIsSavingChanges(false);
      }
    }
  };

  const onSubmit = async (data: FormularioCSSSchema) => {
    await saveVisit(data, VisitStatus.COMPLETADA, "submit");
  };

  const onSubmitError = (errors: any) => {
    console.error("Form validation errors:", errors);
    const errorMessages = Object.values(errors)
      .map((error: any) => error?.message)
      .filter(Boolean);
    if (errorMessages.length > 0) {
      toast.error(errorMessages[0] as string);
    } else {
      toast.error(t("toast.form.validationError"));
    }
  };

  const onSaveDraft = async () => {
    const data = form.getValues();
    await saveVisit(data, VisitStatus.BORRADOR, "draft");
  };

  const onSaveChanges = async () => {
    const data = form.getValues();
    const currentStatus = existingVisit?.status || VisitStatus.BORRADOR;
    await saveVisit(data, currentStatus, "changes");
  };

  return {
    // State
    currentStep,
    isSubmitting,
    isSavingDraft,
    isSavingChanges,
    completedSteps,

    // Computed
    progress,
    allStepsComplete,
    currentStepConfig,
    isFirstStep,
    isLastStep,

    // Actions
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSubmitError,
    onSaveDraft,
    onSaveChanges,

    // Visit info
    VisitIsCompleted,
  };
}
