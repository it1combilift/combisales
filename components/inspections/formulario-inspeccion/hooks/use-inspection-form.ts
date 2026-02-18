import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/lib/i18n/context";
import {
  getInspectionSchema,
  InspectionFormSchema,
} from "@/schemas/inspections";
import { INSPECTION_STEPS } from "../constants";

export function useInspectionForm() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const totalSteps = INSPECTION_STEPS.length;

  const schema = getInspectionSchema(t);

  const form = useForm<InspectionFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: "",
      mileage: 0,
      oilLevel: false,
      coolantLevel: false,
      brakeFluidLevel: false,
      hydraulicLevel: false,
      brakePedal: false,
      clutchPedal: false,
      gasPedal: false,
      headlights: false,
      tailLights: false,
      brakeLights: false,
      turnSignals: false,
      hazardLights: false,
      reversingLights: false,
      dashboardLights: false,
      photos: [],
      observations: "",
      signatureUrl: "",
      signatureCloudinaryId: "",
    },
    mode: "onChange",
  });

  const currentStepConfig = INSPECTION_STEPS.find(
    (s) => s.number === currentStep,
  );

  // Calculate progress percentage based on completed steps
  const progress = useMemo(() => {
    return Math.round((completedSteps.size / totalSteps) * 100);
  }, [completedSteps.size, totalSteps]);

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    if (!currentStepConfig) return true;

    const fields = currentStepConfig.fields as (keyof InspectionFormSchema)[];
    const result = await form.trigger(fields);
    return result;
  }, [currentStepConfig, form]);

  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(step);
      return next;
    });
  }, []);

  const goToNextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < totalSteps) {
      markStepCompleted(currentStep);
      setCurrentStep((prev) => prev + 1);
    }
    return isValid;
  }, [currentStep, totalSteps, validateCurrentStep, markStepCompleted]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps],
  );

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return {
    form,
    currentStep,
    totalSteps,
    currentStepConfig,
    completedSteps,
    progress,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    validateCurrentStep,
    markStepCompleted,
  };
}
