import axios from "axios";
import { toast } from "sonner";
import { FORM_STEPS } from "../constants";
import { SaveVisitParams } from "../types";
import { UseFormReturn } from "react-hook-form";
import { useState, useCallback, useMemo } from "react";
import { FormularioIndustrialSchema } from "../schemas";
import { TipoAlimentacion, VisitStatus } from "@prisma/client";

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

  // ==================== COMPUTED VALUES ====================
  const progress = useMemo(
    () => Math.round((currentStep / FORM_STEPS.length) * 100),
    [currentStep]
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
