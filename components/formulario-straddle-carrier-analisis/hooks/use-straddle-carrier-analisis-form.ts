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
  // Si es true, coloca el paso del cliente antes del de archivos (al final del formulario)
  customerStepBeforeFiles?: boolean;
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
  customerStepBeforeFiles = false,
}: UseStraddleCarrierAnalisisFormProps) {
  // Get form steps based on enableCustomerEntry and customerStepBeforeFiles
  const formSteps = useMemo(
    () => getFormSteps(enableCustomerEntry, customerStepBeforeFiles),
    [enableCustomerEntry, customerStepBeforeFiles],
  );

  // Calculate step numbers for navigation (based on step keys)
  const containersStepNumber = useMemo(() => {
    return formSteps.findIndex((s) => s.key === "containers") + 1;
  }, [formSteps]);

  const specialLoadStepNumber = useMemo(() => {
    return formSteps.findIndex((s) => s.key === "specialLoad") + 1;
  }, [formSteps]);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    isEditing ? new Set(formSteps.map((_, i) => i + 1)) : new Set(),
  );

  const visitIsCompleted = existingVisit?.status === VisitStatus.COMPLETADA;

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== STEP VALIDATION LOGIC (KEY-BASED) ====================
  const validateStepFields = useCallback(
    (step: number, values: FormularioStraddleCarrierSchema): boolean => {
      const stepConfig = formSteps[step - 1];
      if (!stepConfig) return false;

      const stepKey = stepConfig.key;
      const manejaContenedores = values.manejaContenedores;
      const manejaCargaEspecial = values.manejaCargaEspecial;

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

        case "instructions":
          // Required: at least one of manejaContenedores or manejaCargaEspecial must be true
          if (!manejaContenedores && !manejaCargaEspecial) return false;
          return true;

        case "containers":
          // Conditional: skip if manejaContenedores is false
          // When condition doesn't apply, return false (step is skipped, not completed)
          if (!manejaContenedores) return false;
          // If manejaContenedores, at least one container size must be selected
          const tamanios = values.contenedoresTamanios;
          if (!tamanios || typeof tamanios !== "object") return false;
          const hasSelectedSize = Object.values(tamanios).some(
            (size: any) => size?.selected === true,
          );
          if (!hasSelectedSize) return false;
          return true;

        case "specialLoad":
          // Conditional: skip if manejaCargaEspecial is false
          // When condition doesn't apply, return false (step is skipped, not completed)
          if (!manejaCargaEspecial) return false;
          // If manejaCargaEspecial, require at least some product dimensions
          if (
            values.productoMasLargo === null &&
            values.productoMasCorto === null &&
            values.productoMasAncho === null
          )
            return false;
          return true;

        case "others":
          // Others step is OPTIONAL - only completed if user entered any data
          const othersHasData =
            (values.zonasPasoAncho !== null &&
              values.zonasPasoAncho !== undefined) ||
            (values.zonasPasoAlto !== null &&
              values.zonasPasoAlto !== undefined) ||
            (values.condicionesPiso &&
              values.condicionesPiso.trim().length > 0) ||
            (values.restriccionesAltura !== null &&
              values.restriccionesAltura !== undefined) ||
            (values.restriccionesAnchura !== null &&
              values.restriccionesAnchura !== undefined) ||
            (values.notasAdicionales &&
              values.notasAdicionales.trim().length > 0);
          return othersHasData;

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

  // Calculate step numbers for optional steps (others, files)
  const othersStepNumber = useMemo(() => {
    return formSteps.findIndex((s) => s.key === "others") + 1;
  }, [formSteps]);

  const filesStepNumber = useMemo(() => {
    return formSteps.findIndex((s) => s.key === "files") + 1;
  }, [formSteps]);

  const shouldSkipContainersStep = useCallback(() => {
    return !form.getValues("manejaContenedores");
  }, [form]);

  const shouldSkipSpecialLoadStep = useCallback(() => {
    return !form.getValues("manejaCargaEspecial");
  }, [form]);

  const progress = useMemo(() => {
    const skipContainers = shouldSkipContainersStep();
    const skipSpecialLoad = shouldSkipSpecialLoadStep();

    // Count completed steps, excluding conditional and optional steps
    let effectiveCompleted = 0;
    completedSteps.forEach((step) => {
      // Skip conditional steps when they don't apply
      if (step === containersStepNumber && skipContainers) return;
      if (step === specialLoadStepNumber && skipSpecialLoad) return;
      // Skip optional steps from completed count
      if (step === othersStepNumber || step === filesStepNumber) return;
      effectiveCompleted++;
    });

    // Calculate total required steps (exclude conditional and optional steps)
    let totalSteps = formSteps.length;
    if (skipContainers) totalSteps--;
    if (skipSpecialLoad) totalSteps--;
    if (othersStepNumber > 0) totalSteps--;
    if (filesStepNumber > 0) totalSteps--;

    return Math.round((effectiveCompleted / totalSteps) * 100);
  }, [
    completedSteps,
    shouldSkipContainersStep,
    shouldSkipSpecialLoadStep,
    formSteps,
    containersStepNumber,
    specialLoadStepNumber,
    othersStepNumber,
    filesStepNumber,
  ]);

  const allStepsComplete = useMemo((): boolean => {
    const values = form.getValues();
    const skipContainers = shouldSkipContainersStep();
    const skipSpecialLoad = shouldSkipSpecialLoadStep();

    for (let step = 1; step <= formSteps.length; step++) {
      // Skip conditional steps when they don't apply
      if (step === containersStepNumber && skipContainers) continue;
      if (step === specialLoadStepNumber && skipSpecialLoad) continue;
      // Skip optional steps - they don't block submission
      if (step === othersStepNumber || step === filesStepNumber) continue;
      if (!validateStepFields(step, values)) return false;
    }
    return true;
  }, [
    shouldSkipContainersStep,
    shouldSkipSpecialLoadStep,
    form,
    validateStepFields,
    formSteps,
    containersStepNumber,
    specialLoadStepNumber,
    othersStepNumber,
    filesStepNumber,
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
