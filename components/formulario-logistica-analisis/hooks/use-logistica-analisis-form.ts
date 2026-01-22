import axios from "axios";
import { toast } from "sonner";
import { getFormSteps, REGULAR_STEPS } from "../constants";
import { SaveVisitParams } from "../types";
import { UseFormReturn } from "react-hook-form";
import { FormularioLogisticaSchema } from "../schemas";
import { TipoAlimentacion, VisitStatus } from "@prisma/client";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

interface UseLogisticaAnalisisFormProps {
  form: UseFormReturn<FormularioLogisticaSchema>;
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

export function useLogisticaAnalisisForm({
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
}: UseLogisticaAnalisisFormProps) {
  // Get form steps based on enableCustomerEntry
  const formSteps = useMemo(
    () => getFormSteps(enableCustomerEntry),
    [enableCustomerEntry],
  );

  // Calculate the step number where electric equipment is shown
  // Without customer entry: step 3, With customer entry: step 4
  const electricStepNumber = enableCustomerEntry ? 4 : 3;

  // ==================== STATE ====================
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    isEditing ? new Set(formSteps.map((_, i) => i + 1)) : new Set(),
  );

  const VisitIsCompleted = existingVisit?.status === VisitStatus.COMPLETADA;

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== STEP VALIDATION LOGIC ====================
  const validateStepFields = useCallback(
    (step: number, values: FormularioLogisticaSchema): boolean => {
      const stepConfig = formSteps[step - 1];
      if (!stepConfig || !stepConfig.fields) return true;

      const alimentacion = values.alimentacionDeseada;

      // Electric equipment step is conditional (skip if not ELECTRICO)
      if (
        step === electricStepNumber &&
        alimentacion !== TipoAlimentacion.ELECTRICO
      ) {
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
              0,
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

          case "pasilloActual":
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

          // Customer data fields (optional for now - DEALER will fill them)
          case "customerName":
          case "customerEmail":
          case "customerPhone":
          case "customerAddress":
          case "customerCity":
          case "customerCountry":
          case "customerNotes":
            continue;

          // Optional fields - always valid
          case "fechaCierre":
          case "fechaEstimadaDefinicion":
          case "website":
          case "distribuidor":
          case "contactoDistribuidor":
          case "notasRampas":
          case "notasPasosPuertas":
          case "notasRestricciones":
          case "tieneRampas":
          case "tienePasosPuertas":
          case "tieneRestricciones":
          case "alturaMaximaNave":
          case "anchoPasilloActual":
          case "superficieTrabajo":
          case "condicionesSuelo":
          case "tipoOperacion":
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
    [],
  );

  // Function to recalculate all completed steps
  const recalculateCompletedSteps = useCallback(
    (values: FormularioLogisticaSchema) => {
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
        recalculateCompletedSteps(values as FormularioLogisticaSchema);
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
  const requiredStepsCount = useMemo(() => {
    const alimentacion = form.watch("alimentacionDeseada");
    return alimentacion !== TipoAlimentacion.ELECTRICO
      ? formSteps.length - 1
      : formSteps.length;
  }, [form, formSteps]);

  const progress = useMemo(() => {
    const alimentacion = form.getValues("alimentacionDeseada");
    const skipElectricStep = alimentacion !== TipoAlimentacion.ELECTRICO;

    let effectiveCompleted = completedSteps.size;
    if (skipElectricStep && completedSteps.has(electricStepNumber)) {
      effectiveCompleted--;
    }

    const totalSteps = skipElectricStep
      ? formSteps.length - 1
      : formSteps.length;
    return Math.round((effectiveCompleted / totalSteps) * 100);
  }, [completedSteps, form, formSteps, electricStepNumber]);

  const allStepsComplete = useMemo((): boolean => {
    const values = form.getValues();
    const alimentacion = values.alimentacionDeseada;
    const skipElectricStep = alimentacion !== TipoAlimentacion.ELECTRICO;

    for (let step = 1; step <= formSteps.length; step++) {
      if (step === electricStepNumber && skipElectricStep) continue;
      if (!validateStepFields(step, values)) return false;
    }
    return true;
  }, [completedSteps, form, validateStepFields, formSteps, electricStepNumber]);

  const currentStepConfig = formSteps[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === formSteps.length;

  // ==================== STEP VALIDATION ====================
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

  // ==================== NAVIGATION HELPERS ====================
  const shouldSkipElectricStep = useCallback(() => {
    const alimentacion = form.getValues("alimentacionDeseada");
    return alimentacion !== TipoAlimentacion.ELECTRICO;
  }, [form]);

  const getNextStep = useCallback(
    (fromStep: number): number => {
      const nextStep = fromStep + 1;
      if (nextStep === electricStepNumber && shouldSkipElectricStep()) {
        return electricStepNumber + 1;
      }
      return nextStep;
    },
    [shouldSkipElectricStep, electricStepNumber],
  );

  const getPrevStep = useCallback(
    (fromStep: number): number => {
      const prevStep = fromStep - 1;
      if (prevStep === electricStepNumber && shouldSkipElectricStep()) {
        return electricStepNumber - 1;
      }
      return prevStep;
    },
    [shouldSkipElectricStep, electricStepNumber],
  );

  // ==================== NAVIGATION ====================
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

  // ==================== SAVE VISIT ====================
  const saveVisit = useCallback(
    async ({ saveType, visitStatus }: SaveVisitParams) => {
      try {
        const formData = form.getValues();

        const includeEquiposElectricos =
          formData.alimentacionDeseada === TipoAlimentacion.ELECTRICO &&
          !formData.equiposElectricos?.noAplica;

        const equiposElectricosData = includeEquiposElectricos
          ? formData.equiposElectricos
          : formData.alimentacionDeseada === TipoAlimentacion.ELECTRICO
            ? { noAplica: true }
            : undefined;

        const payload = {
          visitData: {
            customerId,
            zohoTaskId,
            formType: "ANALISIS_LOGISTICA",
            status: visitStatus,
            locale,
            // Para visitas de DEALER: asignar vendedor
            assignedSellerId,
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
    [form, customerId, zohoTaskId, isEditing, existingVisit, onSuccess, t],
  );

  // ==================== FORM SUBMIT ====================
  const onSubmit = useCallback(
    async (data: FormularioLogisticaSchema) => {
      setIsSubmitting(true);
      try {
        await saveVisit({ saveType: "submit", visitStatus: "COMPLETADA" });
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
    shouldSkipElectricStep,

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
