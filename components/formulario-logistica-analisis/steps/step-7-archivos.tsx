import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { TipoArchivo } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { FileUploadProps, ArchivoSubido } from "../types";
import { useI18n } from "@/lib/i18n/context";

import {
  Upload,
  Camera,
  Video,
  FolderOpen,
  Check,
  EyeIcon,
  Trash2,
  Paperclip,
} from "lucide-react";

import {
  getFileIcon,
  formatFileSize,
  MAX_FILES,
  ALL_ALLOWED_TYPES,
} from "../utils/file-utils";

// ==================== SECTION HEADER ====================
function SectionHeader({
  icon: Icon,
  title,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="hidden md:flex items-center justify-between pb-2 border-b mb-2">
      <div className="flex items-center gap-2">
        <div className="size-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="size-3 text-primary" />
        </div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>
      {badge}
    </div>
  );
}

/**
 * Step 7: File Attachments
 * Fields: archivos (images, videos, documents)
 */
export function Step7Content({
  form,
  customerId,
  isUploading,
  uploadProgress,
  uploadingFiles,
  deletingFileId,
  onFileSelect,
  onRemoveFile,
  onDrop,
  fileInputRef,
  cameraPhotoRef,
  cameraVideoRef,
}: FileUploadProps) {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const archivos = form.watch("archivos") || [];

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <SectionHeader
        icon={Paperclip}
        title={t("forms.logistica.steps.files.title")}
        badge={
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {archivos.length}/{MAX_FILES}
          </span>
        }
      />

      {/* Hidden inputs */}
      <input
        ref={cameraPhotoRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileSelect}
        className="hidden"
        disabled={isUploading || archivos.length >= MAX_FILES}
      />
      <input
        ref={cameraVideoRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={onFileSelect}
        className="hidden"
        disabled={isUploading || archivos.length >= MAX_FILES}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALL_ALLOWED_TYPES.join(",")}
        onChange={onFileSelect}
        className="hidden"
        disabled={isUploading || archivos.length >= MAX_FILES}
      />

      {/* ===== MOBILE: Action buttons only ===== */}
      <div className="md:hidden space-y-3">
        {/* Upload buttons grid */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 h-auto py-3 rounded-xl border-2",
              "transition-all duration-200 hover:border-blue-500/50 hover:bg-blue-500/5",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            onClick={() => cameraPhotoRef.current?.click()}
            disabled={isUploading || archivos.length >= MAX_FILES}
          >
            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Camera className="size-4 text-blue-600" />
            </div>
            <span className="text-xs font-medium">
              {t("forms.files.takePhoto").split(" ")[1] ||
                t("forms.files.takePhoto")}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 h-auto py-3 rounded-xl border-2",
              "transition-all duration-200 hover:border-violet-500/50 hover:bg-violet-500/5",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            onClick={() => cameraVideoRef.current?.click()}
            disabled={isUploading || archivos.length >= MAX_FILES}
          >
            <div className="size-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Video className="size-4 text-violet-600" />
            </div>
            <span className="text-xs font-medium">
              {t("forms.files.recordVideo").split(" ")[1] ||
                t("forms.files.recordVideo")}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 h-auto py-3 rounded-xl border-2",
              "transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/5",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || archivos.length >= MAX_FILES}
          >
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <FolderOpen className="size-4 text-amber-600" />
            </div>
            <span className="text-xs font-medium">
              {t("forms.files.browse")}
            </span>
          </Button>
        </div>

        {/* Mobile upload progress */}
        {isUploading && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <Spinner variant="bars" className="text-primary size-3.5" />
            <div className="flex-1 space-y-1.5">
              <p className="text-xs font-medium">
                {t("forms.files.uploading")}
              </p>
              <Progress value={uploadProgress.total || 0} className="h-1.5" />
            </div>
            <span className="text-xs font-medium text-primary">
              {uploadProgress.total || 0}%
            </span>
          </div>
        )}

        {/* Mobile file limits info */}
        <p className="text-[10px] text-center text-muted-foreground text-balance">
          {t("forms.files.limits", { max: MAX_FILES })}
        </p>
      </div>

      {/* ===== DESKTOP: Drop zone + inline buttons ===== */}
      <div className="hidden md:block space-y-3">
        {/* Inline action buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center gap-2 h-9 px-3 rounded-lg border",
              "transition-all duration-200 hover:border-blue-500/50 hover:bg-blue-500/5",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            onClick={() => cameraPhotoRef.current?.click()}
            disabled={isUploading || archivos.length >= MAX_FILES}
          >
            <Camera className="size-4 text-blue-600" />
            <span className="text-xs font-medium">
              {t("forms.files.takePhoto")}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center gap-2 h-9 px-3 rounded-lg border",
              "transition-all duration-200 hover:border-violet-500/50 hover:bg-violet-500/5",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            onClick={() => cameraVideoRef.current?.click()}
            disabled={isUploading || archivos.length >= MAX_FILES}
          >
            <Video className="size-4 text-violet-600" />
            <span className="text-xs font-medium">
              {t("forms.files.recordVideo")}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center gap-2 h-9 px-3 rounded-lg border",
              "transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/5",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || archivos.length >= MAX_FILES}
          >
            <FolderOpen className="size-4 text-amber-600" />
            <span className="text-xs font-medium">
              {t("forms.files.browse")}
            </span>
          </Button>
        </div>

        {/* Drop Zone */}
        <div
          className={cn(
            "relative rounded-xl transition-all duration-300 overflow-hidden cursor-pointer",
            "border-2 border-dashed",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01] shadow-md shadow-primary/10"
              : "border-border hover:border-primary/40 hover:bg-muted/20",
            isUploading && "pointer-events-none opacity-70",
            archivos.length >= MAX_FILES &&
              "opacity-50 pointer-events-none cursor-not-allowed"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            setIsDragging(false);
            onDrop(e);
          }}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <div className="py-6 px-4">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              {isUploading ? (
                <div className="flex justify-center items-center gap-4">
                  <div className="text-left space-y-1">
                    <Spinner
                      variant="bars"
                      className="text-primary size-3 inline mr-2"
                    />
                    <p className="text-xs font-medium inline">
                      {t("forms.files.uploading")}
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={uploadProgress.total || 0}
                        className="h-1.5 w-40"
                      />
                      <span className="text-xs text-muted-foreground">
                        {uploadProgress.total || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "size-12 rounded-xl flex items-center justify-center transition-all duration-300",
                      isDragging ? "bg-primary/15 scale-110" : "bg-muted/50"
                    )}
                  >
                    <Upload
                      className={cn(
                        "size-6 transition-all duration-300",
                        isDragging ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {isDragging
                        ? t("forms.files.dropHere")
                        : t("forms.files.dragDrop")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("forms.files.orClick")}
                    </p>
                  </div>

                  {/* File type limits */}
                  <div className="flex flex-wrap gap-2 justify-center pt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Camera className="size-3" />{" "}
                      {t("forms.files.limits.images")}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      <Video className="size-3" />{" "}
                      {t("forms.files.limits.videos")}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <FolderOpen className="size-3" />{" "}
                      {t("forms.files.limits.docs")}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== UPLOADED FILES LIST (shared) ===== */}
      {archivos.length > 0 && (
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Check className="size-3.5 text-green-500" />
              {t("forms.files.uploadedFiles")}
            </p>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {archivos.length}/{MAX_FILES}
            </span>
          </div>

          {/* Files grid */}
          <div className="space-y-1.5">
            {archivos.map((archivo: ArchivoSubido) => {
              const IconComponent = getFileIcon(archivo.tipoArchivo);
              const isDeleting = deletingFileId === archivo.cloudinaryId;

              return (
                <div
                  key={archivo.cloudinaryId}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 p-2 rounded-lg border bg-card",
                    "transition-all duration-200 group",
                    "hover:border-primary/20 hover:bg-accent/30",
                    isDeleting && "opacity-50"
                  )}
                >
                  {/* Thumbnail */}
                  {archivo.tipoArchivo === TipoArchivo.IMAGEN ? (
                    <div
                      className="size-10 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer ring-1 ring-border hover:ring-primary/50 transition-all"
                      onClick={() =>
                        window.open(archivo.cloudinaryUrl, "_blank")
                      }
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
                        "size-10 rounded-lg flex items-center justify-center shrink-0",
                        archivo.tipoArchivo === TipoArchivo.VIDEO
                          ? "bg-violet-500/10 border border-violet-500/20"
                          : "bg-amber-500/10 border border-amber-500/20"
                      )}
                    >
                      <IconComponent
                        className={cn(
                          "size-5",
                          archivo.tipoArchivo === TipoArchivo.VIDEO
                            ? "text-violet-600"
                            : "text-amber-600"
                        )}
                      />
                    </div>
                  )}

                  {/* File info */}
                  <div className="flex-1 max-w-[150px] md:max-w-sm">
                    <p
                      className="text-xs font-medium truncate"
                      title={archivo.nombre}
                    >
                      {archivo.nombre}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span>{formatFileSize(archivo.tamanio)}</span>
                      <span className="text-border">•</span>
                      <span className="uppercase">{archivo.formato}</span>
                      {archivo.ancho && archivo.alto && (
                        <span className="hidden sm:inline">
                          • {archivo.ancho}×{archivo.alto}px
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-1 flex justify-end items-center shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-md opacity-70 hover:opacity-100 hover:bg-accent"
                      title={t("forms.files.viewFile")}
                      disabled={isUploading || isDeleting}
                      onClick={() =>
                        window.open(archivo.cloudinaryUrl, "_blank")
                      }
                    >
                      <EyeIcon className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-md opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== EMPTY STATE ===== */}
      {archivos.length === 0 && !isUploading && (
        <p className="text-xs text-center text-muted-foreground py-2 text-balance italic">
          {t("forms.files.noFiles")}
        </p>
      )}
    </div>
  );
}

// Alias export para compatibilidad con el nuevo flujo de steps
export { Step7Content as Step6Content };
