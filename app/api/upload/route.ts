import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { UploadedFile } from "@/interfaces/claudinary";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ALL_ALLOWED_TYPES, MAX_FILES } from "@/constants/constants";

import {
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

import {
  uploadToCloudinary,
  getCloudinaryResourceType,
  getTipoArchivo,
  validateFileSize,
  formatFileSize,
  getMaxSizeForType,
} from "@/lib/cloudinary";

/**
 * POST /api/upload
 * Upload files to Cloudinary
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return unauthorizedResponse();
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "combisales/visitas";

    if (!files || files.length === 0) {
      return badRequestResponse("FILES");
    }

    if (files.length > MAX_FILES) {
      return badRequestResponse(`Máximo ${MAX_FILES} archivos permitidos`);
    }

    const uploadedFiles: UploadedFile[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        if (!ALL_ALLOWED_TYPES.includes(file.type)) {
          errors.push(`${file.name}: Tipo de archivo no permitido`);
          continue;
        }

        if (!validateFileSize(file.type, file.size)) {
          const maxSize = getMaxSizeForType(file.type);
          errors.push(
            `${file.name}: Excede el tamaño máximo (${formatFileSize(maxSize)})`
          );
          continue;
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const resourceType = getCloudinaryResourceType(file.type);

        const result = await uploadToCloudinary(buffer, {
          folder,
          resourceType,
          originalFilename: file.name,
        });

        uploadedFiles.push({
          nombre: file.name,
          tipoArchivo: getTipoArchivo(file.type),
          mimeType: file.type,
          tamanio: result.bytes,
          cloudinaryId: result.public_id,
          cloudinaryUrl: result.secure_url,
          cloudinaryType: result.resource_type,
          ancho: result.width,
          alto: result.height,
          duracion: result.duration,
          formato: result.format,
        });
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errors.push(`${file.name}: Error al subir el archivo`);
      }
    }

    const response = {
      success: uploadedFiles.length > 0,
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
      message:
        uploadedFiles.length > 0
          ? `${uploadedFiles.length} archivo(s) subido(s) exitosamente`
          : "No se pudo subir ningún archivo",
    };

    return createSuccessResponse(
      response,
      uploadedFiles.length > 0 ? 200 : 400
    );
  } catch (error) {
    return serverErrorResponse("UPLOAD_FILE", error);
  }
}
