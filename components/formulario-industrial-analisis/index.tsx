"use client";

import { useForm } from "react-hook-form";
import { useMemo, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { VisitStatus } from "@prisma/client";
import { useI18n } from "@/lib/i18n/context";
import { FormHeader } from "./ui/form-header";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormNavigation } from "./ui/form-navigation";
import { FormularioIndustrialAnalisisProps } from "./types";
import { useFileUploader } from "./hooks/use-file-uploader";
import { Step1Content as CustomerDataStep } from "./steps/step-1-datos-cliente";
import { useIndustrialAnalisisForm } from "./hooks/use-industrial-analisis-form";

import { Step6Content } from "./steps/step-7-archivos";
import { Step2Content } from "./steps/step-3-datos-aplicacion";
import { Step3Content } from "./steps/step-4-equipos-electricos";
import { Step4Content } from "./steps/step-5-dimensiones-cargas";
import { Step1Content } from "./steps/step-2-descripcion-operacion";
import { Step5Content } from "./steps/step-6-especificaciones-pasillo";

import {
  FormularioIndustrialSchema,
  getFormularioIndustrialSchema,
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
  assignedSellerId,
  originalArchivos = [],
  readOnly = false,
  enableCustomerEntry = false,
  customerStepBeforeFiles = false,
  onDirtyChange,
}: FormularioIndustrialAnalisisProps) {
  const isEditing = !!existingVisit;
  const formulario = existingVisit?.formularioIndustrialAnalisis;
  const { t, locale } = useI18n();
  const schema = useMemo(() => getFormularioIndustrialSchema(t), [t]);

  // ==================== FORM SETUP ====================
  const form = useForm<FormularioIndustrialSchema>({
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
    shouldSkipStep3,
    formSteps,
    totalSteps,
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSubmitError,
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
    t,
    locale,
    assignedSellerId,
    enableCustomerEntry,
    customerStepBeforeFiles,
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
    formularioId: formulario?.id, // Pass formularioId for file isolation
    t,
  });

  // ==================== RENDER STEP CONTENT ====================
  const renderStepContent = () => {
    const stepProps = { form, isEditing };
    const stepKey = currentStepConfig?.key;

    // Render based on step key for flexible step ordering
    switch (stepKey) {
      case "customerData":
        return <CustomerDataStep {...stepProps} />;
      case "operation":
        return <Step1Content {...stepProps} />;
      case "application":
        return <Step2Content {...stepProps} />;
      case "batteries":
        return <Step3Content {...stepProps} />;
      case "loads":
        return <Step4Content {...stepProps} />;
      case "aisle":
        return <Step5Content {...stepProps} />;
      case "files":
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
    <div className="flex flex-col h-full bg-background w-full overflow-hidden">
      {/* Header with stepper */}
      <FormHeader
        currentStep={currentStep}
        currentStepConfig={currentStepConfig}
        progress={progress}
        completedSteps={completedSteps}
        onGoToStep={goToStep}
        shouldSkipStep3={shouldSkipStep3}
        formSteps={formSteps}
      />

      {/* Form content */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onSubmitError)}
          className="flex flex-col flex-1 min-h-0 max-w-dvw mx-auto w-full h-full"
        >
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-2 mx-auto w-full h-full">
              <div className="animate-in fade-in-50 slide-in-from-right-4 duration-300 h-full">
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
