"use client";

import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormularioCSSAnalisisProps } from "./types";
import { zodResolver } from "@hookform/resolvers/zod";
import { getFormularioCSSSchema, FormularioCSSSchema } from "./schemas";
import { useI18n } from "@/lib/i18n/context";
import { useMemo } from "react";

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
import { VisitStatus } from "@prisma/client";
import { useLanguageValidation } from "@/hooks/use-language-validation";
import { LanguageValidationAlert } from "@/components/ui/language-validation-alert";

export default function FormularioCSSAnalisis({
  customer,
  zohoTaskId,
  onBack,
  onSuccess,
  existingVisit,
  assignedSellerId,
}: FormularioCSSAnalisisProps) {
  const isEditing = !!existingVisit;
  const formulario = existingVisit?.formularioCSSAnalisis;

  const { t, locale } = useI18n();
  const schema = useMemo(() => getFormularioCSSSchema(t), [t]);

  // ==================== LANGUAGE VALIDATION ====================
  const { showLanguageWarning, canSubmit } = useLanguageValidation({ locale });

  // ==================== FORM SETUP ====================
  const form = useForm<FormularioCSSSchema>({
    resolver: zodResolver(schema),
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
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSaveDraft,
    onSaveChanges,
    VisitIsCompleted,
  } = useCSSAnalisisForm({
    form,
    customerId: customer?.id,
    zohoTaskId,
    isEditing,
    existingVisit,
    onSuccess,
    t,
    locale,
    assignedSellerId,
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
    customerId: customer?.id || "",
    t,
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
        return (
          <Step4Content
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
              {/* Language validation alert for SELLER users */}
              <LanguageValidationAlert
                show={showLanguageWarning}
                className="mb-4"
              />

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
            allStepsComplete={allStepsComplete && canSubmit}
            isSubmitting={isSubmitting}
            isSavingDraft={isSavingDraft}
            isSavingChanges={isSavingChanges}
            isUploading={isUploading}
            deletingFileId={deletingFileId}
            onBack={onBack}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
            onSaveDraft={canSubmit ? onSaveDraft : undefined}
            onSaveChanges={canSubmit ? onSaveChanges : undefined}
            visitIsCompleted={
              VisitIsCompleted ? VisitStatus.COMPLETADA : undefined
            }
          />
        </form>
      </Form>
    </div>
  );
}
