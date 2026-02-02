"use client";

import { useForm } from "react-hook-form";
import { useMemo, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n/context";
import { FormHeader } from "./ui/form-header";
import { FormularioCSSAnalisisProps } from "./types";
import { FormNavigation } from "./ui/form-navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Step1Content as CompanyStep } from "./steps/step-1-empresa";
import { Step2Content as LocationStep } from "./steps/step-2-ubicacion";
import { getFormularioCSSSchema, FormularioCSSSchema } from "./schemas";
import { Step3Content as CommercialStep } from "./steps/step-3-comercial";

import { VisitStatus } from "@prisma/client";
import { Step1Content } from "./steps/step-4-producto";
import { Step3Content } from "./steps/step-6-medidas";
import { Step4Content } from "./steps/step-7-archivos";
import { Step2Content } from "./steps/step-5-contenedor";
import { useFileUploader } from "./hooks/use-file-uploader";
import { useCSSAnalisisForm } from "./hooks/use-css-analisis-form";

import {
  getDefaultValuesForNew,
  getDefaultValuesForEdit,
} from "./utils/default-values";

export default function FormularioCSSAnalisis({
  customer,
  zohoTaskId,
  onBack,
  onSuccess,
  existingVisit,
  assignedSellerId,
  originalArchivos = [],
  readOnly = false,
  enableCustomerEntry = false,
  onDirtyChange,
}: FormularioCSSAnalisisProps) {
  const isEditing = !!existingVisit;
  const formulario = existingVisit?.formularioCSSAnalisis;

  const { t, locale } = useI18n();
  const schema = useMemo(() => getFormularioCSSSchema(t), [t]);

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

  // ==================== NOTIFY DIRTY STATE ====================
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(form.formState.isDirty);
    }
  }, [form.formState.isDirty, onDirtyChange]);

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
    formSteps,
    enableCustomerEntry: enableCustomerEntryFromHook,
    totalSteps,
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSubmitError,
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
    enableCustomerEntry,
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
    formularioId: formulario?.id, // Pass formularioId for file isolation
    t,
  });

  // ==================== RENDER STEP CONTENT ====================
  const renderStepContent = () => {
    const stepProps = { form, isEditing };

    // When enableCustomerEntry is true, first 3 steps are customer data
    // Otherwise, the numbering starts from the regular steps
    if (enableCustomerEntry) {
      // DEALER flow: 7 steps total (3 Customer + 4 regular)
      switch (currentStep) {
        case 1:
          return <CompanyStep {...stepProps} />;
        case 2:
          return <LocationStep {...stepProps} />;
        case 3:
          return <CommercialStep {...stepProps} />;
        case 4:
          return <Step1Content {...stepProps} />;
        case 5:
          return <Step2Content {...stepProps} />;
        case 6:
          return <Step3Content {...stepProps} />;
        case 7:
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
              originalArchivos={originalArchivos}
              readOnly={readOnly}
            />
          );
        default:
          return null;
      }
    }

    // Normal flow (ADMIN/SELLER from clients/tasks): 4 steps
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
            originalArchivos={originalArchivos}
            readOnly={readOnly}
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
        formSteps={formSteps}
        enableCustomerEntry={enableCustomerEntryFromHook}
      />

      {/* Form content */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onSubmitError)}
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
            visitIsCompleted={
              VisitIsCompleted ? VisitStatus.COMPLETADA : undefined
            }
            readOnly={readOnly}
            totalSteps={totalSteps}
          />
        </form>
      </Form>
    </div>
  );
}
