"use client";

import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { VisitStatus } from "@prisma/client";
import { FormHeader } from "./ui/form-header";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormNavigation } from "./ui/form-navigation";
import { FormularioIndustrialAnalisisProps } from "./types";
import { useFileUploader } from "./hooks/use-file-uploader";
import { useIndustrialAnalisisForm } from "./hooks/use-industrial-analisis-form";

import { Step1Content } from "./steps/step-2-descripcion-operacion";
import { Step2Content } from "./steps/step-3-datos-aplicacion";
import { Step3Content } from "./steps/step-4-equipos-electricos";
import { Step4Content } from "./steps/step-5-dimensiones-cargas";
import { Step5Content } from "./steps/step-6-especificaciones-pasillo";
import { Step6Content } from "./steps/step-7-archivos";

import {
  FormularioIndustrialSchema,
  formularioIndustrialSchema,
} from "./schemas";

import {
  getDefaultValuesForNew,
  getDefaultValuesForEdit,
} from "./utils/default-values";

export default function FormularioIndustrialAnalisis({
  customer,
  zohoTaskId,
  onBack,
  onSuccess,
  existingVisit,
}: FormularioIndustrialAnalisisProps) {
  const isEditing = !!existingVisit;
  const formulario = existingVisit?.formularioIndustrialAnalisis;

  // ==================== FORM SETUP ====================
  const form = useForm<FormularioIndustrialSchema>({
    resolver: zodResolver(formularioIndustrialSchema),
    mode: "onChange",
    defaultValues:
      isEditing && formulario
        ? getDefaultValuesForEdit(formulario)
        : customer
        ? getDefaultValuesForNew(customer)
        : getDefaultValuesForNew({} as any),
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
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSaveDraft,
    onSaveChanges,
    VisitIsCompleted,
  } = useIndustrialAnalisisForm({
    form,
    customerId: customer?.id || undefined,
    zohoTaskId,
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
    customerId: customer?.id || undefined,
  });

  // ==================== RENDER STEP CONTENT ====================
  const renderStepContent = () => {
    const stepProps = { form, isEditing };

    // Render only the current step to avoid HTML validation issues with hidden required fields
    switch (currentStep) {
      case 1:
        return <Step1Content {...stepProps} />;
      case 2:
        return <Step2Content {...stepProps} />;
      case 3:
        return <Step3Content {...stepProps} />;
      case 4:
        return <Step4Content {...stepProps} />;
      case 5:
        return <Step5Content {...stepProps} />;
      case 6:
        return (
          <Step6Content
            form={form}
            customerId={customer?.id || ""}
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
        );
      default:
        return null;
    }
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
            visitIsCompleted={
              VisitIsCompleted ? VisitStatus.COMPLETADA : undefined
            }
          />
        </form>
      </Form>
    </div>
  );
}
