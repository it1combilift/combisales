"use client";

import { useInspectionForm } from "./hooks/use-inspection-form";
import { InspectionFormHeader } from "./ui/form-header";
import { FormNavigation } from "./ui/form-navigation";
import { VehicleDataStep } from "./steps/vehicle-data-step";
import { ChecklistStep } from "./steps/checklist-step";
import { PhotosStep } from "./steps/photos-step";
import { ObservationsStep } from "./steps/observations-step";
import { SignatureStep } from "./steps/signature-step";
import { Vehicle } from "@/interfaces/inspection";
import { InspectionFormSchema } from "@/schemas/inspections";

interface InspectionFormProps {
  vehicles: Vehicle[];
  onSubmit: (data: InspectionFormSchema) => Promise<void>;
  isSubmitting: boolean;
  onClose?: () => void;
}

export function InspectionForm({
  vehicles,
  onSubmit,
  isSubmitting,
  onClose,
}: InspectionFormProps) {
  const {
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
  } = useInspectionForm();

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    await onSubmit(data);
  };

  const renderStepContent = () => {
    if (!currentStepConfig) return null;

    switch (currentStepConfig.key) {
      case "vehicleData":
        return <VehicleDataStep form={form} vehicles={vehicles} />;
      case "checklist":
        return <ChecklistStep form={form} />;
      case "photos":
        return <PhotosStep form={form} />;
      case "observations":
        return <ObservationsStep form={form} />;
      case "signature":
        return <SignatureStep form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with stepper & progress */}
      <InspectionFormHeader
        currentStep={currentStep}
        progress={progress}
        completedSteps={completedSteps}
        onGoToStep={goToStep}
      />

      {/* Step Content with animation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div
          key={currentStep}
          className="animate-in fade-in-50 slide-in-from-right-4 duration-300"
        >
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation footer */}
      <FormNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isSubmitting={isSubmitting}
        onNext={goToNextStep}
        onPrevious={goToPreviousStep}
        onSubmit={handleSubmit}
        onClose={onClose}
      />
    </div>
  );
}
