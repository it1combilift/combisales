import axios from "axios";
import { toast } from "sonner";
import { FORM_STEPS } from "../constants";
import { SaveVisitParams } from "../types";
import { UseFormReturn } from "react-hook-form";
import { FormularioStraddleCarrierSchema } from "../schemas";
import { VisitStatus } from "@prisma/client";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

interface UseStraddleCarrierAnalisisFormProps {
  form: UseFormReturn<FormularioStraddleCarrierSchema>;
  customerId: string;
  isEditing: boolean;
  existingVisit?: any;
  onSuccess: () => void;
}

export function useStraddleCarrierAnalisisForm({
  form,
  customerId,
  isEditing,
  existingVisit,
  onSuccess,
}: UseStraddleCarrierAnalisisFormProps) {
  // ==================== STATE ====================
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    isEditing ? new Set([1, 2, 3, 4, 5]) : new Set()
  );

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== STEP VALIDATION LOGIC ====================
  const validateStepFields = useCallback(
    (step: number, values: FormularioStraddleCarrierSchema): boolean => {
      const stepConfig = FORM_STEPS[step - 1];
      if (!stepConfig || !stepConfig.fields) return true;

      const manejaContenedores = values.manejaContenedores;
      const manejaCargaEspecial = values.manejaCargaEspecial;

      // Step 2 (Contenedores) solo aplica si manejaContenedores
      if (step === 2 && !manejaContenedores) {
        return true;
      }

      // Step 3 (Carga especial) solo aplica si manejaCargaEspecial
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
            // Al menos uno debe estar seleccionado (en Step 1)
            if (step === 1) {
              if (!manejaContenedores && !manejaCargaEspecial) {
                return false;
              }
            }
            continue;

          case "contenedoresTamanios":
            // Si maneja contenedores, al menos uno debe estar seleccionado
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
                // No hay campos obligatorios por defecto
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

  // ==================== REACTIVE STEP VALIDATION ====================
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

  // ==================== COMPUTED VALUES ====================
  // Step 2 = Contenedores (se salta si no manejaContenedores)
  const shouldSkipStep2 = useCallback(() => {
    return !form.getValues("manejaContenedores");
  }, [form]);

  // Step 3 = Carga especial (se salta si no manejaCargaEspecial)
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

  // ==================== STEP VALIDATION ====================
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

  // ==================== NAVIGATION HELPERS ====================
  const getNextStep = useCallback(
    (fromStep: number): number => {
      let nextStep = fromStep + 1;
      // Skip step 2 if not handling containers
      if (nextStep === 2 && shouldSkipStep2()) {
        nextStep = 3;
      }
      // Skip step 3 if not handling special cargo
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
      // Skip step 3 if not handling special cargo
      if (prevStep === 3 && shouldSkipStep3()) {
        prevStep = 2;
      }
      // Skip step 2 if not handling containers
      if (prevStep === 2 && shouldSkipStep2()) {
        prevStep = 1;
      }
      return prevStep;
    },
    [shouldSkipStep2, shouldSkipStep3]
  );

  // ==================== NAVIGATION ====================
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

  // ==================== SAVE VISIT ====================
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
    [form, customerId, isEditing, existingVisit, onSuccess]
  );

  // ==================== FORM SUBMIT ====================
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

  // ==================== SAVE DRAFT ====================
  const onSaveDraft = useCallback(async () => {
    setIsSavingDraft(true);
    try {
      await saveVisit({ saveType: "draft" });
    } finally {
      setIsSavingDraft(false);
    }
  }, [saveVisit]);

  // ==================== SAVE CHANGES ====================
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
  };
}
