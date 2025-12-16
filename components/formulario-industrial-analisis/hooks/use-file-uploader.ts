import axios from "axios";
import { toast } from "sonner";
import { ArchivoSubido } from "../types";
import { UseFormReturn } from "react-hook-form";
import { MAX_FILES } from "@/constants/constants";
import { getTipoArchivo, isAllowedFileType } from "@/lib/file-utils";
import { useState, useCallback, useRef } from "react";
import { FormularioIndustrialSchema } from "../schemas";
import { UploadedFile } from "@/interfaces/claudinary";

interface UseFileUploaderProps {
  form: UseFormReturn<FormularioIndustrialSchema>;
  customerId: string;
}

export function useFileUploader({ form, customerId }: UseFileUploaderProps) {
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
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      const currentFiles = form.getValues("archivos") || [];

      if (currentFiles.length + files.length > MAX_FILES) {
        toast.error(`Máximo ${MAX_FILES} archivos permitidos`);
        return;
      }

      // Validate files
      const invalidFiles = files.filter(
        (file) => !isAllowedFileType(file.type)
      );
      if (invalidFiles.length > 0) {
        toast.error(
          `Tipo de archivo no permitido: ${invalidFiles
            .map((f) => f.name)
            .join(", ")}`
        );
        return;
      }

      setIsUploading(true);
      setUploadingFiles(files);

      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("folder", `combisales/visitas/${customerId}`);

        const response = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentComplete = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
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
            })
          );

          form.setValue("archivos", [...currentFiles, ...uploadedFiles], {
            shouldValidate: true,
          });

          toast.success(
            `${uploadedFiles.length} archivo(s) subido(s) exitosamente`
          );
        }
      } catch (error) {
        console.error("Error uploading files:", error);
        toast.error("Error al subir archivos");
      } finally {
        setIsUploading(false);
        setUploadingFiles([]);
        setUploadProgress({});
        if (event.target) event.target.value = "";
      }
    },
    [form, customerId]
  );

  // ==================== FILE REMOVAL ====================
  const handleRemoveFile = useCallback(
    async (archivo: ArchivoSubido) => {
      setDeletingFileId(archivo.cloudinaryId);

      try {
        const currentFiles = form.getValues("archivos") || [];

        await axios.delete(
          `/api/upload/${encodeURIComponent(archivo.cloudinaryId)}?type=${
            archivo.cloudinaryType
          }`
        );

        const updatedFiles = currentFiles.filter(
          (f) => f.cloudinaryId !== archivo.cloudinaryId
        );

        form.setValue("archivos", updatedFiles, { shouldValidate: true });
        toast.success("Archivo eliminado");
      } catch (error) {
        console.error("Error deleting file:", error);
        toast.error("Error al eliminar archivo");
      } finally {
        setDeletingFileId(null);
      }
    },
    [form]
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
