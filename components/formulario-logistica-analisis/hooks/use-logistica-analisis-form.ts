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
  // Si es true, coloca el paso del cliente antes del de archivos (al final del formulario)
  customerStepBeforeFiles?: boolean;
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
  customerStepBeforeFiles = false,
}: UseLogisticaAnalisisFormProps) {
  // Get form steps based on enableCustomerEntry and customerStepBeforeFiles
  const formSteps = useMemo(
    () => getFormSteps(enableCustomerEntry, customerStepBeforeFiles),
    [enableCustomerEntry, customerStepBeforeFiles],
  );

  // Calculate step number for batteries step (for navigation)
  const electricStepNumber = useMemo(() => {
    return formSteps.findIndex((s) => s.key === "batteries") + 1;
  }, [formSteps]);

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

  // ==================== STEP VALIDATION LOGIC (KEY-BASED) ====================
  const validateStepFields = useCallback(
    (step: number, values: FormularioLogisticaSchema): boolean => {
      const stepConfig = formSteps[step - 1];
      if (!stepConfig) return false;

      const stepKey = stepConfig.key;
      const alimentacion = values.alimentacionDeseada;

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

        case "operation":
          // Required: notasOperacion (min 1 char)
          if (
            !values.notasOperacion ||
            values.notasOperacion.trim().length === 0
          )
            return false;
          return true;

        case "application":
          // Required: descripcionProducto, alimentacionDeseada, and key numeric fields
          if (
            !values.descripcionProducto ||
            values.descripcionProducto.trim().length < 10
          )
            return false;
          if (!values.alimentacionDeseada) return false;
          if (
            values.turnosTrabajo === null ||
            values.turnosTrabajo === undefined
          )
            return false;
          return true;

        case "batteries":
          // Conditional: only required if alimentacion is ELECTRICO
          // When not ELECTRICO, return false (step is skipped, not completed)
          if (alimentacion !== TipoAlimentacion.ELECTRICO) return false;
          // If ELECTRICO, check if any meaningful data was entered in equiposElectricos
          const equipos = values.equiposElectricos;
          if (!equipos || typeof equipos !== "object") return false;
          // Check if user entered any actual data (not just default values)
          // noAplica=true counts as data, or any non-null field
          const equiposHasData: boolean =
            equipos.noAplica === true ||
            equipos.tipoCorriente !== null ||
            equipos.voltaje !== null ||
            equipos.frecuencia !== null ||
            equipos.amperaje !== null ||
            equipos.temperaturaAmbiente !== null ||
            equipos.horasTrabajoPorDia !== null ||
            Boolean(equipos.notas && equipos.notas.trim().length > 0);
          return equiposHasData;

        case "loads":
          // Required: dimensionesCargas with at least 1 valid entry and 100% total
          const cargas = values.dimensionesCargas;
          if (!Array.isArray(cargas) || cargas.length === 0) return false;
          const totalPct = cargas.reduce(
            (sum: number, c: any) => sum + (c.porcentaje || 0),
            0,
          );
          if (Math.abs(totalPct - 100) > 0.01) return false;
          for (const carga of cargas) {
            if (!carga.producto || carga.producto.trim() === "") return false;
          }
          return true;

        case "aisle":
          // Aisle step - check if any field in pasilloActual has actual data
          const pasillo = values.pasilloActual;
          if (!pasillo || typeof pasillo !== "object") return false;
          // Check if any field has a non-null value (handles both numbers and strings)
          const pasilloHasData = Object.values(pasillo).some((v) => {
            if (v === null || v === undefined) return false;
            if (typeof v === "string") return v.trim().length > 0;
            return true;
          });
          return pasilloHasData;

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

  // Calculate step number for optional files step
  const filesStepNumber = useMemo(() => {
    return formSteps.findIndex((s) => s.key === "files") + 1;
  }, [formSteps]);

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

    // Count completed steps, excluding conditional (batteries when not ELECTRICO)
    // and optional steps (files) from the count
    let effectiveCompleted = 0;
    completedSteps.forEach((step) => {
      // Skip electric step if not ELECTRICO
      if (step === electricStepNumber && skipElectricStep) return;
      // Skip optional files step from completed count
      if (step === filesStepNumber) return;
      effectiveCompleted++;
    });

    // Calculate total required steps (exclude batteries when not ELECTRICO, exclude optional files)
    let totalRequiredSteps = formSteps.length;
    if (skipElectricStep) totalRequiredSteps--;
    if (filesStepNumber > 0) totalRequiredSteps--;

    return Math.round((effectiveCompleted / totalRequiredSteps) * 100);
  }, [completedSteps, form, formSteps, electricStepNumber, filesStepNumber]);

  const allStepsComplete = useMemo((): boolean => {
    const values = form.getValues();
    const alimentacion = values.alimentacionDeseada;
    const skipElectricStep = alimentacion !== TipoAlimentacion.ELECTRICO;

    for (let step = 1; step <= formSteps.length; step++) {
      // Skip electric step if not ELECTRICO
      if (step === electricStepNumber && skipElectricStep) continue;
      // Skip optional files step - it doesn't block submission
      if (step === filesStepNumber) continue;
      if (!validateStepFields(step, values)) return false;
    }
    return true;
  }, [
    completedSteps,
    form,
    validateStepFields,
    formSteps,
    electricStepNumber,
    filesStepNumber,
  ]);

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
