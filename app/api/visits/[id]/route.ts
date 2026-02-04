import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { VisitFormType, VisitStatus, Role } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import {
  sendVisitCompletedNotification,
  shouldSendVisitNotification,
  buildVisitEmailDataExtended,
} from "@/lib/visit-notifications";

import {
  VISIT_INCLUDE,
  buildFormularioUpsert,
  buildFormularioIndustrialUpsert,
  buildFormularioLogisticaUpsert,
  buildFormularioStraddleCarrierUpsert,
  syncFormularioArchivos,
} from "@/lib/visits";

import {
  UpdateVisitData,
  CreateFormularioCSSData,
  CreateFormularioIndustrialData,
  CreateFormularioLogisticaData,
  CreateFormularioStraddleCarrierData,
} from "@/interfaces/visits";

import {
  API_SUCCESS,
  unauthorizedResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

/**
 * GET /api/visits/[id]
 * Get a specific visit by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const visit = await prisma.visit.findUnique({
      where: { id },
      include: VISIT_INCLUDE,
    });

    if (!visit) {
      return notFoundResponse("VISIT");
    }

    return createSuccessResponse({ visit });
  } catch (error) {
    return serverErrorResponse("FETCH_VISIT", error);
  }
}

/**
 * PUT /api/visits/[id]
 * Update an existing visit
 *
 * Permission rules:
 * - ADMIN: can edit any visit
 * - DEALER: can only edit their own visits
 * - SELLER: can only edit their OWN CLONES (clonedFromId !== null && userId === session.user.id)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await req.json();
    const { visitData, formularioData } = body as {
      visitData?: UpdateVisitData;
      formularioData?:
        | CreateFormularioCSSData
        | CreateFormularioIndustrialData
        | CreateFormularioLogisticaData
        | CreateFormularioStraddleCarrierData;
    };

    const existingVisit = await prisma.visit.findUnique({
      where: { id },
      include: {
        formularioCSSAnalisis: true,
        formularioIndustrialAnalisis: true,
        formularioLogisticaAnalisis: true,
        formularioStraddleCarrierAnalisis: true,
      },
    });

    if (!existingVisit) {
      return notFoundResponse("VISIT");
    }

    // ==================== PERMISSION VALIDATION ====================
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!currentUser) {
      return unauthorizedResponse();
    }

    // SELLER: puede editar sus propias visitas (creadas por él) O sus propios clones
    if (currentUser.role === Role.SELLER) {
      // El SELLER debe ser el propietario de la visita (ya sea original o clon)
      if (existingVisit.userId !== session.user.id) {
        // Si no es el propietario, verificar si es una visita asignada a él por un DEALER
        // En este caso, NO puede editarla directamente (debe clonarla primero)
        if (existingVisit.assignedSellerId === session.user.id) {
          return badRequestResponse(
            "Para editar una visita asignada por un DEALER, primero debes clonarla",
          );
        }
        return badRequestResponse("Solo puedes editar tus propias visitas");
      }
      // Si llegamos aquí, el SELLER es el propietario de la visita - puede editarla
    }
    // DEALER: solo puede editar sus propias visitas
    else if (currentUser.role === Role.DEALER) {
      if (existingVisit.userId !== session.user.id) {
        return badRequestResponse("Solo puedes editar tus propias visitas");
      }
    }
    // ADMIN: puede editar cualquier visita (no requiere validación adicional)

    // ==================== SYNC FILES BEFORE UPDATE ====================
    // This ensures files deleted in the form are also deleted from DB and Cloudinary
    if (formularioData && "archivos" in formularioData) {
      const newArchivos = (formularioData.archivos || []).filter(
        (a: any) => a.cloudinaryId && a.cloudinaryUrl,
      );

      if (
        existingVisit.formType === VisitFormType.ANALISIS_CSS &&
        existingVisit.formularioCSSAnalisis
      ) {
        await syncFormularioArchivos(
          existingVisit.formularioCSSAnalisis.id,
          newArchivos,
          "FormularioArchivo",
        );
      } else if (
        existingVisit.formType === VisitFormType.ANALISIS_INDUSTRIAL &&
        existingVisit.formularioIndustrialAnalisis
      ) {
        await syncFormularioArchivos(
          existingVisit.formularioIndustrialAnalisis.id,
          newArchivos,
          "FormularioArchivoIndustrial",
        );
      } else if (
        existingVisit.formType === VisitFormType.ANALISIS_LOGISTICA &&
        existingVisit.formularioLogisticaAnalisis
      ) {
        await syncFormularioArchivos(
          existingVisit.formularioLogisticaAnalisis.id,
          newArchivos,
          "FormularioArchivoLogistica",
        );
      } else if (
        existingVisit.formType === VisitFormType.ANALISIS_STRADDLE_CARRIER &&
        existingVisit.formularioStraddleCarrierAnalisis
      ) {
        await syncFormularioArchivos(
          existingVisit.formularioStraddleCarrierAnalisis.id,
          newArchivos,
          "FormularioArchivoStraddleCarrier",
        );
      }
    }

    let formDataUpdate = {};
    if (
      existingVisit.formType === VisitFormType.ANALISIS_CSS &&
      formularioData
    ) {
      formDataUpdate = {
        formularioCSSAnalisis: {
          upsert: buildFormularioUpsert(
            formularioData as CreateFormularioCSSData,
          ),
        },
      };
    } else if (
      existingVisit.formType === VisitFormType.ANALISIS_INDUSTRIAL &&
      formularioData
    ) {
      formDataUpdate = {
        formularioIndustrialAnalisis: {
          upsert: buildFormularioIndustrialUpsert(
            formularioData as CreateFormularioIndustrialData,
          ),
        },
      };
    } else if (
      existingVisit.formType === VisitFormType.ANALISIS_LOGISTICA &&
      formularioData
    ) {
      formDataUpdate = {
        formularioLogisticaAnalisis: {
          upsert: buildFormularioLogisticaUpsert(
            formularioData as CreateFormularioLogisticaData,
          ),
        },
      };
    } else if (
      existingVisit.formType === VisitFormType.ANALISIS_STRADDLE_CARRIER &&
      formularioData
    ) {
      formDataUpdate = {
        formularioStraddleCarrierAnalisis: {
          upsert: buildFormularioStraddleCarrierUpsert(
            formularioData as CreateFormularioStraddleCarrierData,
          ),
        },
      };
    }

    const visit = await prisma.visit.update({
      where: { id },
      data: {
        ...(visitData?.status && { status: visitData.status }),
        ...(visitData?.visitDate && { visitDate: visitData.visitDate }),
        ...formDataUpdate,
      },
      include: VISIT_INCLUDE,
    });

    // ==================== SYNC ORIGINAL VISIT STATUS (SELLER/ADMIN Flow) ====================
    // When a SELLER/ADMIN submits a cloned visit as COMPLETADA,
    // automatically mark the original visit as COMPLETADA as well
    // This ensures both records show consistent status in the UI
    const newStatus = visitData?.status;
    const isClone = !!existingVisit.clonedFromId;
    const isSellerOrAdmin =
      currentUser.role === Role.SELLER || currentUser.role === Role.ADMIN;

    if (
      isClone &&
      isSellerOrAdmin &&
      newStatus === VisitStatus.COMPLETADA &&
      existingVisit.clonedFromId
    ) {
      // Update the original visit to COMPLETADA
      await prisma.visit.update({
        where: { id: existingVisit.clonedFromId },
        data: { status: VisitStatus.COMPLETADA },
      });
      console.log(
        `[Status Sync] Original visit ${existingVisit.clonedFromId} marked as COMPLETADA (clone ${id} was submitted)`,
      );
    }

    // Enviar notificacion de email según el rol del usuario
    // DEALER: solo en COMPLETADA | SELLER/ADMIN: en BORRADOR y COMPLETADA
    const currentStatus = visitData?.status || existingVisit.status;
    const userRole = currentUser.role as "DEALER" | "SELLER" | "ADMIN";

    if (
      shouldSendVisitNotification(currentStatus, userRole) &&
      formularioData
    ) {
      // visit includes customer from VISIT_INCLUDE
      const visitWithCustomer = visit as typeof visit & {
        customer?: { accountName?: string };
        clonedFrom?: {
          id: string;
          user?: { name: string | null; email: string };
          formularioCSSAnalisis?: { archivos?: any[] };
          formularioIndustrialAnalisis?: { archivos?: any[] };
          formularioLogisticaAnalisis?: { archivos?: any[] };
          formularioStraddleCarrierAnalisis?: { archivos?: any[] };
        };
      };

      const customerName = visitWithCustomer.customer?.accountName || "";
      const userRole = visit.user?.role as
        | "ADMIN"
        | "DEALER"
        | "SELLER"
        | undefined;

      // Check if this is a cloned visit
      const isClone = !!visit.clonedFromId;
      const clonedFrom = visitWithCustomer.clonedFrom;

      // Get original visit's files if this is a clone
      let originalArchivos: any[] = [];
      if (isClone && clonedFrom) {
        const originalFormulario =
          clonedFrom.formularioCSSAnalisis ||
          clonedFrom.formularioIndustrialAnalisis ||
          clonedFrom.formularioLogisticaAnalisis ||
          clonedFrom.formularioStraddleCarrierAnalisis;
        originalArchivos = (originalFormulario as any)?.archivos || [];
      }

      const emailData = buildVisitEmailDataExtended({
        formType: existingVisit.formType,
        formularioData,
        visitDate: visit.visitDate,
        status: currentStatus,
        locale: visitData?.locale || "es",
        visitId: visit.id,
        // Owner is the user who created the visit
        owner: visit.user
          ? {
              name: visit.user.name,
              email: visit.user.email,
              role: visit.user.role,
            }
          : undefined,
        // For DEALER: the dealer is the owner (only if not a clone)
        dealer:
          !isClone && userRole === "DEALER" && visit.user
            ? {
                name: visit.user.name,
                email: visit.user.email,
              }
            : undefined,
        // Seller info
        vendedor:
          userRole === "SELLER" && visit.user
            ? {
                name: visit.user.name,
                email: visit.user.email,
              }
            : visit.assignedSeller
              ? {
                  name: visit.assignedSeller.name,
                  email: visit.assignedSeller.email,
                }
              : undefined,
        customerName,
        submitterRole: userRole,
        // Clone information
        isClone,
        originalVisitId: visit.clonedFromId || undefined,
        originalDealerName: clonedFrom?.user?.name || undefined,
        originalArchivos,
      });

      // Enviar notificacion de forma asincrona (no bloquea la respuesta)
      sendVisitCompletedNotification({ visitData: emailData })
        .then((result) => {
          if (result.success) {
            console.log(
              `[Email] Notificacion enviada para visita actualizada ${visit.id} (${currentStatus}):`,
              result.data?.id,
              `Destinatarios: ${result.sentTo.join(", ")}`,
            );
          } else {
            console.error(
              `[Email] Error enviando notificacion para visita ${visit.id}:`,
              result.error,
            );
          }
        })
        .catch((error) => {
          console.error(
            `[Email] Error inesperado enviando notificacion para visita ${visit.id}:`,
            error,
          );
        });
    }

    return createSuccessResponse({
      message: API_SUCCESS.VISIT_UPDATED,
      visit,
    });
  } catch (error) {
    return serverErrorResponse("UPDATE_VISIT", error);
  }
}

/**
 * DELETE /api/visits/[id]
 * Delete a visit
 *
 * Permission rules:
 * - ADMIN: can delete any visit (supports cascade=true to delete original + clone)
 * - DEALER: can only delete their own visits
 * - SELLER: can only delete their OWN CLONES
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const cascade = searchParams.get("cascade") === "true";

    const visit = await prisma.visit.findUnique({
      where: { id },
      include: {
        clones: {
          select: { id: true },
        },
      },
    });

    if (!visit) {
      return notFoundResponse("VISIT");
    }

    // ==================== PERMISSION VALIDATION ====================
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!currentUser) {
      return unauthorizedResponse();
    }

    // SELLER: solo puede eliminar sus propios clones
    if (currentUser.role === Role.SELLER) {
      if (!visit.clonedFromId) {
        return badRequestResponse(
          "Los SELLER solo pueden eliminar clones, no visitas originales",
        );
      }
      if (visit.userId !== session.user.id) {
        return badRequestResponse("Solo puedes eliminar tus propios clones");
      }
    }
    // DEALER: solo puede eliminar sus propias visitas
    else if (currentUser.role === Role.DEALER) {
      if (visit.userId !== session.user.id) {
        return badRequestResponse("Solo puedes eliminar tus propias visitas");
      }
    }
    // ADMIN: puede eliminar cualquier visita (con cascade opcional)

    // ==================== CASCADE DELETE (ADMIN only) ====================
    // If cascade=true and visit has clones, delete clones first
    if (cascade && currentUser.role === Role.ADMIN && visit.clones.length > 0) {
      // Delete all clones first
      await prisma.visit.deleteMany({
        where: {
          clonedFromId: id,
        },
      });
    }

    await prisma.visit.delete({
      where: { id },
    });

    return createSuccessResponse({ message: API_SUCCESS.VISIT_DELETED });
  } catch (error) {
    return serverErrorResponse("DELETE_VISIT", error);
  }
}
