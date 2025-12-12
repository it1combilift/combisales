"use client";

import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormularioCSSAnalisisProps } from "./types";
import { zodResolver } from "@hookform/resolvers/zod";
import { formularioCSSSchema, FormularioCSSSchema } from "./schemas";

import {
  getDefaultValuesForNew,
  getDefaultValuesForEdit,
} from "./utils/default-values";

import { FormHeader } from "./ui/form-header";
import { FormNavigation } from "./ui/form-navigation";
import { Step1Content } from "./steps/step-4-producto";
import { Step2Content } from "./steps/step-5-contenedor";
import { Step3Content } from "./steps/step-6-medidas";
import { Step4Content } from "./steps/step-7-archivos";
import { useFileUploader } from "./hooks/use-file-uploader";
import { useCSSAnalisisForm } from "./hooks/use-css-analisis-form";

export default function FormularioCSSAnalisis({
  customer,
  onBack,
  onSuccess,
  existingVisit,
}: FormularioCSSAnalisisProps) {
  const isEditing = !!existingVisit;
  const formulario = existingVisit?.formularioCSSAnalisis;

  // ==================== FORM SETUP ====================
  const form = useForm<FormularioCSSSchema>({
    resolver: zodResolver(formularioCSSSchema),
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
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSaveDraft,
    onSaveChanges,
  } = useCSSAnalisisForm({
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

  // ==================== RENDER STEP CONTENT ====================
  const renderStepContent = () => {
    const stepProps = { form, isEditing };

    return (
      <>
        {/* Step 1: Producto y Fecha de cierre */}
        <div className={cn(currentStep !== 1 && "hidden")}>
          <Step1Content {...stepProps} />
        </div>
        {/* Step 2: Contenedor */}
        <div className={cn(currentStep !== 2 && "hidden")}>
          <Step2Content {...stepProps} />
        </div>
        {/* Step 3: Medidas */}
        <div className={cn(currentStep !== 3 && "hidden")}>
          <Step3Content {...stepProps} />
        </div>
        {/* Step 4: Archivos */}
        <div className={cn(currentStep !== 4 && "hidden")}>
          <Step4Content
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
    <div className="flex flex-col h-full max-h-[90vh] bg-background max-w-dvw">
      {/* Header with stepper */}
      <FormHeader
        currentStep={currentStep}
        currentStepConfig={currentStepConfig}
        progress={progress}
        completedSteps={completedSteps}
        onGoToStep={goToStep}
      />

      {/* Form content */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0 max-w-dvw mx-auto w-full"
        >
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-4 mx-auto w-full">
              <div className="animate-in fade-in-50 slide-in-from-right-4 duration-300">
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
          />
        </form>
      </Form>
    </div>
  );
}
