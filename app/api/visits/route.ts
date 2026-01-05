import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { VisitFormType, VisitStatus } from "@prisma/client";
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
  buildVisitEmailData,
} from "@/lib/visit-notifications";

/**
 * GET /api/visits?customerId=xxx OR GET /api/visits?zohoTaskId=xxx
 * Get visits for a specific customer or task
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

    // Validar que se proporcione customerId O zohoTaskId, pero no ambos
    if (!visitData.customerId && !visitData.zohoTaskId) {
      return badRequestResponse("CUSTOMER_ID_OR_TASK_ID");
    }

    if (visitData.customerId && visitData.zohoTaskId) {
      return badRequestResponse("ONLY_ONE_ASSOCIATION");
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
            formularioData as CreateFormularioCSSData
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
            formularioData as CreateFormularioIndustrialData
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
            formularioData as CreateFormularioLogisticaData
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
            formularioData as CreateFormularioStraddleCarrierData
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
        ...formDataCreate,
      },
      include: VISIT_INCLUDE,
    });

    const finalStatus = visitData.status || VisitStatus.COMPLETADA;
    if (shouldSendVisitNotification(finalStatus) && formularioData) {
      let contextName = "Sin especificar";
      if (visitData.customerId && visit.customer) {
        contextName = visit.customer.accountName;
      } else if (visitData.zohoTaskId) {
        contextName = `#${visitData.zohoTaskId}`;
      }

      const emailData = buildVisitEmailData(
        visitData.formType,
        formularioData,
        visitData.visitDate || new Date(),
        finalStatus,
        visit.user
          ? {
              name: visit.user.name || "Sin nombre",
              email: visit.user.email || "",
            }
          : undefined,
        contextName,
        visitData.locale || "es"
      );

      // Enviar notificacion de forma asincrona (no bloquea la respuesta)
      sendVisitCompletedNotification({ visitData: emailData })
        .then((result) => {
          if (result.success) {
            console.log(
              `[Email] Notificacion enviada para visita ${visit.id} (${finalStatus}):`,
              result.data?.id,
              `Destinatarios: ${result.sentTo.join(", ")}`
            );
          } else {
            console.error(
              `[Email] Error enviando notificacion para visita ${visit.id}:`,
              result.error
            );
          }
        })
        .catch((error) => {
          console.error(
            `[Email] Error inesperado enviando notificacion para visita ${visit.id}:`,
            error
          );
        });
    }

    return createSuccessResponse(
      { message: API_SUCCESS.VISIT_CREATED, visit },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return serverErrorResponse("CREATE_VISIT", error);
  }
}
