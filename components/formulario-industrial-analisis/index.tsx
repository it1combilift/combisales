"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import { FormularioIndustrialAnalisisProps } from "./types";
import {
  FormularioIndustrialSchema,
  formularioIndustrialSchema,
} from "./schemas";
import { useIndustrialAnalisisForm } from "./hooks/use-industrial-analisis-form";
import { useFileUploader } from "./hooks/use-file-uploader";
import { FormHeader } from "./ui/form-header";
import { FormNavigation } from "./ui/form-navigation";
import {
  getDefaultValuesForNew,
  getDefaultValuesForEdit,
} from "./utils/default-values";

// Import all steps
import { Step1Content } from "./steps/step-1-datos-cliente";
import { Step2Content } from "./steps/step-2-descripcion-operacion";
import { Step3Content } from "./steps/step-3-datos-aplicacion";
import { Step4Content } from "./steps/step-4-equipos-electricos";
import { Step5Content } from "./steps/step-5-dimensiones-cargas";
import { Step6Content } from "./steps/step-6-especificaciones-pasillo";
import { Step7Content } from "./steps/step-7-archivos";

/**
 * FormularioIndustrialAnalisis - Main Form Component
 *
 * A multi-step form for creating/editing Industrial Analysis visits.
 * Fully modular architecture identical to FormularioCSSAnalisis.
 *
 * Features:
 * - 7-step wizard with free navigation
 * - Real-time validation per step
 * - Conditional fields (electrical equipment)
 * - Dynamic table (load dimensions)
 * - File upload with drag & drop
 * - Responsive design (mobile/tablet/desktop)
 * - Edit/Create modes with draft saving
 */
export default function FormularioIndustrialAnalisis({
  customer,
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
  } = useIndustrialAnalisisForm({
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
