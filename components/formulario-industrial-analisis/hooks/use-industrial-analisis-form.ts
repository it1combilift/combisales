import axios from "axios";
import { toast } from "sonner";
import { FORM_STEPS } from "../constants";
import { SaveVisitParams } from "../types";
import { UseFormReturn } from "react-hook-form";
import { FormularioIndustrialSchema } from "../schemas";
import { TipoAlimentacion, VisitStatus } from "@prisma/client";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

interface UseIndustrialAnalisisFormProps {
  form: UseFormReturn<FormularioIndustrialSchema>;
  customerId: string;
  isEditing: boolean;
  existingVisit?: any;
  onSuccess: () => void;
}

export function useIndustrialAnalisisForm({
  form,
  customerId,
  isEditing,
  existingVisit,
  onSuccess,
}: UseIndustrialAnalisisFormProps) {
  // ==================== STATE ====================
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    isEditing ? new Set([1, 2, 3, 4, 5, 6, 7]) : new Set()
  );

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== STEP VALIDATION LOGIC ====================
  const validateStepFields = useCallback(
    (step: number, values: FormularioIndustrialSchema): boolean => {
      const stepConfig = FORM_STEPS[step - 1];
      if (!stepConfig || !stepConfig.fields) return true;

      const alimentacion = values.alimentacionDeseada;

      if (step === 4 && alimentacion !== TipoAlimentacion.ELECTRICO) {
        return true;
      }

      for (const fieldName of stepConfig.fields) {
        const value = (values as any)[fieldName];

        switch (fieldName) {
          case "archivos":
            continue;

          case "dimensionesCargas":
            if (!Array.isArray(value) || value.length === 0) {
              return false;
            }
            const totalPct = value.reduce(
              (sum: number, c: any) => sum + (c.porcentaje || 0),
              0
            );
            if (Math.abs(totalPct - 100) > 0.01) {
              return false;
            }
            for (const carga of value) {
              if (!carga.producto || carga.producto.trim() === "") {
                return false;
              }
            }
            continue;

          case "especificacionesPasillo":
            if (!value || typeof value !== "object") {
              return false;
            }
            continue;

          case "equiposElectricos":
            if (alimentacion === TipoAlimentacion.ELECTRICO) {
              if (!value || typeof value !== "object") {
                return false;
              }
            }
            continue;

          case "fechaCierre":
          case "fechaEstimadaDefinicion":
          case "website":
          case "distribuidor":
          case "contactoDistribuidor":
            continue;

          default:
            if (typeof value === "string") {
              if (!value || value.trim() === "") {
                return false;
              }
            } else if (value === null || value === undefined) {
              if (
                [
                  "alturaUltimoNivelEstanteria",
                  "maximaAlturaElevacion",
                  "pesoCargaMaximaAltura",
                  "pesoCargaPrimerNivel",
                  "dimensionesAreaTrabajoAncho",
                  "dimensionesAreaTrabajoFondo",
                  "turnosTrabajo",
                ].includes(fieldName)
              ) {
                return false;
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
    (values: FormularioIndustrialSchema) => {
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
        recalculateCompletedSteps(values as FormularioIndustrialSchema);
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
  const progress = useMemo(
    () => Math.round((completedSteps.size / FORM_STEPS.length) * 100),
    [completedSteps]
  );

  const allStepsComplete = useMemo(() => {
    return completedSteps.size === FORM_STEPS.length;
  }, [completedSteps]);

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

  // ==================== NAVIGATION ====================
  const handleNextStep = useCallback(async () => {
    const isValid = await validateStep(currentStep);

    if (!isValid) {
      toast.error("Por favor, completa todos los campos requeridos");
      return;
    }

    if (currentStep < FORM_STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, validateStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    async (step: number) => {
      if (step < 1 || step > FORM_STEPS.length) return;

      // Optional: Validate current step before allowing navigation
      // if (step !== currentStep) {
      //   const isCurrentStepValid = await validateStep(currentStep);
      //   if (!isCurrentStepValid) {
      //     toast.error("Completa el paso actual antes de cambiar");
      //     return;
      //   }
      // }

      setCurrentStep(step);
    },
    [currentStep, validateStep]
  );

  // ==================== SAVE VISIT ====================
  const saveVisit = useCallback(
    async ({ saveType, visitStatus }: SaveVisitParams) => {
      try {
        const formData = form.getValues();

        const payload = {
          visitData: {
            customerId,
            formType: "ANALISIS_INDUSTRIAL",
            status: visitStatus,
          },
          formularioData: {
            ...formData,
            equiposElectricos:
              formData.alimentacionDeseada === TipoAlimentacion.ELECTRICO
                ? formData.equiposElectricos
                : undefined,
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
    async (data: FormularioIndustrialSchema) => {
      if (!allStepsComplete) {
        toast.error("Debes completar todos los pasos antes de enviar");
        return;
      }

      setIsSubmitting(true);
      try {
        await saveVisit({ saveType: "submit", visitStatus: "COMPLETADA" });
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
      await saveVisit({ saveType: "draft", visitStatus: VisitStatus.BORRADOR });
    } finally {
      setIsSavingDraft(false);
    }
  }, [saveVisit]);

  // ==================== SAVE CHANGES ====================
  const onSaveChanges = useCallback(async () => {
    if (!isEditing) return;

    setIsSavingChanges(true);
    try {
      await saveVisit({
        saveType: "changes",
        visitStatus: existingVisit.status,
      });
    } finally {
      setIsSavingChanges(false);
    }
  }, [isEditing, existingVisit, saveVisit]);

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
    onSaveDraft,
    onSaveChanges,
  };
}
