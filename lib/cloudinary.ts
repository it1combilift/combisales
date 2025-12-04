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

// Upload file to Cloudinary
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    resourceType: "image" | "video" | "raw";
    originalFilename: string;
  }
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        ...(options.resourceType === "image" && {
          transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
        }),

        ...(options.resourceType === "video" && {
          eager: [{ width: 300, height: 200, crop: "fill", format: "jpg" }],
          eager_async: true,
        }),
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            resource_type: result.resource_type,
            format: result.format,
            width: result.width,
            height: result.height,
            duration: result.duration,
            bytes: result.bytes,
            original_filename: options.originalFilename,
          });
        } else {
          reject(new Error("No result from Cloudinary"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw"
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
  resourceType: "image" | "video" | "raw"
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
