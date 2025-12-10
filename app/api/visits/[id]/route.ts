import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { VisitFormType } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  VISIT_INCLUDE,
  buildFormularioUpsert,
  buildFormularioIndustrialUpsert,
} from "@/lib/visits";
import {
  UpdateVisitData,
  CreateFormularioCSSData,
  CreateFormularioIndustrialData,
} from "@/interfaces/visits";

import {
  API_SUCCESS,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

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
      formularioData?: CreateFormularioCSSData | CreateFormularioIndustrialData;
    };

    const existingVisit = await prisma.visit.findUnique({
      where: { id },
      include: {
        formularioCSSAnalisis: true,
        formularioIndustrialAnalisis: true,
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
