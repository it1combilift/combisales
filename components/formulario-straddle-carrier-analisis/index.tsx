"use client";

import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormHeader } from "./ui/form-header";
import { FormNavigation } from "./ui/form-navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFileUploader } from "./hooks/use-file-uploader";
import { FormularioStraddleCarrierAnalisisProps } from "./types";
import { useStraddleCarrierAnalisisForm } from "./hooks/use-straddle-carrier-analisis-form";
import { FORM_STEPS } from "./constants";

import { Step5Content } from "./steps/step-5-otros";
import { Step6Content } from "./steps/step-6-archivos";
import { Step3Content } from "./steps/step-3-contenedores";
import { Step1Content } from "./steps/step-1-datos-cliente";
import { Step2Content } from "./steps/step-2-instrucciones";
import { Step4Content } from "./steps/step-4-carga-especial";

import {
  FormularioStraddleCarrierSchema,
  formularioStraddleCarrierSchema,
} from "./schemas";

import {
  getDefaultValuesForNew,
  getDefaultValuesForEdit,
} from "./utils/default-values";

export default function FormularioStraddleCarrierAnalisis({
  customer,
  onBack,
  onSuccess,
  existingVisit,
}: FormularioStraddleCarrierAnalisisProps) {
  const isEditing = !!existingVisit;
  const formulario = existingVisit?.formularioStraddleCarrierAnalisis;

  // ==================== FORM SETUP ====================
  const form = useForm<FormularioStraddleCarrierSchema>({
    resolver: zodResolver(formularioStraddleCarrierSchema),
    mode: "onChange",
    defaultValues:
      isEditing && formulario
        ? getDefaultValuesForEdit(formulario)
        : getDefaultValuesForNew(customer),
  });

  // ==================== CUSTOM HOOKS ====================
  const {
    currentStep,
    isSubmitting,
    isSavingDraft,
    isSavingChanges,
    completedSteps,
    progress,
    allStepsComplete,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    shouldSkipStep3,
    shouldSkipStep4,
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSaveDraft,
    onSaveChanges,
  } = useStraddleCarrierAnalisisForm({
    form,
    customerId: customer.id,
    isEditing,
    existingVisit,
    onSuccess,
  });

  const {
    uploadingFiles,
    uploadProgress,
    isUploading,
    deletingFileId,
    fileInputRef,
    cameraPhotoRef,
    cameraVideoRef,
    handleFileSelect,
    handleRemoveFile,
    handleDrop,
  } = useFileUploader({
    form,
    customerId: customer.id,
  });

  // Calculate visible steps count for navigation
  const visibleStepsCount = FORM_STEPS.filter((step) => {
    if (step.number === 3 && shouldSkipStep3()) return false;
    if (step.number === 4 && shouldSkipStep4()) return false;
    return true;
  }).length;

  // ==================== RENDER STEP CONTENT ====================
  const renderStepContent = () => {
    const stepProps = { form, isEditing };

    return (
      <>
        <div className={cn(currentStep !== 1 && "hidden")}>
          <Step1Content {...stepProps} />
        </div>
        <div className={cn(currentStep !== 2 && "hidden")}>
          <Step2Content {...stepProps} />
        </div>
        <div className={cn(currentStep !== 3 && "hidden")}>
          <Step3Content {...stepProps} />
        </div>
        <div className={cn(currentStep !== 4 && "hidden")}>
          <Step4Content {...stepProps} />
        </div>
        <div className={cn(currentStep !== 5 && "hidden")}>
          <Step5Content {...stepProps} />
        </div>
        <div className={cn(currentStep !== 6 && "hidden")}>
          <Step6Content
            form={form}
            customerId={customer.id}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            uploadingFiles={uploadingFiles}
            deletingFileId={deletingFileId}
            onFileSelect={handleFileSelect}
            onRemoveFile={handleRemoveFile}
            onDrop={handleDrop}
            fileInputRef={fileInputRef}
            cameraPhotoRef={cameraPhotoRef}
            cameraVideoRef={cameraVideoRef}
          />
        </div>
      </>
    );
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-background w-full overflow-hidden">
      {/* Header with stepper */}
      <FormHeader
        currentStep={currentStep}
        currentStepConfig={currentStepConfig}
        progress={progress}
        completedSteps={completedSteps}
        onGoToStep={goToStep}
        shouldSkipStep3={shouldSkipStep3}
        shouldSkipStep4={shouldSkipStep4}
      />

      {/* Form content */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0 w-full overflow-hidden"
        >
          <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
            <div className="px-3 py-3 sm:px-4 sm:py-4 mx-auto w-full max-w-4xl">
              <div className="animate-in fade-in-20 duration-150">
                {renderStepContent()}
              </div>
            </div>
          </main>

          {/* Footer with navigation */}
          <FormNavigation
            currentStep={currentStep}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isEditing={isEditing}
            allStepsComplete={allStepsComplete}
            isSubmitting={isSubmitting}
            isSavingDraft={isSavingDraft}
            isSavingChanges={isSavingChanges}
            isUploading={isUploading}
            deletingFileId={deletingFileId}
            onBack={onBack}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
            onSaveDraft={onSaveDraft}
            onSaveChanges={onSaveChanges}
            visibleStepsCount={visibleStepsCount}
          />
        </form>
      </Form>
    </div>
  );
}
