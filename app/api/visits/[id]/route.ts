import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { VisitFormType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UpdateVisitData, CreateFormularioCSSData } from "@/interfaces/visits";
import {
  HTTP_STATUS,
  API_SUCCESS,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";
import {
  VISIT_INCLUDE,
  transformFormularioCSSData,
  buildFormularioUpsert,
} from "@/lib/visits";

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
      formularioData?: CreateFormularioCSSData;
    };

    const existingVisit = await prisma.visit.findUnique({
      where: { id },
      include: { formularioCSSAnalisis: true },
    });

    if (!existingVisit) {
      return notFoundResponse("VISIT");
    }

    const visit = await prisma.visit.update({
      where: { id },
      data: {
        ...(visitData?.status && { status: visitData.status }),
        ...(visitData?.visitDate && { visitDate: visitData.visitDate }),
        ...(existingVisit.formType === VisitFormType.ANALISIS_CSS &&
        formularioData
          ? {
              formularioCSSAnalisis: {
                upsert: buildFormularioUpsert(formularioData),
              },
            }
          : {}),
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
