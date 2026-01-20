import { v2 as cloudinary } from "cloudinary";
import { CloudinaryUploadResult } from "@/interfaces/claudinary";

export {
  formatFileSize,
  validateFileSize,
  getMaxSizeForType,
  isAllowedFileType,
  getCloudinaryResourceType,
  getTipoArchivo,
  ALL_ALLOWED_TYPES,
} from "@/lib/file-utils";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload file to Cloudinary
 *
 * IMPORTANT NOTES:
 * - PDFs are uploaded as 'image' type per Cloudinary docs (enables browser viewing)
 * - Other documents (DOCX, XLSX, TXT) use 'raw' type with extension in public_id
 * - For raw files: access_mode: "public" is REQUIRED for browser access
 * - For raw files: type: "upload" ensures public delivery
 * - For raw files: DO NOT use the 'format' parameter
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    resourceType: "image" | "video" | "raw";
    originalFilename: string;
  },
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    // Extract file extension
    const getFileExtension = (): string => {
      const match = options.originalFilename.match(/\.([^/.]+)$/);
      return match ? match[1].toLowerCase() : "";
    };

    // Sanitize filename: remove special characters, keep only safe chars
    const sanitizeFilename = (name: string): string => {
      return name
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .replace(/_+/g, "_") // Replace multiple underscores with single
        .substring(0, 50); // Limit length
    };

    // Generate unique identifier
    const generateUniqueId = (): string => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `${timestamp}_${randomStr}`;
    };

    const fileExtension = getFileExtension();
    const fileNameWithoutExt = options.originalFilename.replace(
      /\.[^/.]+$/,
      "",
    );
    const sanitizedName = sanitizeFilename(fileNameWithoutExt);
    const uniqueId = generateUniqueId();

    // Build upload options based on resource type
    const buildUploadOptions = () => {
      const baseOptions: Record<string, unknown> = {
        folder: options.folder,
        resource_type: options.resourceType,
        overwrite: false,
      };

      if (options.resourceType === "raw") {
        // For ALL raw files (PDF, DOCX, XLSX, TXT, etc.):
        // - Include extension in public_id so the URL has the correct extension
        // - This is CRITICAL for browsers to handle documents correctly
        // - access_mode: "public" is REQUIRED to avoid 401 errors
        // - type: "upload" ensures the file is publicly deliverable
        const publicIdWithExtension = fileExtension
          ? `${sanitizedName}_${uniqueId}.${fileExtension}`
          : `${sanitizedName}_${uniqueId}`;

        return {
          ...baseOptions,
          public_id: publicIdWithExtension,
          use_filename: false,
          unique_filename: false,
          access_mode: "public",
          type: "upload",
        };
      }

      if (options.resourceType === "image") {
        // Check if this is a PDF (uploaded as image type per Cloudinary docs)
        const isPDF = fileExtension.toLowerCase() === "pdf";

        if (isPDF) {
          // PDFs uploaded as 'image' type - NO transformations to preserve original
          // This allows PDFs to be viewed directly in the browser
          return {
            ...baseOptions,
            use_filename: true,
            unique_filename: true,
            // No transformation for PDFs - deliver as-is
          };
        }

        // Regular images - apply quality optimization
        return {
          ...baseOptions,
          use_filename: true,
          unique_filename: true,
          transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
        };
      }

      if (options.resourceType === "video") {
        return {
          ...baseOptions,
          use_filename: true,
          unique_filename: true,
          eager: [{ width: 300, height: 200, crop: "fill", format: "jpg" }],
          eager_async: true,
        };
      }

      return baseOptions;
    };

    const uploadOptions = buildUploadOptions();

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else if (result) {
          // For raw files, ensure the format is correctly extracted from filename
          let format = result.format;
          if (!format && options.resourceType === "raw") {
            format = fileExtension;
          }

          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            resource_type: result.resource_type,
            format: format || fileExtension,
            width: result.width,
            height: result.height,
            duration: result.duration,
            bytes: result.bytes,
            original_filename: options.originalFilename,
          });
        } else {
          reject(new Error("No result from Cloudinary"));
        }
      },
    );

    uploadStream.end(buffer);
  });
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw",
): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
}

// Delete multiple files from Cloudinary
export async function deleteMultipleFromCloudinary(
  publicIds: string[],
  resourceType: "image" | "video" | "raw",
): Promise<void> {
  try {
    await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Error deleting multiple files from Cloudinary:", error);
  }
}

export default cloudinary;
