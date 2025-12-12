import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { VisitFormType, VisitStatus } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import {
  VISIT_INCLUDE,
  buildFormularioUpsert,
  buildFormularioIndustrialUpsert,
  buildFormularioLogisticaUpsert,
  buildFormularioStraddleCarrierUpsert,
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
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

import { sendVisitCompletedNotification } from "@/lib/visit-notifications";
import { VisitEmailData } from "@/interfaces/email";

/**
 * GET /api/visits/[id]
 * Get a specific visit by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Build form data based on type
    let formDataUpdate = {};
    if (
      existingVisit.formType === VisitFormType.ANALISIS_CSS &&
      formularioData
    ) {
      formDataUpdate = {
        formularioCSSAnalisis: {
          upsert: buildFormularioUpsert(
            formularioData as CreateFormularioCSSData
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
            formularioData as CreateFormularioIndustrialData
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
            formularioData as CreateFormularioLogisticaData
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
            formularioData as CreateFormularioStraddleCarrierData
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

    const wasCompleted = existingVisit.status === VisitStatus.COMPLETADA;
    const isNowCompleted = visitData?.status === VisitStatus.COMPLETADA;

    if (!wasCompleted && isNowCompleted && formularioData) {
      const archivos =
        (formularioData as CreateFormularioCSSData).archivos || [];

      const emailData: VisitEmailData = {
        razonSocial:
          (formularioData as CreateFormularioCSSData).razonSocial || "",
        personaContacto:
          (formularioData as CreateFormularioCSSData).personaContacto || "",
        email: (formularioData as CreateFormularioCSSData).email || "",
        direccion: (formularioData as CreateFormularioCSSData).direccion || "",
        localidad: (formularioData as CreateFormularioCSSData).localidad || "",
        provinciaEstado:
          (formularioData as CreateFormularioCSSData).provinciaEstado || "",
        pais: (formularioData as CreateFormularioCSSData).pais || "",
        descripcionProducto:
          (formularioData as CreateFormularioCSSData).descripcionProducto || "",
        formType: existingVisit.formType,
        visitDate: visit.visitDate,
        archivos,
        vendedor: visit.user
          ? {
              name: visit.user.name || "Sin nombre",
              email: visit.user.email || "",
            }
          : undefined,
      };

      // Enviar notificación de forma asíncrona
      sendVisitCompletedNotification({ visitData: emailData })
        .then((result) => {
          if (result.success) {
            console.log(
              `Notificación enviada para visita actualizada ${visit.id}:`,
              result.data?.id
            );
          } else {
            console.error(
              `Error enviando notificación para visita ${visit.id}:`,
              result.error
            );
          }
        })
        .catch((error) => {
          console.error(
            `Error inesperado enviando notificación para visita ${visit.id}:`,
            error
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
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const visit = await prisma.visit.findUnique({
      where: { id },
    });

    if (!visit) {
      return notFoundResponse("VISIT");
    }

    await prisma.visit.delete({
      where: { id },
    });

    return createSuccessResponse({ message: API_SUCCESS.VISIT_DELETED });
  } catch (error) {
    return serverErrorResponse("DELETE_VISIT", error);
  }
}
