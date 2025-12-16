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
  type: string | null
): type is CloudinaryResourceType {
  return (
    type !== null &&
    VALID_RESOURCE_TYPES.includes(type as CloudinaryResourceType)
  );
}

/**
 * DELETE /api/upload/[id]
 * Delete a specific uploaded file by Cloudinary ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return unauthorizedResponse();
    }

    const { id: cloudinaryId } = await params;

    if (!cloudinaryId) {
      return badRequestResponse("FILE_ID");
    }

    const archivo = await prisma.formularioArchivo.findUnique({
      where: { cloudinaryId },
    });

    let resourceType: CloudinaryResourceType = "raw";
    if (archivo) {
      resourceType = archivo.cloudinaryType as CloudinaryResourceType;
    } else {
      const typeParam = new URL(req.url).searchParams.get("type");
      if (isValidResourceType(typeParam)) {
        resourceType = typeParam;
      }
    }

    const deletedFromCloudinary = await deleteFromCloudinary(
      cloudinaryId,
      resourceType
    );

    if (!deletedFromCloudinary) {
      console.warn(`Could not delete from Cloudinary: ${cloudinaryId}`);
    }

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
    });
  } catch (error) {
    return serverErrorResponse("DELETE_FILE", error);
  }
}
