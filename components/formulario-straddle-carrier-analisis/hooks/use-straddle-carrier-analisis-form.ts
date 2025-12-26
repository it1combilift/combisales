import axios from "axios";
import { toast } from "sonner";
import { FORM_STEPS } from "../constants";
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
}

export function useStraddleCarrierAnalisisForm({
  form,
  customerId,
  zohoTaskId,
  isEditing,
  existingVisit,
  onSuccess,
}: UseStraddleCarrierAnalisisFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    isEditing ? new Set([1, 2, 3, 4, 5]) : new Set()
  );

  const visitIsCompleted = existingVisit?.status === VisitStatus.COMPLETADA;

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validateStepFields = useCallback(
    (step: number, values: FormularioStraddleCarrierSchema): boolean => {
      const stepConfig = FORM_STEPS[step - 1];
      if (!stepConfig || !stepConfig.fields) return true;

      const manejaContenedores = values.manejaContenedores;
      const manejaCargaEspecial = values.manejaCargaEspecial;

      if (step === 2 && !manejaContenedores) {
        return true;
      }

      if (step === 3 && !manejaCargaEspecial) {
        return true;
      }

      for (const fieldName of stepConfig.fields) {
        const value = (values as any)[fieldName];

        switch (fieldName) {
          case "archivos":
            continue;

          case "manejaContenedores":
          case "manejaCargaEspecial":
            if (step === 1) {
              if (!manejaContenedores && !manejaCargaEspecial) {
                return false;
              }
            }
            continue;

          case "contenedoresTamanios":
            if (manejaContenedores && value) {
              const hasSelected = Object.values(value).some(
                (size: any) => size.selected
              );
              if (!hasSelected) {
                return false;
              }
            }
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
    []
  );

  // Function to recalculate all completed steps
  const recalculateCompletedSteps = useCallback(
    (values: FormularioStraddleCarrierSchema) => {
      const newCompleted = new Set<number>();

      for (let step = 1; step <= FORM_STEPS.length; step++) {
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
    [validateStepFields]
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

  const shouldSkipStep2 = useCallback(() => {
    return !form.getValues("manejaContenedores");
  }, [form]);

  const shouldSkipStep3 = useCallback(() => {
    return !form.getValues("manejaCargaEspecial");
  }, [form]);

  const progress = useMemo(() => {
    const skipStep2 = shouldSkipStep2();
    const skipStep3 = shouldSkipStep3();

    let effectiveCompleted = 0;
    completedSteps.forEach((step) => {
      if (step === 2 && skipStep2) return;
      if (step === 3 && skipStep3) return;
      effectiveCompleted++;
    });

    let totalSteps = FORM_STEPS.length;
    if (skipStep2) totalSteps--;
    if (skipStep3) totalSteps--;

    return Math.round((effectiveCompleted / totalSteps) * 100);
  }, [completedSteps, shouldSkipStep2, shouldSkipStep3]);

  const allStepsComplete = useMemo((): boolean => {
    const values = form.getValues();
    const skipStep2 = shouldSkipStep2();
    const skipStep3 = shouldSkipStep3();

    for (let step = 1; step <= FORM_STEPS.length; step++) {
      if (step === 2 && skipStep2) continue;
      if (step === 3 && skipStep3) continue;
      if (!validateStepFields(step, values)) return false;
    }
    return true;
  }, [
    completedSteps,
    shouldSkipStep2,
    shouldSkipStep3,
    form,
    validateStepFields,
  ]);

  const currentStepConfig = FORM_STEPS[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === FORM_STEPS.length;

  const validateStep = useCallback(
    async (step: number): Promise<boolean> => {
      const stepConfig = FORM_STEPS[step - 1];
      if (!stepConfig || !stepConfig.fields) return true;

      const isValid = await form.trigger(stepConfig.fields as any);

      if (isValid) {
        setCompletedSteps((prev) => new Set(prev).add(step));
      }

      return isValid;
    },
    [form]
  );

  const getNextStep = useCallback(
    (fromStep: number): number => {
      let nextStep = fromStep + 1;
      if (nextStep === 2 && shouldSkipStep2()) {
        nextStep = 3;
      }
      if (nextStep === 3 && shouldSkipStep3()) {
        nextStep = 4;
      }
      return nextStep;
    },
    [shouldSkipStep2, shouldSkipStep3]
  );

  const getPrevStep = useCallback(
    (fromStep: number): number => {
      let prevStep = fromStep - 1;
      if (prevStep === 3 && shouldSkipStep3()) {
        prevStep = 2;
      }
      if (prevStep === 2 && shouldSkipStep2()) {
        prevStep = 1;
      }
      return prevStep;
    },
    [shouldSkipStep2, shouldSkipStep3]
  );

  const handleNextStep = useCallback(async () => {
    const isValid = await validateStep(currentStep);

    if (!isValid) {
      toast.error("Por favor, completa todos los campos requeridos");
      return;
    }

    if (currentStep < FORM_STEPS.length) {
      const nextStep = getNextStep(currentStep);
      setCurrentStep(nextStep);
    }
  }, [currentStep, validateStep, getNextStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStep = getPrevStep(currentStep);
      setCurrentStep(prevStep);
    }
  }, [currentStep, getPrevStep]);

  const goToStep = useCallback(async (step: number) => {
    if (step < 1 || step > FORM_STEPS.length) return;
    setCurrentStep(step);
  }, []);

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
          submit: "Formulario enviado exitosamente",
          draft: "Borrador guardado exitosamente",
          changes: "Cambios guardados exitosamente",
        };

        toast.success(messages[saveType]);
        onSuccess();
      } catch (error) {
        console.error(`Error al guardar (${saveType}):`, error);
        toast.error("Error al guardar el formulario");
        throw error;
      }
    },
    [form, customerId, zohoTaskId, isEditing, existingVisit, onSuccess]
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
    [saveVisit]
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
    shouldSkipStep2,
    shouldSkipStep3,

    // Actions
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSaveDraft,
    onSaveChanges,

    // Visit info
    visitIsCompleted,
  };
}
