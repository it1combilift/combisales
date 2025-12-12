import { UseFormReturn } from "react-hook-form";
import { Customer } from "@/interfaces/visits";
import { FormularioStraddleCarrierSchema } from "./schemas";
import { RefObject } from "react";

// ==================== FORM PROPS ====================
export interface FormularioStraddleCarrierAnalisisProps {
  customer: Customer;
  onBack: () => void;
  onSuccess: () => void;
  existingVisit?: any;
}

// ==================== ARCHIVO TYPES ====================
export interface ArchivoSubido {
  nombre: string;
  tipoArchivo: "IMAGEN" | "VIDEO" | "DOCUMENTO";
  mimeType: string;
  tamanio: number;
  cloudinaryId: string;
  cloudinaryUrl: string;
  cloudinaryType: string;
  ancho?: number;
  alto?: number;
  duracion?: number;
  formato: string;
}

// ==================== CONTAINER SIZE ====================
export interface ContainerSizeData {
  selected: boolean;
  cantidad: number | null;
}

export interface ContenedoresTamanios {
  size20ft: ContainerSizeData;
  size30ft: ContainerSizeData;
  size40ft: ContainerSizeData;
  size45ft: ContainerSizeData;
  size53ft: ContainerSizeData;
}

// ==================== STEP COMPONENT PROPS ====================
export interface StepContentProps {
  form: UseFormReturn<FormularioStraddleCarrierSchema>;
  isEditing?: boolean;
}

// ==================== FIELD WRAPPER PROPS ====================
export interface FieldWrapperProps {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

// ==================== FILE UPLOAD PROPS ====================
export interface FileUploadProps {
  form: UseFormReturn<FormularioStraddleCarrierSchema>;
  customerId: string;
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  uploadingFiles: File[];
  deletingFileId: string | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (archivo: ArchivoSubido) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  cameraPhotoRef: RefObject<HTMLInputElement | null>;
  cameraVideoRef: RefObject<HTMLInputElement | null>;
}

// ==================== FORM HEADER PROPS ====================
export interface FormHeaderProps {
  currentStep: number;
  currentStepConfig: any;
  progress: number;
  completedSteps: Set<number>;
  onGoToStep: (step: number) => void;
  shouldSkipStep3?: boolean;
  shouldSkipStep4?: boolean;
}

// ==================== FORM NAVIGATION PROPS ====================
export interface FormNavigationProps {
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isEditing: boolean;
  allStepsComplete: boolean;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  isSavingChanges: boolean;
  isUploading: boolean;
  deletingFileId: string | null;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onSaveChanges: () => void;
}

// ==================== SAVE VISIT PARAMS ====================
export type SaveType = "submit" | "draft" | "changes";

export interface SaveVisitParams {
  saveType: SaveType;
}
