import { UseFormReturn } from "react-hook-form";
import { Customer } from "@/interfaces/visits";
import { FormularioLogisticaSchema } from "./schemas";
import { RefObject } from "react";
import { VisitStatus } from "@prisma/client";

// ==================== FORM PROPS ====================
export interface FormularioLogisticaAnalisisProps {
  customer?: Customer; // Opcional: para visitas de cliente
  zohoTaskId?: string; // Opcional: para visitas de tarea
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
  form: UseFormReturn<FormularioLogisticaSchema>;
}

// ==================== FIELD WRAPPER PROPS ====================
export interface FieldWrapperProps {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

// ==================== FILE UPLOAD PROPS ====================
export interface FileUploadProps {
  form: UseFormReturn<FormularioLogisticaSchema>;
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
  shouldSkipStep4?: () => boolean;
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
  visitIsCompleted?: VisitStatus;
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

// ==================== TIPO OPERACION OPTIONS ====================
export const TIPO_OPERACION_OPTIONS = [
  { value: "almacenamiento", label: "Almacenamiento" },
  { value: "cross-docking", label: "Cross-docking" },
  { value: "picking", label: "Picking" },
  { value: "carga-descarga", label: "Carga/Descarga" },
  { value: "preparacion-pedidos", label: "Preparación de pedidos" },
  { value: "mixto", label: "Mixto" },
];

// ==================== TIPO ESTANTERIAS OPTIONS ====================
export const TIPO_ESTANTERIAS_OPTIONS = [
  { value: "convencional", label: "Convencional" },
  { value: "drive-in", label: "Drive-in" },
  { value: "push-back", label: "Push-back" },
  { value: "dinamica", label: "Dinámica" },
  { value: "cantilever", label: "Cantilever" },
  { value: "movil", label: "Móvil" },
  { value: "otra", label: "Otra" },
];
