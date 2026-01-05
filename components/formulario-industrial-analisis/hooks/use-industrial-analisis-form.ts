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
  customerId?: string; // Opcional: para visitas de cliente
  zohoTaskId?: string; // Opcional: para visitas de tarea
  isEditing: boolean;
  existingVisit?: any;
  onSuccess: () => void;
  t: (key: string) => string;
  locale: string;
}

export function useIndustrialAnalisisForm({
  form,
  customerId,
  zohoTaskId,
  isEditing,
  existingVisit,
  onSuccess,
  t,
  locale,
}: UseIndustrialAnalisisFormProps) {
  // ==================== STATE ====================
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    isEditing ? new Set([1, 2, 3, 4, 5, 6]) : new Set()
  );

  const VisitIsCompleted = existingVisit?.status === VisitStatus.COMPLETADA;

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== STEP VALIDATION LOGIC ====================
  const validateStepFields = useCallback(
    (step: number, values: FormularioIndustrialSchema): boolean => {
      const stepConfig = FORM_STEPS[step - 1];
      if (!stepConfig || !stepConfig.fields) return true;

      const alimentacion = values.alimentacionDeseada;

      // Step 3 (Equipos eléctricos) solo aplica si alimentación es ELECTRICO
      if (step === 3 && alimentacion !== TipoAlimentacion.ELECTRICO) {
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
  /**
   * Calcula el número de pasos requeridos
   * Si alimentación no es ELECTRICO, Step 3 (Equipos eléctricos) no cuenta
   */
  const requiredStepsCount = useMemo(() => {
    const alimentacion = form.watch("alimentacionDeseada");
    // Si no es eléctrico, son 5 pasos (excluye Step 3)
    return alimentacion !== TipoAlimentacion.ELECTRICO
      ? FORM_STEPS.length - 1
      : FORM_STEPS.length;
  }, [form]);

  const progress = useMemo(() => {
    const alimentacion = form.getValues("alimentacionDeseada");
    const skipStep3 = alimentacion !== TipoAlimentacion.ELECTRICO;

    // Si debemos saltar Step 3, no contarlo en completados
    let effectiveCompleted = completedSteps.size;
    if (skipStep3 && completedSteps.has(3)) {
      effectiveCompleted--;
    }

    const totalSteps = skipStep3 ? FORM_STEPS.length - 1 : FORM_STEPS.length;
    return Math.round((effectiveCompleted / totalSteps) * 100);
  }, [completedSteps, form]);

  const allStepsComplete = useMemo((): boolean => {
    const values = form.getValues();
    const alimentacion = values.alimentacionDeseada;
    const skipStep3 = alimentacion !== TipoAlimentacion.ELECTRICO;

    // Verificar que todos los pasos requeridos estén completos usando validación en tiempo real
    for (let step = 1; step <= FORM_STEPS.length; step++) {
      // Si debemos saltar Step 3, ignorarlo
      if (step === 3 && skipStep3) continue;
      if (!validateStepFields(step, values)) return false;
    }
    return true;
  }, [completedSteps, form, validateStepFields]);

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
  /**
   * Determina si el Step 3 debe ser saltado
   * El Step 3 (Equipos Eléctricos) solo aplica cuando alimentación es ELECTRICO
   */
  const shouldSkipStep3 = useCallback(() => {
    const alimentacion = form.getValues("alimentacionDeseada");
    return alimentacion !== TipoAlimentacion.ELECTRICO;
  }, [form]);

  /**
   * Obtiene el siguiente paso considerando saltos
   */
  const getNextStep = useCallback(
    (fromStep: number): number => {
      const nextStep = fromStep + 1;
      if (nextStep === 3 && shouldSkipStep3()) {
        return 4;
      }
      return nextStep;
    },
    [shouldSkipStep3]
  );

  /**
   * Obtiene el paso anterior considerando saltos
   */
  const getPrevStep = useCallback(
    (fromStep: number): number => {
      const prevStep = fromStep - 1;
      if (prevStep === 3 && shouldSkipStep3()) {
        return 2;
      }
      return prevStep;
    },
    [shouldSkipStep3]
  );

  // ==================== NAVIGATION ====================
  const handleNextStep = useCallback(async () => {
    const isValid = await validateStep(currentStep);

    if (!isValid) {
      toast.error(t("toast.form.validationError"));
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

        // Determinar si los equipos eléctricos deben incluirse
        const includeEquiposElectricos =
          formData.alimentacionDeseada === TipoAlimentacion.ELECTRICO &&
          !formData.equiposElectricos?.noAplica;

        // Si noAplica está activo, enviar solo el campo noAplica
        const equiposElectricosData = includeEquiposElectricos
          ? formData.equiposElectricos
          : formData.alimentacionDeseada === TipoAlimentacion.ELECTRICO
          ? { noAplica: true } // Mantener el flag de noAplica
          : undefined;

        const payload = {
          visitData: {
            customerId,
            zohoTaskId,
            formType: "ANALISIS_INDUSTRIAL",
            status: visitStatus,
            locale,
          },
          formularioData: {
            ...formData,
            equiposElectricos: equiposElectricosData,
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
    [form, customerId, zohoTaskId, isEditing, existingVisit, onSuccess, t]
  );

  // ==================== FORM SUBMIT ====================
  const onSubmit = useCallback(
    async (data: FormularioIndustrialSchema) => {
      setIsSubmitting(true);
      try {
        await saveVisit({ saveType: "submit", visitStatus: "COMPLETADA" });
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
    shouldSkipStep3,

    // Actions
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSaveDraft,
    onSaveChanges,

    // Visit info
    VisitIsCompleted,
  };
}
