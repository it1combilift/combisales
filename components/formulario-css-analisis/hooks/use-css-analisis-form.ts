import { useState, useCallback, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { VisitStatus, VisitFormType } from "@prisma/client";
import { FORM_STEPS } from "@/constants/visits";
import { FormularioCSSSchema } from "../schemas";
import { SaveType } from "../types";

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
    isEditing ? new Set([1, 2, 3, 4, 5, 6, 7]) : new Set()
  );

  // ==================== COMPUTED VALUES ====================
  const progress = useMemo(
    () => Math.round((currentStep / FORM_STEPS.length) * 100),
    [currentStep]
  );

  const allStepsComplete = useMemo(() => {
    return FORM_STEPS.every((step) => completedSteps.has(step.id));
  }, [completedSteps]);

  const currentStepConfig = FORM_STEPS[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === FORM_STEPS.length;

  // ==================== VALIDATION ====================
  const validateStep = useCallback(
    async (stepId: number) => {
      const stepConfig = FORM_STEPS[stepId - 1];
      const isValid = await form.trigger(stepConfig.fields);
      if (isValid) {
        setCompletedSteps((prev) => new Set([...prev, stepId]));
      } else {
        setCompletedSteps((prev) => {
          const next = new Set(prev);
          next.delete(stepId);
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
  };
}
