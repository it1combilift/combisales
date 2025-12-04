import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { VisitFormType, VisitStatus } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CreateVisitData, CreateFormularioCSSData } from "@/interfaces/visits";
import {
  HTTP_STATUS,
  API_SUCCESS,
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";
import { VISIT_INCLUDE, buildFormularioCreate } from "@/lib/visits";

/**
 * GET /api/visits?customerId=xxx
 * Get visits for a specific customer
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return badRequestResponse("CUSTOMER_ID");
    }

    const visits = await prisma.visit.findMany({
      where: { customerId },
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
 * Create a new visit with CSS form
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
      formularioData?: CreateFormularioCSSData;
    };

    if (!visitData.customerId || !visitData.formType) {
      return badRequestResponse("FORM_TYPE");
    }

    const customer = await prisma.customer.findUnique({
      where: { id: visitData.customerId },
    });

    if (!customer) {
      return notFoundResponse("CUSTOMER");
    }

    if (visitData.formType === VisitFormType.ANALISIS_CSS && !formularioData) {
      return badRequestResponse("CSS_FORM_DATA");
    }

    const visit = await prisma.visit.create({
      data: {
        customerId: visitData.customerId,
        userId: session.user.id,
        formType: visitData.formType,
        status: visitData.status || VisitStatus.COMPLETADA,
        visitDate: visitData.visitDate || new Date(),
        ...(visitData.formType === VisitFormType.ANALISIS_CSS && formularioData
          ? {
              formularioCSSAnalisis: {
                create: buildFormularioCreate(formularioData),
              },
            }
          : {}),
      },
      include: VISIT_INCLUDE,
    });

    return createSuccessResponse(
      { message: API_SUCCESS.VISIT_CREATED, visit },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return serverErrorResponse("CREATE_VISIT", error);
  }
}
