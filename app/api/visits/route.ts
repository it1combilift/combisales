import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { VisitFormType, VisitStatus, Role } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import {
  VISIT_INCLUDE,
  buildFormularioCreate,
  buildFormularioIndustrialCreate,
  buildFormularioLogisticaCreate,
  buildFormularioStraddleCarrierCreate,
} from "@/lib/visits";

import {
  CreateVisitData,
  CreateFormularioCSSData,
  CreateFormularioIndustrialData,
  CreateFormularioLogisticaData,
  CreateFormularioStraddleCarrierData,
} from "@/interfaces/visits";

import {
  HTTP_STATUS,
  API_SUCCESS,
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

import {
  sendVisitCompletedNotification,
  shouldSendVisitNotification,
  buildVisitEmailDataExtended,
} from "@/lib/visit-notifications";

/**
 * GET /api/visits
 * Query params:
 * - customerId: Get visits for a specific customer
 * - zohoTaskId: Get visits for a specific Zoho task
 * - dealerVisits: Get dealer visits (for DealersPage)
 *   - ADMIN: Returns ALL visits created by DEALER users + clones by SELLERs
 *   - DEALER: Returns only visits created by the current user
 *   - SELLER: Returns visits assigned to them by DEALERs + their own clones
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const zohoTaskId = searchParams.get("zohoTaskId");
    const dealerVisits = searchParams.get("dealerVisits");
    // Keep backward compatibility with myVisits param
    const myVisits = searchParams.get("myVisits");

    // Para la página de DEALERS: obtener visitas según el rol
    if (dealerVisits === "true" || myVisits === "true") {
      // Obtener el rol del usuario actual
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!currentUser) {
        return unauthorizedResponse();
      }

      // ADMIN: puede ver visitas COMPLETADAS creadas por usuarios DEALER + clones de SELLERs
      // IMPORTANTE: NO mostrar visitas en BORRADOR del DEALER (solo el DEALER ve sus borradores)
      if (currentUser.role === Role.ADMIN) {
        const visits = await prisma.visit.findMany({
          where: {
            OR: [
              // Visitas originales creadas por DEALERs que NO están en BORRADOR
              // (COMPLETADA o EN_PROGRESO - este último se muestra cuando hay clon)
              {
                user: { role: Role.DEALER },
                status: { not: VisitStatus.BORRADOR },
              },
              // Clones creados por SELLERs (tienen clonedFromId)
              { clonedFromId: { not: null } },
            ],
          },
          include: VISIT_INCLUDE,
          orderBy: { visitDate: "desc" },
        });
        return createSuccessResponse({ visits, userRole: currentUser.role });
      }

      // DEALER: solo puede ver sus propias visitas
      if (currentUser.role === Role.DEALER) {
        const visits = await prisma.visit.findMany({
          where: {
            userId: session.user.id,
          },
          include: VISIT_INCLUDE,
          orderBy: { visitDate: "desc" },
        });
        return createSuccessResponse({ visits, userRole: currentUser.role });
      }

      // SELLER: sees ONLY original visits assigned to them by DEALERs that are NOT in BORRADOR
      // IMPORTANTE: NO mostrar visitas en BORRADOR del DEALER (solo el DEALER ve sus borradores)
      // Phase 4: Unified row logic - clones are accessed via the `clones` relation
      // The UI will show ONE row per dealer visit with dropdown options based on clone status
      if (currentUser.role === Role.SELLER) {
        const visits = await prisma.visit.findMany({
          where: {
            // Only original visits assigned to this SELLER by DEALERs
            assignedSellerId: session.user.id,
            user: { role: Role.DEALER },
            clonedFromId: null, // Only originals - clones are NOT shown as separate rows
            // FILTRO CRÍTICO: Solo visitas que NO están en BORRADOR
            // El DEALER debe haber enviado (COMPLETADA o EN_PROGRESO) para que el SELLER la vea
            status: { not: VisitStatus.BORRADOR },
          },
          include: VISIT_INCLUDE,
          orderBy: { visitDate: "desc" },
        });
        return createSuccessResponse({ visits, userRole: currentUser.role });
      }

      // Otros roles: sin acceso a esta funcionalidad
      return unauthorizedResponse();
    }

    if (!customerId && !zohoTaskId) {
      return badRequestResponse("CUSTOMER_ID_OR_TASK_ID");
    }

    const whereClause: any = {};
    if (customerId) {
      whereClause.customerId = customerId;
    }
    if (zohoTaskId) {
      whereClause.zohoTaskId = zohoTaskId;
    }

    const visits = await prisma.visit.findMany({
      where: whereClause,
      include: VISIT_INCLUDE,
      orderBy: { visitDate: "desc" },
    });

    return createSuccessResponse({ visits });
  } catch (error) {
    return serverErrorResponse("FETCH_VISITS", error);
  }
}

/**
 * POST /api/visits
 * Create a new visit
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { visitData, formularioData } = body as {
      visitData: CreateVisitData;
      formularioData?:
        | CreateFormularioCSSData
        | CreateFormularioIndustrialData
        | CreateFormularioLogisticaData
        | CreateFormularioStraddleCarrierData;
    };

    // Obtener el usuario actual para verificar su rol
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isDealer = currentUser?.role === "DEALER";

    // Para DEALERS: pueden crear visitas sin customerId ni zohoTaskId (documentación propia)
    // Para otros usuarios: deben proporcionar customerId O zohoTaskId
    if (!isDealer && !visitData.customerId && !visitData.zohoTaskId) {
      return badRequestResponse("CUSTOMER_ID_OR_TASK_ID");
    }

    // Si se proporcionan ambos, error
    if (visitData.customerId && visitData.zohoTaskId) {
      return badRequestResponse("ONLY_ONE_ASSOCIATION");
    }

    // Para DEALERS: validar que assignedSellerId esté presente
    if (isDealer && !visitData.assignedSellerId) {
      return badRequestResponse("ASSIGNED_SELLER_REQUIRED");
    }

    if (!visitData.formType) {
      return badRequestResponse("FORM_TYPE");
    }

    // Validar que el cliente existe si se proporciona customerId
    if (visitData.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: visitData.customerId },
      });

      if (!customer) {
        return notFoundResponse("CUSTOMER");
      }
    }

    // Validar que el vendedor asignado existe y pertenece a los sellers del DEALER
    if (visitData.assignedSellerId) {
      const sellerExists = await prisma.user.findFirst({
        where: {
          id: visitData.assignedSellerId,
          role: "SELLER",
          isActive: true,
        },
      });

      if (!sellerExists) {
        return notFoundResponse("ASSIGNED_SELLER");
      }
    }

    if (
      (visitData.formType === VisitFormType.ANALISIS_CSS ||
        visitData.formType === VisitFormType.ANALISIS_INDUSTRIAL ||
        visitData.formType === VisitFormType.ANALISIS_LOGISTICA ||
        visitData.formType === VisitFormType.ANALISIS_STRADDLE_CARRIER) &&
      !formularioData
    ) {
      return badRequestResponse("FORM_DATA");
    }

    let formDataCreate = {};
    if (visitData.formType === VisitFormType.ANALISIS_CSS && formularioData) {
      formDataCreate = {
        formularioCSSAnalisis: {
          create: buildFormularioCreate(
            formularioData as CreateFormularioCSSData,
          ),
        },
      };
    } else if (
      visitData.formType === VisitFormType.ANALISIS_INDUSTRIAL &&
      formularioData
    ) {
      formDataCreate = {
        formularioIndustrialAnalisis: {
          create: buildFormularioIndustrialCreate(
            formularioData as CreateFormularioIndustrialData,
          ),
        },
      };
    } else if (
      visitData.formType === VisitFormType.ANALISIS_LOGISTICA &&
      formularioData
    ) {
      formDataCreate = {
        formularioLogisticaAnalisis: {
          create: buildFormularioLogisticaCreate(
            formularioData as CreateFormularioLogisticaData,
          ),
        },
      };
    } else if (
      visitData.formType === VisitFormType.ANALISIS_STRADDLE_CARRIER &&
      formularioData
    ) {
      formDataCreate = {
        formularioStraddleCarrierAnalisis: {
          create: buildFormularioStraddleCarrierCreate(
            formularioData as CreateFormularioStraddleCarrierData,
          ),
        },
      };
    }

    const visit = await prisma.visit.create({
      data: {
        customerId: visitData.customerId,
        zohoTaskId: visitData.zohoTaskId,
        userId: session.user.id,
        formType: visitData.formType,
        status: visitData.status || VisitStatus.COMPLETADA,
        visitDate: visitData.visitDate || new Date(),
        // Para visitas creadas por DEALER: asignar vendedor
        assignedSellerId: visitData.assignedSellerId || null,
        ...formDataCreate,
      },
      include: VISIT_INCLUDE,
    });

    const finalStatus = visitData.status || VisitStatus.COMPLETADA;
    if (shouldSendVisitNotification(finalStatus) && formularioData) {
      // Get user role for email metadata
      const userRole = visit.user?.role as
        | "ADMIN"
        | "DEALER"
        | "SELLER"
        | undefined;

      // Determine context name (customer or task)
      let contextName = "";
      if (visitData.customerId && visit.customer) {
        contextName = visit.customer.accountName || "";
      } else if (visitData.zohoTaskId) {
        contextName = `#${visitData.zohoTaskId}`;
      }

      // Build email data with extended parameters
      const emailData = buildVisitEmailDataExtended({
        formType: visitData.formType,
        formularioData,
        visitDate: visitData.visitDate || new Date(),
        status: finalStatus,
        locale: visitData.locale || "es",
        visitId: visit.id,
        // Owner is the user who created the visit
        owner: visit.user
          ? {
              name: visit.user.name,
              email: visit.user.email,
              role: visit.user.role,
            }
          : undefined,
        // For DEALER: the dealer is the owner
        dealer:
          userRole === "DEALER" && visit.user
            ? {
                name: visit.user.name,
                email: visit.user.email,
              }
            : undefined,
        // Seller is either the owner (if SELLER) or the assigned seller (if DEALER created)
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
        customerName: contextName,
        submitterRole: userRole,
        isClone: false,
      });

      // Enviar notificacion de forma asincrona (no bloquea la respuesta)
      sendVisitCompletedNotification({ visitData: emailData })
        .then((result) => {
          if (result.success) {
            console.log(
              `[Email] Notificacion enviada para visita ${visit.id} (${finalStatus}):`,
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

    return createSuccessResponse(
      { message: API_SUCCESS.VISIT_CREATED, visit },
      HTTP_STATUS.CREATED,
    );
  } catch (error) {
    return serverErrorResponse("CREATE_VISIT", error);
  }
}
