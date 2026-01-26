import axios from "axios";
import { toast } from "sonner";
import { getFormSteps, REGULAR_STEPS } from "../constants";
import { SaveVisitParams } from "../types";
import { UseFormReturn } from "react-hook-form";
import { VisitStatus } from "@prisma/client";
import { FormularioStraddleCarrierSchema } from "../schemas";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

interface UseStraddleCarrierAnalisisFormProps {
  form: UseFormReturn<FormularioStraddleCarrierSchema>;
  customerId?: string; // Opcional: para visitas de cliente
  zohoTaskId?: string; // Opcional: para visitas de tarea
  isEditing: boolean;
  existingVisit?: any;
  onSuccess: () => void;
  t: (key: string) => string;
  locale: string;
  // Para visitas creadas por DEALER: vendedor asignado
  assignedSellerId?: string;
  // Si es true, habilita el paso de datos del cliente (para flujo DEALER)
  enableCustomerEntry?: boolean;
}

export function useStraddleCarrierAnalisisForm({
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
}: UseStraddleCarrierAnalisisFormProps) {
  // Get form steps based on enableCustomerEntry
  const formSteps = useMemo(
    () => getFormSteps(enableCustomerEntry),
    [enableCustomerEntry],
  );

  // Calculate the step numbers where containers and special load are shown
  // Without customer entry: step 2 (containers), step 3 (special load)
  // With customer entry: step 3 (containers), step 4 (special load)
  const containersStepNumber = enableCustomerEntry ? 3 : 2;
  const specialLoadStepNumber = enableCustomerEntry ? 4 : 3;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    isEditing ? new Set(formSteps.map((_, i) => i + 1)) : new Set(),
  );

  const visitIsCompleted = existingVisit?.status === VisitStatus.COMPLETADA;

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validateStepFields = useCallback(
    (step: number, values: FormularioStraddleCarrierSchema): boolean => {
      const stepConfig = formSteps[step - 1];
      if (!stepConfig || !stepConfig.fields) return true;

      const manejaContenedores = values.manejaContenedores;
      const manejaCargaEspecial = values.manejaCargaEspecial;

      // Skip containers step if manejaContenedores is false
      if (step === containersStepNumber && !manejaContenedores) {
        return true;
      }

      // Skip special load step if manejaCargaEspecial is false
      if (step === specialLoadStepNumber && !manejaCargaEspecial) {
        return true;
      }

      for (const fieldName of stepConfig.fields) {
        const value = (values as any)[fieldName];

        switch (fieldName) {
          case "archivos":
            continue;

          case "manejaContenedores":
          case "manejaCargaEspecial":
            // In instructions step: at least one must be selected
            const instructionsStep = enableCustomerEntry ? 2 : 1;
            if (step === instructionsStep) {
              if (!manejaContenedores && !manejaCargaEspecial) {
                return false;
              }
            }
            continue;

          case "contenedoresTamanios":
            if (manejaContenedores && value) {
              const hasSelected = Object.values(value).some(
                (size: any) => size.selected,
              );
              if (!hasSelected) {
                return false;
              }
            }
            continue;

          // Customer data fields (optional for now - DEALER will fill them)
          case "customerName":
          case "customerEmail":
          case "customerPhone":
          case "customerAddress":
          case "customerCity":
          case "customerCountry":
          case "customerNotes":
            continue;

          case "fechaCierre":
          case "website":
          case "distribuidor":
          case "contactoDistribuidor":
          case "infoAdicionalContenedores":
          case "condicionesPiso":
          case "notasAdicionales":
            continue;

          default:
            if (typeof value === "string") {
              if (!value || value.trim() === "") {
              }
            }
        }
      }

      return true;
    },
    [
      formSteps,
      containersStepNumber,
      specialLoadStepNumber,
      enableCustomerEntry,
    ],
  );

  // Function to recalculate all completed steps
  const recalculateCompletedSteps = useCallback(
    (values: FormularioStraddleCarrierSchema) => {
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

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      validationTimeoutRef.current = setTimeout(() => {
        recalculateCompletedSteps(values as FormularioStraddleCarrierSchema);
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

  const shouldSkipContainersStep = useCallback(() => {
    return !form.getValues("manejaContenedores");
  }, [form]);

  const shouldSkipSpecialLoadStep = useCallback(() => {
    return !form.getValues("manejaCargaEspecial");
  }, [form]);

  const progress = useMemo(() => {
    const skipContainers = shouldSkipContainersStep();
    const skipSpecialLoad = shouldSkipSpecialLoadStep();

    let effectiveCompleted = 0;
    completedSteps.forEach((step) => {
      if (step === containersStepNumber && skipContainers) return;
      if (step === specialLoadStepNumber && skipSpecialLoad) return;
      effectiveCompleted++;
    });

    let totalSteps = formSteps.length;
    if (skipContainers) totalSteps--;
    if (skipSpecialLoad) totalSteps--;

    return Math.round((effectiveCompleted / totalSteps) * 100);
  }, [
    completedSteps,
    shouldSkipContainersStep,
    shouldSkipSpecialLoadStep,
    formSteps,
    containersStepNumber,
    specialLoadStepNumber,
  ]);

  const allStepsComplete = useMemo((): boolean => {
    const values = form.getValues();
    const skipContainers = shouldSkipContainersStep();
    const skipSpecialLoad = shouldSkipSpecialLoadStep();

    for (let step = 1; step <= formSteps.length; step++) {
      if (step === containersStepNumber && skipContainers) continue;
      if (step === specialLoadStepNumber && skipSpecialLoad) continue;
      if (!validateStepFields(step, values)) return false;
    }
    return true;
  }, [
    completedSteps,
    shouldSkipContainersStep,
    shouldSkipSpecialLoadStep,
    form,
    validateStepFields,
    formSteps,
    containersStepNumber,
    specialLoadStepNumber,
  ]);

  const currentStepConfig = formSteps[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === formSteps.length;

  const validateStep = useCallback(
    async (step: number): Promise<boolean> => {
      const stepConfig = formSteps[step - 1];
      if (!stepConfig || !stepConfig.fields) return true;

      const isValid = await form.trigger(stepConfig.fields as any);

      if (isValid) {
        setCompletedSteps((prev) => new Set(prev).add(step));
      }

      return isValid;
    },
    [form, formSteps],
  );

  const getNextStep = useCallback(
    (fromStep: number): number => {
      let nextStep = fromStep + 1;
      if (nextStep === containersStepNumber && shouldSkipContainersStep()) {
        nextStep = containersStepNumber + 1;
      }
      if (nextStep === specialLoadStepNumber && shouldSkipSpecialLoadStep()) {
        nextStep = specialLoadStepNumber + 1;
      }
      return nextStep;
    },
    [
      shouldSkipContainersStep,
      shouldSkipSpecialLoadStep,
      containersStepNumber,
      specialLoadStepNumber,
    ],
  );

  const getPrevStep = useCallback(
    (fromStep: number): number => {
      let prevStep = fromStep - 1;
      if (prevStep === specialLoadStepNumber && shouldSkipSpecialLoadStep()) {
        prevStep = specialLoadStepNumber - 1;
      }
      if (prevStep === containersStepNumber && shouldSkipContainersStep()) {
        prevStep = containersStepNumber - 1;
      }
      return prevStep;
    },
    [
      shouldSkipContainersStep,
      shouldSkipSpecialLoadStep,
      containersStepNumber,
      specialLoadStepNumber,
    ],
  );

  const handleNextStep = useCallback(async () => {
    const isValid = await validateStep(currentStep);

    if (!isValid) {
      toast.error(t("toast.form.validationError"));
      return;
    }

    if (currentStep < formSteps.length) {
      const nextStep = getNextStep(currentStep);
      setCurrentStep(nextStep);
    }
  }, [currentStep, validateStep, getNextStep, formSteps, t]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStep = getPrevStep(currentStep);
      setCurrentStep(prevStep);
    }
  }, [currentStep, getPrevStep]);

  const goToStep = useCallback(
    async (step: number) => {
      if (step < 1 || step > formSteps.length) return;
      setCurrentStep(step);
    },
    [formSteps],
  );

  const saveVisit = useCallback(
    async ({ saveType }: SaveVisitParams) => {
      try {
        const formData = form.getValues();

        const visitStatus =
          saveType === "submit"
            ? VisitStatus.COMPLETADA
            : saveType === "draft"
              ? VisitStatus.BORRADOR
              : existingVisit?.status || VisitStatus.BORRADOR;

        const payload = {
          visitData: {
            customerId,
            zohoTaskId,
            formType: "ANALISIS_STRADDLE_CARRIER",
            status: visitStatus,
            locale,
            // Para visitas de DEALER: asignar vendedor
            assignedSellerId,
          },
          formularioData: {
            ...formData,
          },
        };

        if (isEditing && existingVisit) {
          await axios.put(`/api/visits/${existingVisit.id}`, payload);
        } else {
          await axios.post("/api/visits", payload);
        }

        const messages = {
          submit: t("toast.form.submitSuccess"),
          draft: t("toast.form.draftSuccess"),
          changes: t("toast.form.changesSuccess"),
        };

        toast.success(messages[saveType]);
        onSuccess();
      } catch (error) {
        console.error(`Error al guardar (${saveType}):`, error);
        toast.error(t("toast.form.submitError"));
        throw error;
      }
    },
    [form, customerId, zohoTaskId, isEditing, existingVisit, onSuccess, t],
  );

  const onSubmit = useCallback(
    async (data: FormularioStraddleCarrierSchema) => {
      setIsSubmitting(true);
      try {
        await saveVisit({ saveType: "submit" });
      } finally {
        setIsSubmitting(false);
      }
    },
    [saveVisit],
  );

  const onSubmitError = useCallback(
    (errors: any) => {
      console.error("Form validation errors:", errors);
      const errorMessages = Object.values(errors)
        .map((error: any) => error?.message)
        .filter(Boolean);
      if (errorMessages.length > 0) {
        toast.error(errorMessages[0] as string);
      } else {
        toast.error(t("toast.form.validationError"));
      }
    },
    [t],
  );

  const onSaveDraft = useCallback(async () => {
    setIsSavingDraft(true);
    try {
      await saveVisit({ saveType: "draft" });
    } finally {
      setIsSavingDraft(false);
    }
  }, [saveVisit]);

  const onSaveChanges = useCallback(async () => {
    if (!isEditing) return;

    setIsSavingChanges(true);
    try {
      await saveVisit({ saveType: "changes" });
    } finally {
      setIsSavingChanges(false);
    }
  }, [isEditing, saveVisit]);

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
    shouldSkipContainersStep,
    shouldSkipSpecialLoadStep,

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
    visitIsCompleted,
  };
}
