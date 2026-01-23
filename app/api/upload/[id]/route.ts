import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import {
  API_SUCCESS,
  unauthorizedResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

// ==================== TYPES ====================
type CloudinaryResourceType = "image" | "video" | "raw";

const VALID_RESOURCE_TYPES: CloudinaryResourceType[] = [
  "image",
  "video",
  "raw",
];

function isValidResourceType(
  type: string | null,
): type is CloudinaryResourceType {
  return (
    type !== null &&
    VALID_RESOURCE_TYPES.includes(type as CloudinaryResourceType)
  );
}

/**
 * DELETE /api/upload/[id]
 * Delete a specific uploaded file by Cloudinary ID
 *
 * The [id] parameter is a placeholder - actual cloudinaryId should be passed
 * via query parameter 'publicId' to handle slashes in the ID correctly.
 * Example: DELETE /api/upload/delete?publicId=combisales/visitas/general/file_xyz&type=image
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return unauthorizedResponse();
    }

    const url = new URL(req.url);

    // Support both: path param (for simple IDs) and query param (for IDs with slashes)
    const queryPublicId = url.searchParams.get("publicId");
    const { id: pathId } = await params;

    // Prefer query parameter if provided (handles slashes correctly)
    // Otherwise decode the path parameter
    const cloudinaryId = queryPublicId
      ? queryPublicId
      : decodeURIComponent(pathId);

    if (!cloudinaryId) {
      return badRequestResponse("FILE_ID");
    }

    // CRITICAL: Get formularioId to ensure we only delete from SPECIFIC visit
    // This prevents deleting files from original visit when deleting from clone
    const formularioId = url.searchParams.get("formularioId");

    if (!formularioId) {
      return badRequestResponse("FORMULARIO_ID_REQUIRED");
    }

    // Look up the file in database to get the correct resource type
    // Search with BOTH cloudinaryId AND formularioId for proper isolation
    const [archivoCSS, archivoIndustrial, archivoLogistica, archivoStraddle] =
      await Promise.all([
        prisma.formularioArchivo.findFirst({
          where: { cloudinaryId, formularioId },
        }),
        prisma.formularioArchivoIndustrial.findFirst({
          where: { cloudinaryId, formularioId },
        }),
        prisma.formularioArchivoLogistica.findFirst({
          where: { cloudinaryId, formularioId },
        }),
        prisma.formularioArchivoStraddleCarrier.findFirst({
          where: { cloudinaryId, formularioId },
        }),
      ]);

    const archivo =
      archivoCSS || archivoIndustrial || archivoLogistica || archivoStraddle;

    if (!archivo) {
      return notFoundResponse("FILE");
    }

    // Determine resource type from database
    const resourceType = archivo.cloudinaryType as CloudinaryResourceType;

    // Check if this cloudinaryId is used by OTHER visits (original or other clones)
    // If so, DON'T delete from Cloudinary, only remove DB record for THIS visit
    const [countCSS, countIndustrial, countLogistica, countStraddle] =
      await Promise.all([
        prisma.formularioArchivo.count({
          where: { cloudinaryId, formularioId: { not: formularioId } },
        }),
        prisma.formularioArchivoIndustrial.count({
          where: { cloudinaryId, formularioId: { not: formularioId } },
        }),
        prisma.formularioArchivoLogistica.count({
          where: { cloudinaryId, formularioId: { not: formularioId } },
        }),
        prisma.formularioArchivoStraddleCarrier.count({
          where: { cloudinaryId, formularioId: { not: formularioId } },
        }),
      ]);

    const isSharedFile =
      countCSS + countIndustrial + countLogistica + countStraddle > 0;

    // Delete from database - ONLY for this specific formulario
    if (archivoCSS) {
      await prisma.formularioArchivo.deleteMany({
        where: { cloudinaryId, formularioId },
      });
    } else if (archivoIndustrial) {
      await prisma.formularioArchivoIndustrial.deleteMany({
        where: { cloudinaryId, formularioId },
      });
    } else if (archivoLogistica) {
      await prisma.formularioArchivoLogistica.deleteMany({
        where: { cloudinaryId, formularioId },
      });
    } else if (archivoStraddle) {
      await prisma.formularioArchivoStraddleCarrier.deleteMany({
        where: { cloudinaryId, formularioId },
      });
    }

    // Only delete from Cloudinary if NO other visits are using this file
    let deletedFromCloudinary = false;
    if (!isSharedFile) {
      deletedFromCloudinary = await deleteFromCloudinary(
        cloudinaryId,
        resourceType,
      );

      if (!deletedFromCloudinary) {
        console.warn(
          `Could not delete from Cloudinary: ${cloudinaryId} (type: ${resourceType})`,
        );
      }
    } else {
      console.log(
        `[File Isolation] File ${cloudinaryId} is shared with other visits, keeping in Cloudinary`,
      );
    }

    return createSuccessResponse({
      success: true,
      message: API_SUCCESS.FILE_DELETED,
      deletedFromCloudinary,
      deletedFromDatabase: true,
      cloudinaryId,
      resourceType,
      isSharedFile,
    });
  } catch (error) {
    return serverErrorResponse("DELETE_FILE", error);
  }
}
