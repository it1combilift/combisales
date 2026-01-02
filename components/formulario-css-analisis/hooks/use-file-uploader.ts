import axios from "axios";
import { toast } from "sonner";
import { ArchivoSubido } from "../types";
import { UseFormReturn } from "react-hook-form";
import { FormularioCSSSchema } from "../schemas";
import { useState, useCallback, useRef } from "react";
import { ALL_ALLOWED_TYPES, MAX_FILES } from "@/constants/constants";

interface UseFileUploaderProps {
  form: UseFormReturn<FormularioCSSSchema>;
  customerId: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function useFileUploader({ form, customerId, t }: UseFileUploaderProps) {
  // ==================== STATE ====================
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
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
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const currentArchivos = form.getValues("archivos") || [];
      const remainingSlots = MAX_FILES - currentArchivos.length;

      if (files.length > remainingSlots) {
        toast.error(
          t("toast.file.onlyCanUpload", { remaining: remainingSlots })
        );
        return;
      }

      const validFiles: File[] = [];
      for (const file of Array.from(files)) {
        if (!ALL_ALLOWED_TYPES.includes(file.type)) {
          toast.error(`${file.name}: ${t("toast.file.typeNotAllowed")}`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      setIsUploading(true);
      setUploadingFiles(validFiles);

      try {
        const formData = new FormData();
        validFiles.forEach((file) => formData.append("files", file));
        formData.append("folder", `combisales/visitas/${customerId}`);

        const response = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress((prev) => ({ ...prev, total: progress }));
            }
          },
        });

        if (response.data.files && response.data.files.length > 0) {
          const newArchivos = [...currentArchivos, ...response.data.files];
          form.setValue("archivos", newArchivos, { shouldValidate: true });
          toast.success(
            t("toast.file.uploadSuccess", { count: response.data.files.length })
          );
        }

        if (response.data.errors && response.data.errors.length > 0) {
          response.data.errors.forEach((error: string) => toast.error(error));
        }
      } catch (error: any) {
        console.error("Error uploading files:", error);
        toast.error(error.response?.data?.error || t("toast.file.uploadError"));
      } finally {
        setIsUploading(false);
        setUploadingFiles([]);
        setUploadProgress({});
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [form, customerId, t]
  );

  // ==================== FILE REMOVAL ====================
  const handleRemoveFile = useCallback(
    async (archivo: ArchivoSubido) => {
      setDeletingFileId(archivo.cloudinaryId);
      try {
        await axios.delete(
          `/api/upload/${encodeURIComponent(archivo.cloudinaryId)}?type=${
            archivo.cloudinaryType
          }`
        );

        const currentArchivos = form.getValues("archivos") || [];
        const newArchivos = currentArchivos.filter(
          (a) => a.cloudinaryId !== archivo.cloudinaryId
        );
        form.setValue("archivos", newArchivos, { shouldValidate: true });
        toast.success(t("toast.file.deleteSuccess"));
      } catch (error) {
        console.error("Error removing file:", error);
        toast.error(t("toast.file.deleteError"));
      } finally {
        setDeletingFileId(null);
      }
    },
    [form, t]
  );

  // ==================== DRAG & DROP ====================
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files && files.length > 0 && fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        Array.from(files).forEach((file) => dataTransfer.items.add(file));
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({
          target: { files: dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    },
    [handleFileSelect]
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
