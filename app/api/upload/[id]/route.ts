import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import {
  API_SUCCESS,
  unauthorizedResponse,
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

    // Look up the file in database to get the correct resource type
    const archivo = await prisma.formularioArchivo.findUnique({
      where: { cloudinaryId },
    });

    // Determine resource type: from database, from query param, or default to 'raw'
    let resourceType: CloudinaryResourceType = "raw";
    if (archivo) {
      resourceType = archivo.cloudinaryType as CloudinaryResourceType;
    } else {
      const typeParam = url.searchParams.get("type");
      if (isValidResourceType(typeParam)) {
        resourceType = typeParam;
      }
    }

    // Delete from Cloudinary
    const deletedFromCloudinary = await deleteFromCloudinary(
      cloudinaryId,
      resourceType,
    );

    if (!deletedFromCloudinary) {
      console.warn(
        `Could not delete from Cloudinary: ${cloudinaryId} (type: ${resourceType})`,
      );
    }

    // Delete from database if record exists
    if (archivo) {
      await prisma.formularioArchivo.delete({
        where: { cloudinaryId },
      });
    }

    return createSuccessResponse({
      success: true,
      message: API_SUCCESS.FILE_DELETED,
      deletedFromCloudinary,
      deletedFromDatabase: !!archivo,
      cloudinaryId,
      resourceType,
    });
  } catch (error) {
    return serverErrorResponse("DELETE_FILE", error);
  }
}
