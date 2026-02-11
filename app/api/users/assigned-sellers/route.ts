import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";
import { hasRole } from "@/lib/roles";
import {
  unauthorizedResponse,
  createSuccessResponse,
  createErrorResponse,
  badRequestResponse,
  HTTP_STATUS,
} from "@/lib/api-response";

/**
 * GET /api/users/assigned-sellers
 * Get the sellers assigned to the current DEALER user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return unauthorizedResponse();
    }

    // Get the current user and verify they are a DEALER
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        roles: true,
        assignedSellers: {
          select: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (!hasRole(currentUser.roles, Role.DEALER)) {
      return badRequestResponse("NOT_A_DEALER");
    }

    // Extract active sellers from the relationship
    const sellers = currentUser.assignedSellers
      .map((ds) => ds.seller)
      .filter((seller) => seller.isActive)
      .map((seller) => ({
        id: seller.id,
        name: seller.name,
        email: seller.email,
        image: seller.image,
      }));

    return createSuccessResponse({ sellers });
  } catch (error) {
    console.error("Error fetching assigned sellers:", error);
    return createErrorResponse(
      "Error al obtener los vendedores asignados",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
}
