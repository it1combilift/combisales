import { TipoArchivo } from "@prisma/client";
import { ImageIcon, VideoIcon, FileIcon } from "lucide-react";

/**
 * Get appropriate icon for file type
 */
export function getFileIcon(tipoArchivo: TipoArchivo) {
  switch (tipoArchivo) {
    case TipoArchivo.IMAGEN:
      return ImageIcon;
    case TipoArchivo.VIDEO:
      return VideoIcon;
    default:
      return FileIcon;
  }
}

/**
 * Format file size for display
 * Already exists in lib/file-utils but re-exported for convenience
 */
export { formatFileSize } from "@/lib/file-utils";

/**
 * Validate if file type is allowed
 */
export { isAllowedFileType, ALL_ALLOWED_TYPES } from "@/lib/file-utils";

/**
 * Maximum files constant
 */
export { MAX_FILES } from "@/constants/constants";
