"use client";

import axios from "axios";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { useI18n } from "@/lib/i18n/context";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Trash2, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileImageUploadProps {
  currentImage?: string | null;
  userName?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  disabled?: boolean;
  className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ProfileImageUpload({
  currentImage,
  userName,
  onImageChange,
  disabled = false,
  className,
}: ProfileImageUploadProps) {
  const { t } = useI18n();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Get display image (preview > current)
  const displayImage = previewUrl || currentImage;

  // Get initials for fallback
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Validate file
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return t("users.form.image.invalidType");
      }
      if (file.size > MAX_FILE_SIZE) {
        return t("users.form.image.tooLarge");
      }
      return null;
    },
    [t]
  );

  // Handle file upload
  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);

      // Create preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      try {
        const formData = new FormData();
        formData.append("files", file);
        formData.append("folder", "combisales/avatars");

        const response = await axios.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success && response.data.files?.length > 0) {
          const uploadedUrl = response.data.files[0].cloudinaryUrl;
          onImageChange(uploadedUrl);
          setPreviewUrl(null); // Clear preview, use actual URL
        } else {
          throw new Error(response.data.errors?.[0] || "Upload failed");
        }
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || t("users.form.image.uploadError")
            : t("users.form.image.uploadError")
        );
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [validateFile, onImageChange, t]
  );

  // Handle file input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
      // Reset input
      e.target.value = "";
    },
    [uploadFile]
  );

  // Handle drag events
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isUploading) {
        setIsDragging(true);
      }
    },
    [disabled, isUploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    [disabled, isUploading, uploadFile]
  );

  // Handle remove image
  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
    onImageChange(null);
  }, [onImageChange]);

  return (
    <div className={cn("flex flex-col items-center gap-2 md:gap-3", className)}>
      {/* Avatar with upload overlay */}
      <div
        className={cn(
          "relative group",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Avatar
          className={cn(
            "size-20 sm:size-24 border-2 transition-all duration-200",
            isDragging && "border-primary border-dashed scale-105",
            !isDragging && "border-border",
            isUploading && "animate-pulse"
          )}
        >
          <AvatarImage
            src={displayImage || undefined}
            alt={userName || "User"}
            className="object-cover"
          />
          <AvatarFallback className="text-lg md:text-xl bg-muted">
            {isUploading ? (
              <Spinner className="size-3" variant="bars" />
            ) : (
              getInitials(userName)
            )}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay */}
        {!disabled && !isUploading && (
          <label
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200",
              "bg-black/0 group-hover:bg-black/50",
              isDragging && "bg-black/50"
            )}
          >
            <input
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={handleFileChange}
              className="sr-only"
              disabled={disabled || isUploading}
            />
            <Camera
              className={cn(
                "size-6 text-white transition-opacity duration-200",
                "opacity-0 group-hover:opacity-100",
                isDragging && "opacity-100"
              )}
            />
          </label>
        )}

        {/* Remove button */}
        {displayImage && !disabled && !isUploading && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 size-6 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            title={t("users.form.image.remove")}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {!displayImage && !isUploading && (
          <label>
            <input
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={handleFileChange}
              className="sr-only"
              disabled={disabled || isUploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs cursor-pointer"
              disabled={disabled}
              asChild
            >
              <span>
                <Upload className="size-3.5" />
                {t("users.form.image.upload")}
              </span>
            </Button>
          </label>
        )}

        {displayImage && !isUploading && (
          <>
            <label>
              <input
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                onChange={handleFileChange}
                className="sr-only"
                disabled={disabled || isUploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs cursor-pointer"
                disabled={disabled}
                asChild
              >
                <span>
                  <Camera className="size-3.5" />
                  {t("users.form.image.change")}
                </span>
              </Button>
            </label>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              <Trash2 className="size-3.5" />
              {t("users.form.image.remove")}
            </Button>
          </>
        )}

        {isUploading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner className="size-3" variant="bars" />
            {t("users.form.image.uploading")}
          </div>
        )}
      </div>

      {/* Hint text */}
      {!error && !displayImage && !isUploading && (
        <p className="text-[10px] md:text-xs text-muted-foreground text-center max-w-[180px]">
          {t("users.form.image.hint")}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive text-center flex items-center gap-1">
          <X className="size-3" />
          {error}
        </p>
      )}
    </div>
  );
}
