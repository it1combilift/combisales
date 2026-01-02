"use client";

import Image from "next/image";
import type React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui/spinner";
import { TipoArchivo } from "@prisma/client";
import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  ImageIcon,
  Video,
  FileText,
  File,
  Download,
  ChevronLeft,
  ChevronRight,
  Play,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Presentation,
  Music,
  Grid3X3,
  LayoutList,
  Paperclip,
  Eye,
  Maximize2,
  X,
} from "lucide-react";

export { TipoArchivo };

// ==================== TYPES ====================
export interface Archivo {
  nombre: string;
  cloudinaryUrl: string;
  cloudinaryId?: string;
  tipoArchivo: TipoArchivo;
  formato?: string;
  tamanio?: number;
}

interface AttachmentsGalleryProps {
  archivos: Archivo[];
  className?: string;
  title?: string;
  showHeader?: boolean;
  compact?: boolean;
}

// ==================== FILE TYPE CONFIGURATION ====================
const FILE_TYPE_CONFIG = {
  // Images
  jpg: {
    icon: ImageIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    labelKey: "attachments.fileTypes.jpg",
  },
  jpeg: {
    icon: ImageIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    labelKey: "attachments.fileTypes.jpeg",
  },
  png: {
    icon: ImageIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    labelKey: "attachments.fileTypes.png",
  },
  gif: {
    icon: ImageIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    labelKey: "attachments.fileTypes.gif",
  },
  webp: {
    icon: ImageIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    labelKey: "attachments.fileTypes.webp",
  },
  svg: {
    icon: ImageIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    labelKey: "attachments.fileTypes.svg",
  },
  heic: {
    icon: ImageIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    labelKey: "attachments.fileTypes.heic",
  },
  heif: {
    icon: ImageIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    labelKey: "attachments.fileTypes.heif",
  },
  // Videos
  mp4: {
    icon: Video,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    labelKey: "attachments.fileTypes.mp4",
  },
  webm: {
    icon: Video,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    labelKey: "attachments.fileTypes.webm",
  },
  mov: {
    icon: Video,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    labelKey: "attachments.fileTypes.mov",
  },
  avi: {
    icon: Video,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    labelKey: "attachments.fileTypes.avi",
  },
  wmv: {
    icon: Video,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    labelKey: "attachments.fileTypes.wmv",
  },
  // Documents
  pdf: {
    icon: FileText,
    color: "text-red-500",
    bg: "bg-red-500/10",
    labelKey: "attachments.fileTypes.pdf",
  },
  doc: {
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-600/10",
    labelKey: "attachments.fileTypes.word",
  },
  docx: {
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-600/10",
    labelKey: "attachments.fileTypes.word",
  },
  xls: {
    icon: FileSpreadsheet,
    color: "text-green-600",
    bg: "bg-green-600/10",
    labelKey: "attachments.fileTypes.excel",
  },
  xlsx: {
    icon: FileSpreadsheet,
    color: "text-green-600",
    bg: "bg-green-600/10",
    labelKey: "attachments.fileTypes.excel",
  },
  ppt: {
    icon: Presentation,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    labelKey: "attachments.fileTypes.powerpoint",
  },
  pptx: {
    icon: Presentation,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    labelKey: "attachments.fileTypes.powerpoint",
  },
  txt: {
    icon: FileText,
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    labelKey: "attachments.fileTypes.text",
  },
  // Code
  js: {
    icon: FileCode,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    labelKey: "attachments.fileTypes.javascript",
  },
  ts: {
    icon: FileCode,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    labelKey: "attachments.fileTypes.typescript",
  },
  json: {
    icon: FileCode,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    labelKey: "attachments.fileTypes.json",
  },
  // Archives
  zip: {
    icon: FileArchive,
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    labelKey: "attachments.fileTypes.zip",
  },
  rar: {
    icon: FileArchive,
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    labelKey: "attachments.fileTypes.rar",
  },
  // Audio
  mp3: {
    icon: Music,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    labelKey: "attachments.fileTypes.mp3",
  },
  wav: {
    icon: Music,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    labelKey: "attachments.fileTypes.wav",
  },
};

const DEFAULT_FILE_CONFIG = {
  icon: File,
  color: "text-muted-foreground",
  bg: "bg-muted",
  labelKey: "attachments.fileTypes.archivo",
};

// ==================== HELPER FUNCTIONS ====================
const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

const getFileConfig = (archivo: Archivo) => {
  const ext = getFileExtension(archivo.nombre || archivo.formato || "");
  return (
    FILE_TYPE_CONFIG[ext as keyof typeof FILE_TYPE_CONFIG] ||
    DEFAULT_FILE_CONFIG
  );
};

const isPreviewable = (archivo: Archivo): boolean => {
  return (
    archivo.tipoArchivo === TipoArchivo.IMAGEN ||
    archivo.tipoArchivo === TipoArchivo.VIDEO
  );
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// ==================== FILE THUMBNAIL COMPONENT ====================
const FileThumbnail = ({
  archivo,
  isHovered,
  size = "normal",
  t,
}: {
  archivo: Archivo;
  isHovered: boolean;
  size?: "compact" | "normal" | "large";
  t: (key: string) => string;
}) => {
  const config = getFileConfig(archivo);
  const FileIcon = config.icon;
  const isImage = archivo.tipoArchivo === TipoArchivo.IMAGEN;
  const isVideo = archivo.tipoArchivo === TipoArchivo.VIDEO;

  const iconSize =
    size === "compact" ? "size-8" : size === "large" ? "size-16" : "size-12";
  const containerSize =
    size === "compact" ? "size-12" : size === "large" ? "size-20" : "size-14";

  return (
    <div
      className={cn(
        "relative w-full bg-linear-to-br from-muted/40 to-muted/20 flex items-center justify-center overflow-hidden",
        size === "compact" ? "aspect-square" : "aspect-4/3"
      )}
    >
      {isImage ? (
        <>
          <img
            src={archivo.cloudinaryUrl || "/placeholder.svg"}
            alt={archivo.nombre}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              isHovered && "scale-110 brightness-90"
            )}
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </>
      ) : isVideo ? (
        <>
          {/* Video thumbnail background */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              config.bg
            )}
          >
            <div className="relative">
              <div
                className={cn(
                  containerSize,
                  "rounded-2xl flex items-center justify-center",
                  config.bg
                )}
              >
                <FileIcon className={cn(iconSize, config.color)} />
              </div>
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={cn(
                    "rounded-full bg-white/95 dark:bg-black/80 flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/20",
                    size === "compact" ? "size-8" : "size-12"
                  )}
                >
                  <Play
                    className={cn(
                      "text-foreground ml-0.5",
                      size === "compact" ? "size-3.5" : "size-5"
                    )}
                    fill="currentColor"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Document/Other file types
        <div className="flex flex-col items-center justify-center gap-2 p-3">
          <div
            className={cn(
              containerSize,
              "rounded-2xl flex items-center justify-center shadow-sm",
              config.bg
            )}
          >
            <FileIcon className={cn(iconSize, config.color)} />
          </div>
          {size !== "compact" && (
            <Badge
              variant="secondary"
              className="text-[9px] uppercase tracking-wider font-medium px-1.5 py-0.5"
            >
              {t(config.labelKey)}
            </Badge>
          )}
        </div>
      )}

      {/* Hover overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-300",
          isHovered ? "bg-black/50 opacity-100" : "bg-transparent opacity-0"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 transition-all duration-300",
            isHovered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
        >
          {isPreviewable(archivo) ? (
            <div
              className={cn(
                "rounded-full bg-white/95 flex items-center justify-center shadow-lg",
                size === "compact" ? "size-8" : "size-11"
              )}
            >
              <Maximize2
                className={cn(
                  "text-gray-800",
                  size === "compact" ? "size-3.5" : "size-5"
                )}
              />
            </div>
          ) : (
            <div
              className={cn(
                "rounded-full bg-white/95 flex items-center justify-center shadow-lg",
                size === "compact" ? "size-8" : "size-11"
              )}
            >
              <Download
                className={cn(
                  "text-gray-800",
                  size === "compact" ? "size-3.5" : "size-5"
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Type indicator */}
      {size !== "compact" && (isImage || isVideo) && (
        <div className="absolute top-2 left-2">
          <div className="size-6 rounded-md flex items-center justify-center backdrop-blur-sm bg-white/80 dark:bg-black/60 shadow-sm">
            {isImage ? (
              <ImageIcon className="size-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Video className="size-3 text-blue-600 dark:text-blue-400" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== FILE CARD COMPONENT ====================
const FileCard = ({
  archivo,
  index,
  onClick,
  compact = false,
  t,
}: {
  archivo: Archivo;
  index: number;
  onClick: () => void;
  compact?: boolean;
  t: (key: string) => string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = getFileConfig(archivo);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(archivo.cloudinaryUrl, "_blank");
  };

  if (compact) {
    return (
      <div
        className={cn(
          "group relative flex items-center gap-3 p-2.5 rounded-xl border bg-card cursor-pointer",
          "transition-all duration-200 ease-out",
          "hover:shadow-md hover:border-primary/30 hover:bg-accent/50"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {/* Thumbnail */}
        <div className="relative size-12 rounded-lg overflow-hidden shrink-0 border border-border/50">
          <FileThumbnail
            archivo={archivo}
            isHovered={isHovered}
            size="compact"
            t={t}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-foreground">
            {archivo.nombre || `Archivo ${index + 1}`}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-wider",
                config.color
              )}
            >
              {t(config.labelKey)}
            </span>
            {archivo.tamanio && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatFileSize(archivo.tamanio)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className={cn(
            "flex items-center gap-1 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                >
                  <Eye className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{t("attachments.actions.view")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg hover:bg-primary/10"
                  onClick={handleDownload}
                >
                  <Download className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{t("attachments.actions.download")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card overflow-hidden cursor-pointer",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
        "hover:border-primary/30 hover:-translate-y-0.5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <FileThumbnail archivo={archivo} isHovered={isHovered} t={t} />

      {/* Footer */}
      <div className="p-2.5 sm:p-3 border-t bg-card">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs sm:text-sm font-medium truncate text-foreground leading-tight">
                    {archivo.nombre || `Archivo ${index + 1}`}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs break-all">{archivo.nombre}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wider",
                  config.color
                )}
              >
                {t(config.labelKey)}
              </span>
              {archivo.tamanio && (
                <>
                  <span className="text-muted-foreground text-[10px]">·</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatFileSize(archivo.tamanio)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div
            className={cn(
              "flex items-center gap-0.5 transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0 sm:opacity-0"
            )}
          >
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg hover:bg-primary/10"
                    onClick={handleDownload}
                  >
                    <Download className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{t("attachments.actions.download")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== PREVIEW MODAL COMPONENT ====================
const PreviewModal = ({
  archivo,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalCount,
  t,
}: {
  archivo: Archivo | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalCount: number;
  t: (key: string) => string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowLeft" && hasPrevious) onPrevious();
      if (e.key === "ArrowRight" && hasNext) onNext();
      if (e.key === "Escape") onClose();
      if (e.key === " " || e.key === "Enter") setIsImageZoomed((z) => !z);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasPrevious, hasNext, onPrevious, onNext, onClose]);

  // Reset loading state when archivo changes
  useEffect(() => {
    setIsLoading(true);
    setIsImageZoomed(false);
  }, [archivo?.cloudinaryId, archivo?.nombre]);

  // Handle touch swipe for mobile navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0 && hasNext) {
        onNext();
      } else if (diff < 0 && hasPrevious) {
        onPrevious();
      }
    }
    setTouchStart(null);
  };

  if (!archivo) return null;

  const config = getFileConfig(archivo);
  const isImage = archivo.tipoArchivo === TipoArchivo.IMAGEN;
  const isVideo = archivo.tipoArchivo === TipoArchivo.VIDEO;

  const handleDownload = () => {
    if (archivo.cloudinaryUrl) {
      window.open(archivo.cloudinaryUrl, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          // Base styles
          "flex flex-col p-0 gap-0 overflow-hidden",
          // Background with dark overlay for better image viewing
          "bg-background/95 dark:bg-background/98 backdrop-blur-xl",
          "border border-border/50 shadow-2xl",
          // CRITICAL: Always centered using fixed positioning with transform
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          // Mobile: almost fullscreen but with some margin
          "w-[calc(100vw-16px)] h-[calc(70vh-32px)] max-w-[calc(100vw-16px)]",
          "rounded-xl",
          // Tablet (sm): larger with rounded corners
          "sm:w-[95vw] sm:h-[90vh] sm:max-w-4xl sm:rounded-2xl",
          // Desktop (md+): comfortable size
          "md:w-[90vw] md:h-[85vh] md:max-w-5xl",
          // Large screens
          "lg:w-xl lg:h-[50vh]"
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <DialogTitle className="sr-only">
          {t("attachments.actions.view")} - {archivo.nombre}
        </DialogTitle>

        {/* Header - Clean, accessible design */}
        <div
          className={cn(
            "relative z-30 flex items-center justify-between shrink-0",
            "px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3",
            "bg-muted/50 dark:bg-muted/30 border-b border-border/50"
          )}
        >
          {/* File info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "size-8 sm:size-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0",
                config.bg
              )}
            >
              <config.icon className={cn("size-4", config.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-foreground truncate pr-2">
                {archivo.nombre}
              </p>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                <span>{t(config.labelKey)}</span>
                <span className="size-0.5 sm:size-1 rounded-full bg-muted-foreground/50" />
                <span>{formatFileSize(archivo.tamanio)}</span>
                {totalCount > 1 && (
                  <>
                    <span className="size-0.5 sm:size-1 rounded-full bg-muted-foreground/50" />
                    <span className="font-medium">
                      {currentIndex + 1}/{totalCount}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center pr-6">
            {/* Download button */}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={handleDownload}
                  >
                    <Download className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{t("attachments.actions.download")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Main Content Area */}
        <div
          className={cn(
            "relative flex-1 flex items-center justify-center min-h-0 overflow-hidden",
            "bg-black/5 dark:bg-black/20"
          )}
        >
          {/* Loading indicator */}
          {isLoading && isImage && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/50">
              <div className="flex flex-col items-center gap-3">
                <Spinner variant="bars" className="size-5 md:size-6" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("attachments.preview.loadingImage")}
                </p>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {isImage && (
            <Image
              src={archivo.cloudinaryUrl || "/placeholder.svg"}
              alt={archivo.nombre}
              fill
              className={cn(
                "object-center object-contain transition-transform duration-300 ease-out h-full",
                isImageZoomed ? "scale-150 sm:scale-[1.75]" : "scale-100",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 90vw"
              priority
              onLoad={() => setIsLoading(false)}
            />
          )}

          {/* Video Preview */}
          {isVideo && (
            <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-6">
              <video
                src={archivo.cloudinaryUrl}
                controls
                autoPlay
                playsInline
                className={cn(
                  "w-full h-full max-w-full max-h-full object-contain",
                  "rounded-lg sm:rounded-xl",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50"
                )}
              >
                {t("attachments.preview.videoNotSupported")}
              </video>
            </div>
          )}

          {/* Document/Other file Preview */}
          {!isImage && !isVideo && (
            <div className="flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 md:p-8">
              <div
                className={cn(
                  "flex flex-col items-center gap-4 sm:gap-5",
                  "p-6 sm:p-8 rounded-2xl",
                  "bg-muted/50 dark:bg-muted/30",
                  "border border-border/50",
                  "max-w-xs sm:max-w-sm"
                )}
              >
                <div
                  className={cn(
                    "size-10 rounded-xl sm:rounded-2xl",
                    "flex items-center justify-center",
                    config.bg
                  )}
                >
                  <config.icon
                    className={cn("size-6", config.color)}
                  />
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-medium text-foreground break-all px-2 text-balance">
                    {archivo.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground text-balance">
                    {t(config.labelKey)} • {formatFileSize(archivo.tamanio)}
                  </p>
                </div>
                <Button
                  variant="default"
                  size="default"
                  className="mt-2 gap-2"
                  onClick={handleDownload}
                >
                  <Download className="size-4" />
                  {t("attachments.actions.downloadFile")}
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Arrows - Always visible when multiple files */}
          {totalCount > 1 && (
            <>
              {/* Previous arrow */}
              <div
                className={cn(
                  "absolute left-1 sm:left-2 md:left-3 top-1/2 -translate-y-1/2 z-20"
                )}
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className={cn(
                    "size-9 sm:size-10 md:size-11 rounded-full",
                    "bg-background/80 hover:bg-background",
                    "dark:bg-background/60 dark:hover:bg-background/80",
                    "border border-border/50 shadow-lg",
                    "backdrop-blur-sm",
                    "transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    !hasPrevious && "opacity-30 pointer-events-none"
                  )}
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                >
                  <ChevronLeft className="size-5 sm:size-5.5" />
                </Button>
              </div>

              {/* Next arrow */}
              <div
                className={cn(
                  "absolute right-1 sm:right-2 md:right-3 top-1/2 -translate-y-1/2 z-20"
                )}
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className={cn(
                    "size-9 sm:size-10 md:size-11 rounded-full",
                    "bg-background/80 hover:bg-background",
                    "dark:bg-background/60 dark:hover:bg-background/80",
                    "border border-border/50 shadow-lg",
                    "backdrop-blur-sm",
                    "transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    !hasNext && "opacity-30 pointer-events-none"
                  )}
                  onClick={onNext}
                  disabled={!hasNext}
                >
                  <ChevronRight className="size-5 sm:size-5.5" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer - Navigation dots and keyboard hints */}
        {totalCount > 1 && (
          <div
            className={cn(
              "relative z-30 shrink-0",
              "px-3 py-2 sm:px-4 sm:py-2.5",
              "bg-muted/50 dark:bg-muted/30 border-t border-border/50"
            )}
          >
            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {totalCount <= 10 ? (
                // Show all dots if 10 or fewer
                Array.from({ length: totalCount }).map((_, i) => (
                  <button
                    key={i}
                    className={cn(
                      "transition-all duration-200 rounded-full",
                      i === currentIndex
                        ? "bg-primary w-5 sm:w-6 h-2 sm:h-2.5"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50 size-2 sm:size-2.5"
                    )}
                    onClick={() => {
                      const diff = i - currentIndex;
                      if (diff > 0) {
                        for (let j = 0; j < diff; j++) onNext();
                      } else {
                        for (let j = 0; j < Math.abs(diff); j++) onPrevious();
                      }
                    }}
                    aria-label={`Ir al archivo ${i + 1}`}
                  />
                ))
              ) : (
                // Show condensed dots if more than 10
                <>
                  <button
                    className={cn(
                      "transition-all duration-200 rounded-full",
                      currentIndex === 0
                        ? "bg-primary w-5 h-2"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50 size-2"
                    )}
                    onClick={() => {
                      for (let j = 0; j < currentIndex; j++) onPrevious();
                    }}
                    aria-label="Ir al primer archivo"
                  />

                  {currentIndex > 2 && (
                    <span className="text-muted-foreground/60 text-xs px-1">
                      •••
                    </span>
                  )}

                  {Array.from({ length: 5 }).map((_, i) => {
                    const idx = Math.max(1, currentIndex - 2) + i;
                    if (idx >= totalCount - 1 || idx <= 0) return null;
                    return (
                      <button
                        key={idx}
                        className={cn(
                          "transition-all duration-200 rounded-full",
                          idx === currentIndex
                            ? "bg-primary w-5 h-2"
                            : "bg-muted-foreground/30 hover:bg-muted-foreground/50 size-2"
                        )}
                        onClick={() => {
                          const diff = idx - currentIndex;
                          if (diff > 0) {
                            for (let j = 0; j < diff; j++) onNext();
                          } else {
                            for (let j = 0; j < Math.abs(diff); j++)
                              onPrevious();
                          }
                        }}
                        aria-label={`Ir al archivo ${idx + 1}`}
                      />
                    );
                  })}

                  {currentIndex < totalCount - 3 && (
                    <span className="text-muted-foreground/60 text-xs px-1">
                      •••
                    </span>
                  )}

                  <button
                    className={cn(
                      "transition-all duration-200 rounded-full",
                      currentIndex === totalCount - 1
                        ? "bg-primary w-5 h-2"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50 size-2"
                    )}
                    onClick={() => {
                      for (let j = currentIndex; j < totalCount - 1; j++)
                        onNext();
                    }}
                    aria-label="Ir al último archivo"
                  />
                </>
              )}
            </div>

            {/* Keyboard hints - desktop only */}
            <div className="hidden md:flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[9px]">
                  ←
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[9px]">
                  →
                </kbd>
                <span className="ml-1">{t("attachments.actions.navigate")}</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[9px]">
                  Esc
                </kbd>
                <span className="ml-1">{t("attachments.actions.close")}</span>
              </span>
              {isImage && (
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[9px]">
                    Click
                  </kbd>
                  <span className="ml-1">{t("attachments.actions.zoom")}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Single file footer - minimal */}
        {totalCount === 1 && (
          <div
            className={cn(
              "relative z-30 shrink-0",
              "px-3 py-1.5 sm:px-4 sm:py-2",
              "bg-muted/30 dark:bg-muted/20 border-t border-border/30"
            )}
          >
            <div className="hidden md:flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[9px]">
                  Esc
                </kbd>
                <span className="ml-1">{t("attachments.actions.close")}</span>
              </span>
              {isImage && (
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[9px]">
                    Click
                  </kbd>
                  <span className="ml-1">{t("attachments.actions.zoom")}</span>
                </span>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ==================== MAIN COMPONENT ====================
export const AttachmentsGallery = ({
  archivos,
  className,
  title,
  showHeader = true,
  compact = false,
}: AttachmentsGalleryProps) => {
  const { t } = useI18n();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const actualTitle = title || t("attachments.title");

  const handleOpenPreview = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleClosePreview = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handlePrevious = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);

  const handleNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < archivos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex, archivos.length]);

  // File statistics
  const fileStats = useMemo(
    () => ({
      images: archivos.filter((a) => a.tipoArchivo === TipoArchivo.IMAGEN)
        .length,
      videos: archivos.filter((a) => a.tipoArchivo === TipoArchivo.VIDEO)
        .length,
      documents: archivos.filter((a) => a.tipoArchivo === TipoArchivo.DOCUMENTO)
        .length,
      total: archivos.length,
    }),
    [archivos]
  );

  if (archivos.length === 0) return null;

  return (
    <Card className={cn("overflow-hidden", className)}>
      {showHeader && (
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title and stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-8 rounded-xl bg-primary/10 shrink-0">
                <Paperclip className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold">
                  {actualTitle}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {fileStats.total} {t("attachments.filesAttached")}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {fileStats.images > 0 && (
                  <Badge
                    variant="secondary"
                    className="gap-1 py-0.5 px-2 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  >
                    <ImageIcon className="size-2.5" />
                    {fileStats.images}
                  </Badge>
                )}
                {fileStats.videos > 0 && (
                  <Badge
                    variant="secondary"
                    className="gap-1 py-0.5 px-2 text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  >
                    <Video className="size-2.5" />
                    {fileStats.videos}
                  </Badge>
                )}
                {fileStats.documents > 0 && (
                  <Badge
                    variant="secondary"
                    className="gap-1 py-0.5 px-2 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  >
                    <FileText className="size-2.5" />
                    {fileStats.documents}
                  </Badge>
                )}
              </div>

              {/* View mode toggle */}
              <div className="hidden sm:flex items-center rounded-lg border bg-muted/40 p-0.5">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "size-7 rounded-md",
                          viewMode === "grid" && "bg-background shadow-sm"
                        )}
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid3X3 className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{t("attachments.viewMode.grid")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "size-7 rounded-md",
                          viewMode === "list" && "bg-background shadow-sm"
                        )}
                        onClick={() => setViewMode("list")}
                      >
                        <LayoutList className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{t("attachments.viewMode.list")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(!showHeader && "pt-4")}>
        {/* Grid View */}
        {viewMode === "grid" && (
          <div
            className={cn(
              "grid gap-2.5 sm:gap-3",
              compact
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            )}
          >
            {archivos.map((archivo, index) => (
              <FileCard
                key={archivo.cloudinaryId || `file-${index}`}
                archivo={archivo}
                index={index}
                onClick={() => handleOpenPreview(index)}
                t={t}
              />
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {archivos.map((archivo, index) => (
              <FileCard
                key={archivo.cloudinaryId || `file-${index}`}
                archivo={archivo}
                index={index}
                onClick={() => handleOpenPreview(index)}
                compact
                t={t}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Preview Modal */}
      <PreviewModal
        archivo={selectedIndex !== null ? archivos[selectedIndex] : null}
        isOpen={selectedIndex !== null}
        onClose={handleClosePreview}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={selectedIndex !== null && selectedIndex > 0}
        hasNext={selectedIndex !== null && selectedIndex < archivos.length - 1}
        currentIndex={selectedIndex ?? 0}
        totalCount={archivos.length}
        t={t}
      />
    </Card>
  );
};

export default AttachmentsGallery;
