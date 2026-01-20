import { TipoArchivo } from "@prisma/client";

import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_DOCUMENT_SIZE,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  ALL_ALLOWED_TYPES,
} from "@/constants/constants";

// Re-export for convenience
export { ALL_ALLOWED_TYPES };

// ==================== FILE TYPE HELPERS ====================

/**
 * Determine file type category from MIME type
 */
export function getFileTypeCategory(
  mimeType: string,
): "image" | "video" | "document" {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return "image";
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return "video";
  return "document";
}

/**
 * Determine file type for Cloudinary resource type
 * NOTE: According to Cloudinary official documentation:
 * - PDFs are uploaded as 'image' asset type (this enables viewing in browser)
 * - Other documents (DOCX, XLSX, TXT, etc.) use 'raw' type
 * - For raw files, the extension MUST be included in the public_id
 */
export function getCloudinaryResourceType(
  mimeType: string,
): "image" | "video" | "raw" {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return "image";
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return "video";
  // PDFs are uploaded as 'image' type per Cloudinary docs - this enables browser viewing
  if (mimeType === "application/pdf") return "image";
  // All other documents (DOCX, XLSX, TXT, etc.) use 'raw' type with extension in public_id
  return "raw";
}

/**
 * Determine file type for the database (Prisma TipoArchivo enum)
 */
export function getTipoArchivo(mimeType: string): TipoArchivo {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return TipoArchivo.IMAGEN;
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return TipoArchivo.VIDEO;
  return TipoArchivo.DOCUMENTO;
}

/**
 * Validate file size according to file type
 */
export function validateFileSize(mimeType: string, size: number): boolean {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return size <= MAX_IMAGE_SIZE;
  }
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    return size <= MAX_VIDEO_SIZE;
  }
  return size <= MAX_DOCUMENT_SIZE;
}

/**
 * Get maximum allowed size for a file type
 */
export function getMaxSizeForType(mimeType: string): number {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return MAX_IMAGE_SIZE;
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return MAX_VIDEO_SIZE;
  return MAX_DOCUMENT_SIZE;
}

/**
 * Format bytes to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(mimeType: string): boolean {
  return ALL_ALLOWED_TYPES.includes(mimeType);
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "video/x-msvideo": "avi",
    "video/x-ms-wmv": "wmv",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "text/plain": "txt",
  };
  return mimeToExt[mimeType] || "bin";
}
