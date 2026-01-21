import { UseFormReturn } from "react-hook-form";
import { Customer } from "@/interfaces/visits";
import { FormularioIndustrialSchema } from "./schemas";
import { RefObject } from "react";
import { VisitStatus } from "@prisma/client";

// ==================== FORM PROPS ====================
export interface FormularioIndustrialAnalisisProps {
  customer?: Customer; // Opcional: para visitas de cliente
  zohoTaskId?: string; // Opcional: para visitas de tarea
  onBack: () => void;
  onSuccess: () => void;
  existingVisit?: any;
  // Para visitas creadas por DEALER: vendedor asignado
  assignedSellerId?: string;
  // Archivos de la visita original (para clones - solo lectura)
  originalArchivos?: ArchivoSubido[];
  // Si es true, el formulario es solo lectura (SELLER viendo original)
  readOnly?: boolean;
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

// ==================== CARGA DIMENSIONS ====================
export interface DimensionCarga {
  id: string;
  producto: string;
  largo: number | null;
  fondo: number | null;
  alto: number | null;
  peso: number | null;
  porcentaje: number | null;
}

// ==================== STEP COMPONENT PROPS ====================
export interface StepContentProps {
  form: UseFormReturn<FormularioIndustrialSchema>;
}

// ==================== FIELD WRAPPER PROPS ====================
export interface FieldWrapperProps {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

// ==================== FILE UPLOAD PROPS ====================
export interface FileUploadProps {
  form: UseFormReturn<FormularioIndustrialSchema>;
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
}

// ==================== SAVE VISIT PARAMS ====================
export type SaveType = "submit" | "draft" | "changes";

export interface SaveVisitParams {
  saveType: SaveType;
  visitStatus: "BORRADOR" | "COMPLETADA" | "ENVIADA";
}

// ==================== ALIMENTACION TYPES ====================
export enum TipoAlimentacion {
  ELECTRICO = "ELECTRICO",
  DIESEL = "DIESEL",
  GLP = "GLP",
}

export enum TipoCorriente {
  MONOFASICA = "MONOFASICA",
  TRIFASICA = "TRIFASICA",
}

export const ALIMENTACION_LABELS: Record<TipoAlimentacion, string> = {
  ELECTRICO: "Eléctrico",
  DIESEL: "Diésel",
  GLP: "GLP",
};

export const TIPO_CORRIENTE_LABELS: Record<TipoCorriente, string> = {
  MONOFASICA: "Monofásica",
  TRIFASICA: "Trifásica",
};
