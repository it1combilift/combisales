import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { Role, InspectionStatus } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendInspectionApprovedEmail } from "@/lib/inspection-notifications";

import {
  API_SUCCESS,
  unauthorizedResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

// ==================== POST /api/inspections/[id]/approve ====================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorizedResponse();

    const userRoles = session.user.roles as Role[];
    if (!hasRole(userRoles, Role.ADMIN)) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const { approved, comments } = body;

    if (typeof approved !== "boolean") {
      return badRequestResponse("approved field is required (boolean)");
    }

    // Require comments when rejecting
    if (!approved && (!comments || comments.trim().length === 0)) {
      return badRequestResponse("Comments are required when rejecting");
    }

    const inspection = await prisma.inspection.findUnique({
      where: { id: parseInt(id, 10) },
      include: { approval: true },
    });

    if (!inspection) return notFoundResponse("INSPECTION");

    if (inspection.status !== InspectionStatus.PENDING) {
      return badRequestResponse(
        "Only pending inspections can be approved/rejected",
      );
    }

    // Create or update approval and update inspection status
    const updatedInspection = await prisma.$transaction(async (tx) => {
      // Upsert approval
      await tx.inspectionApproval.upsert({
        where: { inspectionId: parseInt(id, 10) },
        create: {
          inspectionId: parseInt(id, 10),
          userId: session.user.id,
          approved,
          comments: comments || null,
        },
        update: {
          userId: session.user.id,
          approved,
          comments: comments || null,
        },
      });

      // Update inspection status
      return tx.inspection.update({
        where: { id: parseInt(id, 10) },
        data: {
          status: approved
            ? InspectionStatus.APPROVED
            : InspectionStatus.REJECTED,
        },
        include: {
          vehicle: true,
          user: {
            select: { id: true, name: true, email: true, roles: true },
          },
          photos: true,
          approval: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });
    });

    // Send notification email to inspector
    try {
      await sendInspectionApprovedEmail(updatedInspection);
    } catch (emailError) {
      console.error("Failed to send approval notification email:", emailError);
    }

    return createSuccessResponse({
      message: approved
        ? API_SUCCESS.INSPECTION_APPROVED
        : API_SUCCESS.INSPECTION_REJECTED,
      inspection: updatedInspection,
    });
  } catch (error) {
    return serverErrorResponse("APPROVE_INSPECTION", error);
  }
}
