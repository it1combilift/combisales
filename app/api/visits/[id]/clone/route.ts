import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { VISIT_INCLUDE } from "@/lib/visits";
import { hasRole, hasAnyRole } from "@/lib/roles";
import { VisitStatus, Role } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
 * Clone an existing visit (SELLER and ADMIN)
 *
 * Creates a complete copy of a visit assigned to the SELLER by a DEALER.
 * The cloned visit:
 * - Belongs to the current user (userId = SELLER or ADMIN)
 * - Has clonedFromId pointing to the original
 * - Status is BORRADOR (draft)
 * - Copies all form data
 * - Copies all file attachments (metadata references to Cloudinary)
 * - User has full edit control over the cloned visit and its files
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

    // 1. Verificar que el usuario es SELLER o ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { roles: true },
    });

    if (
      !currentUser ||
      !hasAnyRole(currentUser.roles, [Role.SELLER, Role.ADMIN])
    ) {
      return badRequestResponse(
        "Solo los usuarios SELLER o ADMIN pueden clonar visitas",
      );
    }

    const isSeller = hasRole(currentUser.roles, Role.SELLER);
    const isAdmin = hasRole(currentUser.roles, Role.ADMIN);

    // 2. Obtener la visita original con todos sus datos
    const originalVisit = await prisma.visit.findUnique({
      where: { id },
      include: {
        user: { select: { roles: true } },
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
    if (!originalVisit.user?.roles?.includes(Role.DEALER)) {
      return badRequestResponse("CANNOT_CLONE_NON_DEALER_VISIT");
    }

    // 4. Verificar permisos específicos
    // - ADMIN: puede clonar cualquier visita de DEALER (priority check)
    // - SELLER-only: solo puede clonar visitas asignadas a él
    if (
      !isAdmin &&
      isSeller &&
      originalVisit.assignedSellerId !== session.user.id
    ) {
      return badRequestResponse("Esta visita no está asignada a ti");
    }

    // 5. Verificar que no es ya un clon (no se puede clonar un clon)
    if (originalVisit.clonedFromId) {
      return badRequestResponse("CANNOT_CLONE_A_CLONE");
    }

    // 6. Preparar datos del formulario para la copia
    // IMPORTANTE: Copiamos todos los archivos del original al clon
    // Los archivos de Cloudinary pueden ser compartidos (mismo cloudinaryId)
    // ya que el contenido no se duplica, solo los metadatos en la BD
    let formDataCreate = {};

    if (originalVisit.formularioCSSAnalisis) {
      const {
        id: _id,
        visitId: _visitId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        archivos,
        ...formData
      } = originalVisit.formularioCSSAnalisis;

      // Copiar archivos al clon (solo metadatos, cloudinaryId puede repetirse)
      const archivosCopy = archivos.map((archivo) => ({
        nombre: archivo.nombre,
        tipoArchivo: archivo.tipoArchivo,
        mimeType: archivo.mimeType,
        tamanio: archivo.tamanio,
        cloudinaryId: archivo.cloudinaryId,
        cloudinaryUrl: archivo.cloudinaryUrl,
        cloudinaryType: archivo.cloudinaryType,
        ancho: archivo.ancho,
        alto: archivo.alto,
        duracion: archivo.duracion,
        formato: archivo.formato,
      }));

      formDataCreate = {
        formularioCSSAnalisis: {
          create: {
            ...formData,
            archivos: {
              create: archivosCopy,
            },
          },
        },
      };
    } else if (originalVisit.formularioIndustrialAnalisis) {
      const {
        id: _id,
        visitId: _visitId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        archivos,
        ...formData
      } = originalVisit.formularioIndustrialAnalisis;

      const archivosCopy = archivos.map((archivo) => ({
        nombre: archivo.nombre,
        tipoArchivo: archivo.tipoArchivo,
        mimeType: archivo.mimeType,
        tamanio: archivo.tamanio,
        cloudinaryId: archivo.cloudinaryId,
        cloudinaryUrl: archivo.cloudinaryUrl,
        cloudinaryType: archivo.cloudinaryType,
        ancho: archivo.ancho,
        alto: archivo.alto,
        duracion: archivo.duracion,
        formato: archivo.formato,
      }));

      formDataCreate = {
        formularioIndustrialAnalisis: {
          create: {
            ...formData,
            archivos: {
              create: archivosCopy,
            },
          },
        },
      };
    } else if (originalVisit.formularioLogisticaAnalisis) {
      const {
        id: _id,
        visitId: _visitId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        archivos,
        ...formData
      } = originalVisit.formularioLogisticaAnalisis;

      const archivosCopy = archivos.map((archivo) => ({
        nombre: archivo.nombre,
        tipoArchivo: archivo.tipoArchivo,
        mimeType: archivo.mimeType,
        tamanio: archivo.tamanio,
        cloudinaryId: archivo.cloudinaryId,
        cloudinaryUrl: archivo.cloudinaryUrl,
        cloudinaryType: archivo.cloudinaryType,
        ancho: archivo.ancho,
        alto: archivo.alto,
        duracion: archivo.duracion,
        formato: archivo.formato,
      }));

      formDataCreate = {
        formularioLogisticaAnalisis: {
          create: {
            ...formData,
            archivos: {
              create: archivosCopy,
            },
          },
        },
      };
    } else if (originalVisit.formularioStraddleCarrierAnalisis) {
      const {
        id: _id,
        visitId: _visitId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        archivos,
        ...formData
      } = originalVisit.formularioStraddleCarrierAnalisis;

      const archivosCopy = archivos.map((archivo) => ({
        nombre: archivo.nombre,
        tipoArchivo: archivo.tipoArchivo,
        mimeType: archivo.mimeType,
        tamanio: archivo.tamanio,
        cloudinaryId: archivo.cloudinaryId,
        cloudinaryUrl: archivo.cloudinaryUrl,
        cloudinaryType: archivo.cloudinaryType,
        ancho: archivo.ancho,
        alto: archivo.alto,
        duracion: archivo.duracion,
        formato: archivo.formato,
      }));

      formDataCreate = {
        formularioStraddleCarrierAnalisis: {
          create: {
            ...formData,
            archivos: {
              create: archivosCopy,
            },
          },
        },
      };
    }

    // 7. Check if a clone already exists for this original visit
    const existingClone = await prisma.visit.findFirst({
      where: {
        clonedFromId: originalVisit.id,
      },
    });

    if (existingClone) {
      return badRequestResponse("VISIT_ALREADY_CLONED");
    }

    // 8. Create cloned visit
    // IMPORTANTE: NO cambiar el status del original
    // El status del DEALER (COMPLETADA) debe permanecer igual desde su perspectiva
    // El UI de SELLER/ADMIN calculará el status efectivo basándose en la existencia del clon
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
