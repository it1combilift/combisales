import { RefObject } from "react";
import { VisitStatus } from "@prisma/client";
import { Customer } from "@/interfaces/visits";
import { UseFormReturn } from "react-hook-form";
import { FormularioStraddleCarrierSchema } from "./schemas";

// ==================== FORM PROPS ====================
export interface FormularioStraddleCarrierAnalisisProps {
  customer?: Customer; // Opcional: para visitas de cliente
  zohoTaskId?: string; // Opcional: para visitas de tarea
  onBack: () => void;
  onSuccess: () => void;
  existingVisit?: any;
  assignedSellerId?: string;
  originalArchivos?: ArchivoSubido[];
  readOnly?: boolean;
  // Si es true, habilita el paso de datos del cliente (para flujo DEALER)
  enableCustomerEntry?: boolean;
  // Callback para notificar cambios no guardados al componente padre
  onDirtyChange?: (isDirty: boolean) => void;
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
  ancho?: number | null;
  alto?: number | null;
  duracion?: number | null;
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
  // Archivos de la visita original (para clones - solo lectura, no eliminables)
  originalArchivos?: ArchivoSubido[];
  // Si es true, el formulario es solo lectura
  readOnly?: boolean;
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
  onSaveDraft?: () => void;
  onSaveChanges?: () => void;
  visitIsCompleted?: VisitStatus;
  /** When true, hides all action buttons (Save, Submit, etc.) - view mode only */
  readOnly?: boolean;
  /** Total number of steps (dynamic based on enableCustomerEntry) */
  totalSteps?: number;
}

// ==================== SAVE VISIT PARAMS ====================
export type SaveType = "submit" | "draft" | "changes";

export interface SaveVisitParams {
  saveType: SaveType;
}
