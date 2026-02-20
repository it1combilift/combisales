"use client";

import axios from "axios";
import Image from "next/image";
import { useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Camera, X, ImageIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { InspectionPhotoType } from "@prisma/client";
import { INSPECTION_PHOTO_TYPES } from "@/interfaces/inspection";

import {
  InspectionFormSchema,
  InspectionPhotoSchema,
} from "@/schemas/inspections";

interface PhotosStepProps {
  form: UseFormReturn<InspectionFormSchema>;
}

export function PhotosStep({ form }: PhotosStepProps) {
  const { t } = useTranslation();
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;
  const photos = watch("photos") || [];
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoType, setActivePhotoType] =
    useState<InspectionPhotoType | null>(null);

  const maxPhotos = INSPECTION_PHOTO_TYPES.length;

  const getPhotoForType = (
    type: InspectionPhotoType,
  ): InspectionPhotoSchema | undefined => {
    return photos.find((p) => p.photoType === type);
  };

  const handlePhotoCapture = (type: InspectionPhotoType) => {
    setActivePhotoType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoType) return;

    setUploadingType(activePhotoType);

    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", "combisales/inspections/photos");

      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadResult = response.data;
      if (!uploadResult.success || !uploadResult.files?.length) {
        throw new Error(uploadResult.errors?.[0] || "Upload failed");
      }

      const uploaded = uploadResult.files[0];

      const newPhoto: InspectionPhotoSchema = {
        photoType: activePhotoType,
        cloudinaryId: uploaded.cloudinaryId,
        cloudinaryUrl: uploaded.cloudinaryUrl,
        cloudinaryType: uploaded.cloudinaryType,
        format: uploaded.formato || file.type.split("/")[1] || "jpg",
        width: uploaded.ancho,
        height: uploaded.alto,
        size: uploaded.tamanio || file.size,
      };

      // Replace existing photo of same type or add new
      const currentPhotos = form.getValues("photos") || [];
      const filtered = currentPhotos.filter(
        (p) => p.photoType !== activePhotoType,
      );
      setValue("photos", [...filtered, newPhoto], { shouldValidate: true });
    } catch (error) {
      console.error("Failed to upload photo:", error);
    } finally {
      setUploadingType(null);
      setActivePhotoType(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (type: InspectionPhotoType) => {
    const currentPhotos = form.getValues("photos") || [];
    const filtered = currentPhotos.filter((p) => p.photoType !== type);
    setValue("photos", filtered, { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-sm text-muted-foreground">
        {t("inspectionsPage.form.photos.description")}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {INSPECTION_PHOTO_TYPES.map(({ type, labelKey }) => {
          const photo = getPhotoForType(type);
          const isUploading = uploadingType === type;
          const isAnyUploading = uploadingType !== null;

          return (
            <div
              key={type}
              className="relative rounded-lg border overflow-hidden"
            >
              {photo ? (
                <div className="relative aspect-video">
                  <Image
                    src={photo.cloudinaryUrl}
                    alt={t(labelKey)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <span className="text-white text-xs font-medium">
                      {t(labelKey)}
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      disabled={isAnyUploading}
                      onClick={() => handleRemovePhoto(type)}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePhotoCapture(type)}
                  disabled={isAnyUploading || photos.length >= maxPhotos}
                  className="w-full aspect-video flex flex-col items-center justify-center gap-2 bg-muted/50 hover:bg-muted transition-colors cursor-pointer rounded-lg border border-dashed border-muted text-center p-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-muted/50"
                >
                  {isUploading ? (
                    <>
                      <Spinner variant="bars" className="size-3.5" />
                      <span className="text-sm text-muted-foreground font-medium animate-pulse">
                        {t("common.uploading")}...
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-center gap-1.5">
                        <Camera className="size-4 text-muted-foreground font-medium" />
                        <span className="text-sm text-muted-foreground font-medium">
                          {t(labelKey)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground/70 text-balance">
                        {t("inspectionsPage.form.photos.takePhoto")}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Photos counter */}
      <div className="flex items-center gap-2 text-sm">
        <ImageIcon className="size-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {photos.length} / {maxPhotos}{" "}
          {t("inspectionsPage.form.photos.uploaded")}
        </span>
      </div>

      {errors.photos && (
        <p className="text-sm text-destructive">
          {typeof errors.photos.message === "string"
            ? errors.photos.message
            : t("inspectionsPage.form.photos.validation.allRequired")}
        </p>
      )}
    </div>
  );
}
