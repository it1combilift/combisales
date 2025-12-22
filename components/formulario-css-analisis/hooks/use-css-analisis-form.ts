import axios from "axios";
import { toast } from "sonner";
import { SaveType } from "../types";
import { FORM_STEPS } from "../constants";
import { UseFormReturn } from "react-hook-form";
import { FormularioCSSSchema } from "../schemas";
import { VisitStatus, VisitFormType } from "@prisma/client";
import { useState, useCallback, useMemo, useEffect } from "react";

interface UseCSSAnalisisFormProps {
  form: UseFormReturn<FormularioCSSSchema>;
  customerId: string;
  isEditing: boolean;
  existingVisit?: any;
  onSuccess: () => void;
}

export function useCSSAnalisisForm({
  form,
  customerId,
  isEditing,
  existingVisit,
  onSuccess,
}: UseCSSAnalisisFormProps) {
  // ==================== STATE ====================
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    isEditing ? new Set([1, 2, 3, 4]) : new Set()
  );

  // ==================== COMPUTED VALUES ====================
  const progress = useMemo(
    () => Math.round((currentStep / FORM_STEPS.length) * 100),
    [currentStep]
  );

  // Watch required fields for real-time validation
  const descripcionProducto = form.watch("descripcionProducto");
  const contenedorTipos = form.watch("contenedorTipos");
  const contenedorMedidas = form.watch("contenedorMedidas");

  // Real-time validation: check if all required fields are filled
  const allStepsComplete = useMemo((): boolean => {
    // Step 1: descripcionProducto is required (min 10 chars)
    const step1Valid = Boolean(
      descripcionProducto && descripcionProducto.trim().length >= 10
    );

    // Step 2: contenedorTipos is required (min 1 item)
    const step2Valid = Boolean(contenedorTipos && contenedorTipos.length >= 1);

    // Step 3: contenedorMedidas is required (min 1 item)
    const step3Valid = Boolean(
      contenedorMedidas && contenedorMedidas.length >= 1
    );

    // Step 4: archivos is optional, no validation needed
    const step4Valid = true;

    return step1Valid && step2Valid && step3Valid && step4Valid;
  }, [descripcionProducto, contenedorTipos, contenedorMedidas]);

  // Update completedSteps based on real-time validation for visual feedback
  useEffect(() => {
    const newCompletedSteps = new Set<number>();

    // Step 1
    if (descripcionProducto && descripcionProducto.trim().length >= 10) {
      newCompletedSteps.add(1);
    }

    // Step 2
    if (contenedorTipos && contenedorTipos.length >= 1) {
      newCompletedSteps.add(2);
    }

    // Step 3
    if (contenedorMedidas && contenedorMedidas.length >= 1) {
      newCompletedSteps.add(3);
    }

    // Step 4 is always considered complete (archivos is optional)
    newCompletedSteps.add(4);

    setCompletedSteps(newCompletedSteps);
  }, [descripcionProducto, contenedorTipos, contenedorMedidas]);

  const currentStepConfig = FORM_STEPS[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === FORM_STEPS.length;

  // ==================== VALIDATION ====================
  const validateStep = useCallback(
    async (stepNumber: number) => {
      const stepConfig = FORM_STEPS[stepNumber - 1];
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
    [form]
  );

  // ==================== NAVIGATION ====================
  const handleNextStep = useCallback(async () => {
    await validateStep(currentStep);
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
    async (stepId: number) => {
      await validateStep(currentStep);
      setCurrentStep(stepId);
    },
    [currentStep, validateStep]
  );

  // ==================== SAVE LOGIC ====================
  const saveVisit = async (
    data: FormularioCSSSchema,
    status: VisitStatus,
    saveType: SaveType = "submit"
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
          visitData: { status },
          formularioData: data,
        });

        if (response.status === 200) {
          const messages = {
            submit: "Visita actualizada y enviada exitosamente",
            draft: "Borrador actualizado exitosamente",
            changes: "Cambios guardados exitosamente",
          };
          toast.success(messages[saveType]);
          onSuccess();
        }
      } else {
        response = await axios.post("/api/visits", {
          visitData: {
            customerId,
            formType: VisitFormType.ANALISIS_CSS,
            visitDate: new Date(),
            status,
          },
          formularioData: data,
        });

        if (response.status === 201) {
          toast.success(
            saveType === "submit"
              ? "Visita guardada exitosamente"
              : "Borrador guardado exitosamente"
          );
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error saving visit:", error);
      toast.error(error.response?.data?.error || "Error al guardar la visita");
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

    // Actions
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSaveDraft,
    onSaveChanges,

    // Visit info
    VisitStatus,
  };
}
