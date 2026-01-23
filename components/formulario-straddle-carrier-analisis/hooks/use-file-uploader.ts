import axios from "axios";
import { toast } from "sonner";
import { ArchivoSubido } from "../types";
import { UseFormReturn } from "react-hook-form";
import { MAX_FILES } from "@/constants/constants";
import { getTipoArchivo, isAllowedFileType } from "@/lib/file-utils";
import { useState, useCallback, useRef } from "react";
import { FormularioStraddleCarrierSchema } from "../schemas";
import { UploadedFile } from "@/interfaces/claudinary";

interface UseFileUploaderProps {
  form: UseFormReturn<FormularioStraddleCarrierSchema>;
  customerId?: string;
  formularioId?: string; // ID of the specific formulario (for file deletion isolation)
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function useFileUploader({
  form,
  customerId,
  formularioId,
  t,
}: UseFileUploaderProps) {
  // ==================== STATE ====================
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [isUploading, setIsUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  // ==================== REFS ====================
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraPhotoRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLInputElement>(null);

  // ==================== FILE SELECTION ====================
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      const currentFiles = form.getValues("archivos") || [];

      if (currentFiles.length + files.length > MAX_FILES) {
        toast.error(t("toast.file.maxFilesExceeded", { max: MAX_FILES }));
        return;
      }

      // Validate files
      const invalidFiles = files.filter(
        (file) => !isAllowedFileType(file.type),
      );
      if (invalidFiles.length > 0) {
        toast.error(
          t("toast.file.filesTypeNotAllowed", {
            files: invalidFiles.map((f) => f.name).join(", "),
          }),
        );
        return;
      }

      setIsUploading(true);
      setUploadingFiles(files);

      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        const uploadFolder = customerId
          ? `combisales/visitas/${customerId}`
          : "combisales/visitas/general";
        formData.append("folder", uploadFolder);

        const response = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentComplete = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              files.forEach((file) => {
                setUploadProgress((prev) => ({
                  ...prev,
                  [file.name]: percentComplete,
                }));
              });
            }
          },
        });

        if (response.data.success && response.data.files) {
          const uploadedFiles = response.data.files.map(
            (file: UploadedFile) => ({
              nombre: file.nombre,
              tipoArchivo: getTipoArchivo(file.mimeType),
              mimeType: file.mimeType,
              tamanio: file.tamanio,
              cloudinaryId: file.cloudinaryId,
              cloudinaryUrl: file.cloudinaryUrl,
              cloudinaryType: file.cloudinaryType,
              ancho: file.ancho,
              alto: file.alto,
              duracion: file.duracion,
              formato: file.formato,
            }),
          );

          form.setValue("archivos", [...currentFiles, ...uploadedFiles], {
            shouldValidate: true,
          });

          toast.success(
            t("toast.file.uploadSuccess", { count: uploadedFiles.length }),
          );
        }
      } catch (error) {
        console.error("Error uploading files:", error);
        toast.error(t("toast.file.uploadError"));
      } finally {
        setIsUploading(false);
        setUploadingFiles([]);
        setUploadProgress({});
        if (event.target) event.target.value = "";
      }
    },
    [form, customerId, t],
  );

  // ==================== FILE REMOVAL ====================
  const handleRemoveFile = useCallback(
    async (archivo: ArchivoSubido) => {
      setDeletingFileId(archivo.cloudinaryId);

      try {
        const currentFiles = form.getValues("archivos") || [];

        // Use query params to properly handle cloudinaryId with slashes
        const params = new URLSearchParams({
          publicId: archivo.cloudinaryId,
          type: archivo.cloudinaryType,
        });
        await axios.delete(`/api/upload/delete?${params.toString()}`);

        const updatedFiles = currentFiles.filter(
          (f) => f.cloudinaryId !== archivo.cloudinaryId,
        );

        form.setValue("archivos", updatedFiles, { shouldValidate: true });
        toast.success(t("toast.file.deleteSuccess"));
      } catch (error) {
        console.error("Error deleting file:", error);
        toast.error(t("toast.file.deleteError"));
      } finally {
        setDeletingFileId(null);
      }
    },
    [form, t, formularioId],
  );

  // ==================== DRAG & DROP ====================
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);

      if (files.length > 0 && fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        files.forEach((file) => dataTransfer.items.add(file));
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({
          target: fileInputRef.current,
        } as React.ChangeEvent<HTMLInputElement>);
      }
    },
    [handleFileSelect],
  );

  return {
    // State
    uploadingFiles,
    uploadProgress,
    isUploading,
    deletingFileId,

    // Refs
    fileInputRef,
    cameraPhotoRef,
    cameraVideoRef,

    // Actions
    handleFileSelect,
    handleRemoveFile,
    handleDrop,
  };
}
