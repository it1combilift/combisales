"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { TipoArchivo } from "@prisma/client";
import { Check, EyeIcon, Trash2, Lock } from "lucide-react";
import { MAX_FILES } from "@/constants/constants";
import { FILE_TYPE_CONFIG } from "@/components/attachments-gallery";

// ==================== TYPES ====================
export interface UploadedFileItem {
  nombre: string;
  tipoArchivo: TipoArchivo;
  mimeType: string;
  tamanio: number;
  cloudinaryId: string;
  cloudinaryUrl: string;
  cloudinaryType: string;
  ancho?: number | null;
  alto?: number | null;
  duracion?: number | null;
  formato: string;
  // Flag para indicar si es un archivo del original (read-only)
  isFromOriginal?: boolean;
}

export interface UploadedFilesListProps {
  archivos: UploadedFileItem[];
  deletingFileId: string | null;
  isUploading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRemoveFile: (archivo: any) => void;
  maxFiles?: number;
  showHeader?: boolean;
  className?: string;
  // Archivos de la visita original (para clones - solo lectura)
  originalArchivos?: UploadedFileItem[];
  // Si es true, todos los archivos son solo lectura
  readOnly?: boolean;
}

// ==================== HELPER FUNCTIONS ====================
const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

const getFileConfig = (archivo: UploadedFileItem) => {
  const ext = getFileExtension(archivo.nombre || archivo.formato || "");
  const defaultConfig = {
    icon: FILE_TYPE_CONFIG.txt?.icon || (() => null),
    color: "text-muted-foreground",
    bg: "bg-muted",
    labelKey: "attachments.fileTypes.archivo",
  };
  return (
    FILE_TYPE_CONFIG[ext as keyof typeof FILE_TYPE_CONFIG] || defaultConfig
  );
};

// ==================== COMPONENT ====================
export function UploadedFilesList({
  archivos,
  deletingFileId,
  isUploading,
  onRemoveFile,
  maxFiles = MAX_FILES,
  showHeader = true,
  className,
  originalArchivos = [],
  readOnly = false,
}: UploadedFilesListProps) {
  const { t } = useI18n();

  // Combine original files (read-only) with clone's own files
  const allArchivos = [
    ...originalArchivos.map((a) => ({ ...a, isFromOriginal: true })),
    ...archivos.filter((a) => !a.isFromOriginal), // Only clone's own files
  ];

  if (allArchivos.length === 0) {
    return null;
  }

  const hasOriginalFiles = originalArchivos.length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Check className="size-3.5 text-green-500" />
            {t("forms.files.uploadedFiles")}
          </p>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {allArchivos.length}/{maxFiles}
          </span>
        </div>
      )}

      {/* Original files section header (if there are original files) */}
      {hasOriginalFiles && (
        <div className="flex items-center gap-2 pt-1">
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Lock className="size-3" />
            {t("forms.files.originalFiles")}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            ({originalArchivos.length})
          </span>
        </div>
      )}

      {/* Scrollable Files Container */}
      <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {allArchivos.map((archivo) => {
          const config = getFileConfig(archivo);
          const IconComponent = config.icon;
          const isDeleting = deletingFileId === archivo.cloudinaryId;
          const isImage = archivo.tipoArchivo === TipoArchivo.IMAGEN;
          const isVideo = archivo.tipoArchivo === TipoArchivo.VIDEO;
          const isOriginal = archivo.isFromOriginal === true;
          const canDelete = !readOnly && !isOriginal;

          return (
            <div
              key={archivo.cloudinaryId}
              className={cn(
                "flex items-center gap-2 sm:gap-3 p-2 rounded-lg border bg-card",
                "transition-all duration-200 group",
                "hover:border-primary/20 hover:bg-accent/30",
                isDeleting && "opacity-50 pointer-events-none",
                isOriginal && "border-dashed bg-muted/30",
              )}
            >
              {/* Original file indicator */}
              {isOriginal && (
                <div className="absolute -top-1 -right-1">
                  <Lock className="size-3 text-muted-foreground" />
                </div>
              )}

              {/* Thumbnail - Uses attachments-gallery styling */}
              {isImage ? (
                <div
                  className="size-10 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer ring-1 ring-border hover:ring-primary/50 transition-all"
                  onClick={() => window.open(archivo.cloudinaryUrl, "_blank")}
                >
                  <Image
                    src={archivo.cloudinaryUrl}
                    alt={archivo.nombre}
                    className="w-full h-full object-cover"
                    width={40}
                    height={40}
                    loading="lazy"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    "size-10 rounded-lg flex items-center justify-center shrink-0 cursor-pointer",
                    "ring-1 ring-border hover:ring-primary/50 transition-all",
                    config.bg,
                  )}
                  onClick={() => window.open(archivo.cloudinaryUrl, "_blank")}
                >
                  <IconComponent className={cn("size-5", config.color)} />
                </div>
              )}

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p
                    className="text-xs font-medium truncate"
                    title={archivo.nombre}
                  >
                    {archivo.nombre}
                  </p>
                  {isOriginal && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-4"
                    >
                      {t("forms.files.original")}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className={cn("font-medium uppercase", config.color)}>
                    {archivo.formato}
                  </span>
                  <span className="text-border">•</span>
                  <span>{formatFileSize(archivo.tamanio)}</span>
                  {archivo.ancho && archivo.alto && (
                    <span className="hidden sm:inline">
                      • {archivo.ancho}×{archivo.alto}px
                    </span>
                  )}
                  {isVideo && archivo.duracion && (
                    <span className="hidden sm:inline">
                      • {Math.round(archivo.duracion)}s
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-md opacity-70 hover:opacity-100 hover:bg-accent"
                  title={t("forms.files.viewFile")}
                  disabled={isUploading || isDeleting}
                  onClick={() => window.open(archivo.cloudinaryUrl, "_blank")}
                >
                  <EyeIcon className="size-3.5" />
                </Button>
                {canDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-md opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    title={t("forms.files.deleteFile")}
                    onClick={() => onRemoveFile(archivo)}
                    disabled={isUploading || deletingFileId !== null}
                  >
                    {isDeleting ? (
                      <Spinner variant="ellipsis" size={12} />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UploadedFilesList;
