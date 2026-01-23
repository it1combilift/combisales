"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n/context";
import { FormHeader } from "./ui/form-header";
import { FormNavigation } from "./ui/form-navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFileUploader } from "./hooks/use-file-uploader";
import { FormularioStraddleCarrierAnalisisProps } from "./types";
import { useStraddleCarrierAnalisisForm } from "./hooks/use-straddle-carrier-analisis-form";
import { getFormSteps } from "./constants";

// Customer data step (shown only when enableCustomerEntry is true)
import { Step1Content as CustomerDataStep } from "./steps/step-1-datos-cliente";

// Regular steps (renumbered when customer entry is enabled)
import { Step1Content } from "./steps/step-2-instrucciones";
import { Step2Content } from "./steps/step-3-contenedores";
import { Step3Content } from "./steps/step-4-carga-especial";
import { Step4Content } from "./steps/step-5-otros";
import { Step5Content } from "./steps/step-6-archivos";

import {
  FormularioStraddleCarrierSchema,
  getFormularioStraddleCarrierSchema,
} from "./schemas";

import {
  getDefaultValuesForNew,
  getDefaultValuesForEdit,
} from "./utils/default-values";
import { VisitStatus } from "@prisma/client";

export default function FormularioStraddleCarrierAnalisis({
  customer,
  zohoTaskId,
  onBack,
  onSuccess,
  existingVisit,
  assignedSellerId,
  originalArchivos = [],
  readOnly = false,
  enableCustomerEntry = false,
}: FormularioStraddleCarrierAnalisisProps) {
  const isEditing = !!existingVisit;
  const formulario = existingVisit?.formularioStraddleCarrierAnalisis;
  const { t, locale } = useI18n();
  const schema = useMemo(() => getFormularioStraddleCarrierSchema(t), [t]);

  // Get form steps based on enableCustomerEntry prop
  const formSteps = useMemo(
    () => getFormSteps(enableCustomerEntry),
    [enableCustomerEntry],
  );

  // ==================== FORM SETUP ====================
  const form = useForm<FormularioStraddleCarrierSchema>({
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
    shouldSkipContainersStep,
    shouldSkipSpecialLoadStep,
    handleNextStep,
    handlePrevStep,
    goToStep,
    onSubmit,
    onSubmitError,
    onSaveDraft,
    onSaveChanges,
    visitIsCompleted,
  } = useStraddleCarrierAnalisisForm({
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

    // When enableCustomerEntry is true, we have 6 steps total
    // Step 1 = Customer Data, Steps 2-6 = Regular steps
    if (enableCustomerEntry) {
      switch (currentStep) {
        case 1:
          return <CustomerDataStep {...stepProps} />;
        case 2:
          return <Step1Content {...stepProps} />;
        case 3:
          return <Step2Content {...stepProps} />;
        case 4:
          return <Step3Content {...stepProps} />;
        case 5:
          return <Step4Content {...stepProps} />;
        case 6:
          return (
            <Step5Content
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

    // Original 5-step flow (without customer entry)
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
        return (
          <Step5Content
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
    <div className="flex flex-col h-full max-h-[85vh] bg-background w-full overflow-hidden">
      {/* Header with stepper */}
      <FormHeader
        currentStep={currentStep}
        currentStepConfig={currentStepConfig}
        progress={progress}
        completedSteps={completedSteps}
        onGoToStep={goToStep}
        shouldSkipStep2={shouldSkipContainersStep}
        shouldSkipStep3={shouldSkipSpecialLoadStep}
        formSteps={formSteps}
      />

      {/* Form content */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onSubmitError)}
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
            visitIsCompleted={
              visitIsCompleted ? VisitStatus.COMPLETADA : undefined
            }
            readOnly={readOnly}
          />
        </form>
      </Form>
    </div>
  );
}
