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
    isEditing ? new Set([1, 2, 3, 4, 5, 6]) : new Set()
  );

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== STEP VALIDATION LOGIC ====================
  const validateStepFields = useCallback(
    (step: number, values: FormularioStraddleCarrierSchema): boolean => {
      const stepConfig = FORM_STEPS[step - 1];
      if (!stepConfig || !stepConfig.fields) return true;

      const manejaContenedores = values.manejaContenedores;
      const manejaCargaEspecial = values.manejaCargaEspecial;

      // Step 3 (Contenedores) solo aplica si manejaContenedores
      if (step === 3 && !manejaContenedores) {
        return true;
      }

      // Step 4 (Carga especial) solo aplica si manejaCargaEspecial
      if (step === 4 && !manejaCargaEspecial) {
        return true;
      }

      for (const fieldName of stepConfig.fields) {
        const value = (values as any)[fieldName];

        switch (fieldName) {
          case "archivos":
            continue;

          case "manejaContenedores":
          case "manejaCargaEspecial":
            // Al menos uno debe estar seleccionado
            if (step === 2) {
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
                // Solo requerimos campos específicos por paso
                if (step === 1) {
                  const requiredFields = [
                    "razonSocial",
                    "personaContacto",
                    "email",
                    "direccion",
                    "localidad",
                    "provinciaEstado",
                    "pais",
                    "codigoPostal",
                    "numeroIdentificacionFiscal",
                  ];
                  if (requiredFields.includes(fieldName)) {
                    return false;
                  }
                }
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
  const shouldSkipStep3 = useCallback(() => {
    return !form.getValues("manejaContenedores");
  }, [form]);

  const shouldSkipStep4 = useCallback(() => {
    return !form.getValues("manejaCargaEspecial");
  }, [form]);

  const requiredStepsCount = useMemo(() => {
    const skipStep3 = shouldSkipStep3();
    const skipStep4 = shouldSkipStep4();
    let count = FORM_STEPS.length;
    if (skipStep3) count--;
    if (skipStep4) count--;
    return count;
  }, [shouldSkipStep3, shouldSkipStep4]);

  const progress = useMemo(() => {
    const skipStep3 = shouldSkipStep3();
    const skipStep4 = shouldSkipStep4();

    let effectiveCompleted = 0;
    completedSteps.forEach((step) => {
      if (step === 3 && skipStep3) return;
      if (step === 4 && skipStep4) return;
      effectiveCompleted++;
    });

    let totalSteps = FORM_STEPS.length;
    if (skipStep3) totalSteps--;
    if (skipStep4) totalSteps--;

    return Math.round((effectiveCompleted / totalSteps) * 100);
  }, [completedSteps, shouldSkipStep3, shouldSkipStep4]);

  const allStepsComplete = useMemo(() => {
    const skipStep3 = shouldSkipStep3();
    const skipStep4 = shouldSkipStep4();

    for (let step = 1; step <= FORM_STEPS.length; step++) {
      if (step === 3 && skipStep3) continue;
      if (step === 4 && skipStep4) continue;
      if (!completedSteps.has(step)) return false;
    }
    return true;
  }, [completedSteps, shouldSkipStep3, shouldSkipStep4]);

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
      // Skip step 3 if not handling containers
      if (nextStep === 3 && shouldSkipStep3()) {
        nextStep = 4;
      }
      // Skip step 4 if not handling special cargo
      if (nextStep === 4 && shouldSkipStep4()) {
        nextStep = 5;
      }
      return nextStep;
    },
    [shouldSkipStep3, shouldSkipStep4]
  );

  const getPrevStep = useCallback(
    (fromStep: number): number => {
      let prevStep = fromStep - 1;
      // Skip step 4 if not handling special cargo
      if (prevStep === 4 && shouldSkipStep4()) {
        prevStep = 3;
      }
      // Skip step 3 if not handling containers
      if (prevStep === 3 && shouldSkipStep3()) {
        prevStep = 2;
      }
      return prevStep;
    },
    [shouldSkipStep3, shouldSkipStep4]
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
      if (!allStepsComplete) {
        toast.error("Debes completar todos los pasos antes de enviar");
        return;
      }

      setIsSubmitting(true);
      try {
        await saveVisit({ saveType: "submit" });
      } finally {
        setIsSubmitting(false);
      }
    },
    [allStepsComplete, saveVisit]
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
    shouldSkipStep3,
    shouldSkipStep4,

    // Actions
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSaveDraft,
    onSaveChanges,
  };
}
