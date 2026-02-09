import axios from "axios";
import { toast } from "sonner";
import { SaveType } from "../types";
import { getFormSteps } from "../constants";
import { UseFormReturn } from "react-hook-form";
import { FormularioCSSSchema } from "../schemas";
import { VisitStatus, VisitFormType } from "@prisma/client";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

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
  // Para flujo DEALER: posicionar paso cliente antes de archivos
  customerStepBeforeFiles?: boolean;
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
  customerStepBeforeFiles = false,
}: UseCSSAnalisisFormProps) {
  // Get the appropriate steps based on enableCustomerEntry and position
  const formSteps = useMemo(
    () => getFormSteps(enableCustomerEntry, customerStepBeforeFiles),
    [enableCustomerEntry, customerStepBeforeFiles],
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

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== STEP VALIDATION LOGIC (KEY-BASED) ====================
  const validateStepFields = useCallback(
    (step: number, values: FormularioCSSSchema): boolean => {
      const stepConfig = formSteps[step - 1];
      if (!stepConfig) return false;

      const stepKey = stepConfig.key;

      switch (stepKey) {
        case "customerData":
          // Required: razonSocial, direccion, website
          if (!values.razonSocial || values.razonSocial.trim().length === 0)
            return false;
          if (!values.direccion || values.direccion.trim().length === 0)
            return false;
          if (!values.website || values.website.trim().length === 0)
            return false;
          return true;

        case "product":
          // Required: descripcionProducto (min 10 chars)
          if (
            !values.descripcionProducto ||
            values.descripcionProducto.trim().length < 10
          )
            return false;
          return true;

        case "container":
          // Required: contenedorTipos (at least 1)
          if (!values.contenedorTipos || values.contenedorTipos.length < 1)
            return false;
          return true;

        case "measurements":
          // Required: contenedorMedidas (at least 1)
          if (!values.contenedorMedidas || values.contenedorMedidas.length < 1)
            return false;
          return true;

        case "files":
          // Files are OPTIONAL - only completed if files were uploaded
          const archivos = values.archivos;
          return Array.isArray(archivos) && archivos.length > 0;

        default:
          return false;
      }
    },
    [formSteps],
  );

  // Function to recalculate all completed steps
  const recalculateCompletedSteps = useCallback(
    (values: FormularioCSSSchema) => {
      const newCompleted = new Set<number>();

      for (let step = 1; step <= formSteps.length; step++) {
        if (validateStepFields(step, values)) {
          newCompleted.add(step);
        }
      }

      setCompletedSteps((prev) => {
        if (prev.size !== newCompleted.size) return newCompleted;
        for (const s of newCompleted) {
          if (!prev.has(s)) return newCompleted;
        }
        return prev;
      });
    },
    [validateStepFields, formSteps],
  );

  // ==================== REACTIVE STEP VALIDATION ====================
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      validationTimeoutRef.current = setTimeout(() => {
        recalculateCompletedSteps(values as FormularioCSSSchema);
      }, 150);
    });

    recalculateCompletedSteps(form.getValues());

    return () => {
      subscription.unsubscribe();
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [form, recalculateCompletedSteps]);

  // Calculate step number for optional files step
  const filesStepNumber = useMemo(() => {
    return formSteps.findIndex((s) => s.key === "files") + 1;
  }, [formSteps]);

  // ==================== COMPUTED VALUES ====================
  const progress = useMemo(() => {
    // Count completed steps, excluding optional files step
    let effectiveCompleted = 0;
    completedSteps.forEach((step) => {
      if (step === filesStepNumber) return;
      effectiveCompleted++;
    });

    // Calculate total required steps (exclude optional files step)
    let totalRequiredSteps = formSteps.length;
    if (filesStepNumber > 0) totalRequiredSteps--;

    return Math.round((effectiveCompleted / totalRequiredSteps) * 100);
  }, [completedSteps, formSteps.length, filesStepNumber]);

  // Real-time validation: check if all required fields are filled
  const allStepsComplete = useMemo((): boolean => {
    const values = form.getValues();
    // Check all steps except optional files step
    for (let step = 1; step <= formSteps.length; step++) {
      if (step === filesStepNumber) continue;
      if (!validateStepFields(step, values)) return false;
    }
    return true;
  }, [
    completedSteps,
    form,
    validateStepFields,
    formSteps.length,
    filesStepNumber,
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

    // Form steps configuration (dynamic based on enableCustomerEntry)
    formSteps,
    enableCustomerEntry,
    totalSteps: formSteps.length,

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
