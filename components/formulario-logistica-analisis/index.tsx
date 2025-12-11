"use client";

import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormHeader } from "./ui/form-header";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormNavigation } from "./ui/form-navigation";
import { FormularioLogisticaAnalisisProps } from "./types";
import { useFileUploader } from "./hooks/use-file-uploader";
import { useLogisticaAnalisisForm } from "./hooks/use-logistica-analisis-form";

import {
  Step1Content,
  Step2Content,
  Step3Content,
  Step4Content,
  Step5Content,
  Step6Content,
  Step7Content,
} from "./steps";

import {
  FormularioLogisticaSchema,
  formularioLogisticaSchema,
} from "./schemas";

import {
  getDefaultValuesForNew,
  getDefaultValuesForEdit,
} from "./utils/default-values";

export default function FormularioLogisticaAnalisis({
  customer,
  onBack,
  onSuccess,
  existingVisit,
}: FormularioLogisticaAnalisisProps) {
  const isEditing = !!existingVisit;
  const formulario = existingVisit?.formularioLogisticaAnalisis;

  // ==================== FORM SETUP ====================
  const form = useForm<FormularioLogisticaSchema>({
    resolver: zodResolver(formularioLogisticaSchema),
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
    shouldSkipStep4,
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSaveDraft,
    onSaveChanges,
  } = useLogisticaAnalisisForm({
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
          <Step6Content {...stepProps} />
        </div>
        <div className={cn(currentStep !== 7 && "hidden")}>
          <Step7Content
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
        shouldSkipStep4={shouldSkipStep4}
      />

      {/* Form content */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0 w-full overflow-hidden"
        >
          <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
            <div className="px-2 py-2 sm:px-4 mx-auto w-full max-w-4xl">
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
          />
        </form>
      </Form>
    </div>
  );
}
