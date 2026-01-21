import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { VisitStatus, Role } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { VISIT_INCLUDE } from "@/lib/visits";

import {
  HTTP_STATUS,
  unauthorizedResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

/**
 * POST /api/visits/[id]/clone
 * Clone an existing visit (SELLER only)
 *
 * Creates a copy of a visit assigned to the SELLER by a DEALER.
 * The cloned visit:
 * - Belongs to the SELLER (userId = SELLER)
 * - Has clonedFromId pointing to the original
 * - Status is BORRADOR (draft)
 * - Copies all form data
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // 1. Verificar que el usuario es SELLER
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== Role.SELLER) {
      return badRequestResponse(
        "Solo los usuarios SELLER pueden clonar visitas",
      );
    }

    // 2. Obtener la visita original con todos sus datos
    const originalVisit = await prisma.visit.findUnique({
      where: { id },
      include: {
        user: { select: { role: true } },
        formularioCSSAnalisis: { include: { archivos: true } },
        formularioIndustrialAnalisis: { include: { archivos: true } },
        formularioLogisticaAnalisis: { include: { archivos: true } },
        formularioStraddleCarrierAnalisis: { include: { archivos: true } },
      },
    });

    if (!originalVisit) {
      return notFoundResponse("VISIT");
    }

    // 3. Verificar que la visita original es de un DEALER
    if (originalVisit.user?.role !== Role.DEALER) {
      return badRequestResponse("CANNOT_CLONE_NON_DEALER_VISIT");
    }

    // 4. Verificar que la visita está asignada a este SELLER
    if (originalVisit.assignedSellerId !== session.user.id) {
      return badRequestResponse("Esta visita no está asignada a ti");
    }

    // 5. Verificar que no es ya un clon (no se puede clonar un clon)
    if (originalVisit.clonedFromId) {
      return badRequestResponse("CANNOT_CLONE_A_CLONE");
    }

    // 6. Preparar datos del formulario para la copia
    // IMPORTANTE: No copiamos los archivos (archivos) porque tienen cloudinaryId único
    // Los archivos del formulario original permanecen con el original.
    // El usuario puede agregar nuevos archivos al clon si lo necesita.
    let formDataCreate = {};

    if (originalVisit.formularioCSSAnalisis) {
      const {
        id: _id,
        visitId: _visitId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        archivos: _archivos, // Excluir archivos - tienen cloudinaryId único
        ...formData
      } = originalVisit.formularioCSSAnalisis;
      formDataCreate = {
        formularioCSSAnalisis: {
          create: {
            ...formData,
            // No crear archivos - el clon empieza sin adjuntos
          },
        },
      };
    } else if (originalVisit.formularioIndustrialAnalisis) {
      const {
        id: _id,
        visitId: _visitId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        archivos: _archivos, // Excluir archivos - tienen cloudinaryId único
        ...formData
      } = originalVisit.formularioIndustrialAnalisis;
      formDataCreate = {
        formularioIndustrialAnalisis: {
          create: {
            ...formData,
            // No crear archivos - el clon empieza sin adjuntos
          },
        },
      };
    } else if (originalVisit.formularioLogisticaAnalisis) {
      const {
        id: _id,
        visitId: _visitId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        archivos: _archivos, // Excluir archivos - tienen cloudinaryId único
        ...formData
      } = originalVisit.formularioLogisticaAnalisis;
      formDataCreate = {
        formularioLogisticaAnalisis: {
          create: {
            ...formData,
            // No crear archivos - el clon empieza sin adjuntos
          },
        },
      };
    } else if (originalVisit.formularioStraddleCarrierAnalisis) {
      const {
        id: _id,
        visitId: _visitId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        archivos: _archivos, // Excluir archivos - tienen cloudinaryId único
        ...formData
      } = originalVisit.formularioStraddleCarrierAnalisis;
      formDataCreate = {
        formularioStraddleCarrierAnalisis: {
          create: {
            ...formData,
            // No crear archivos - el clon empieza sin adjuntos
          },
        },
      };
    }

    // 7. Crear la visita clonada
    const clonedVisit = await prisma.visit.create({
      data: {
        // Mantener referencia al cliente si existe
        customerId: originalVisit.customerId,
        zohoTaskId: originalVisit.zohoTaskId,
        // El SELLER es ahora el propietario
        userId: session.user.id,
        formType: originalVisit.formType,
        // Siempre empieza como borrador
        status: VisitStatus.BORRADOR,
        visitDate: new Date(),
        // No tiene vendedor asignado (es del SELLER)
        assignedSellerId: null,
        // Campos de clonación
        clonedFromId: originalVisit.id,
        clonedAt: new Date(),
        // Datos del formulario
        ...formDataCreate,
      },
      include: VISIT_INCLUDE,
    });

    return createSuccessResponse(
      {
        message: "VISIT_CLONED",
        visit: clonedVisit,
        originalVisitId: originalVisit.id,
      },
      HTTP_STATUS.CREATED,
    );
  } catch (error) {
    console.error("Error cloning visit:", error);
    return serverErrorResponse("UPDATE_VISIT", error);
  }
}
