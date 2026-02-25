import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { hasRole, hasAnyRole } from "@/lib/roles";
import { Role, InspectionStatus } from "@prisma/client";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import {
  API_SUCCESS,
  unauthorizedResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

const INSPECTION_INCLUDE = {
  vehicle: {
    include: {
      assignedInspector: {
        select: { id: true, name: true, email: true },
      },
    },
  },
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
} as const;

// ==================== GET /api/inspections/[id] ====================
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorizedResponse();

    const userRoles = session.user.roles as Role[];
    if (!hasAnyRole(userRoles, [Role.ADMIN, Role.INSPECTOR, Role.SELLER])) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const inspection = await prisma.inspection.findUnique({
      where: { id: parseInt(id, 10) },
      include: INSPECTION_INCLUDE,
    });

    if (!inspection) return notFoundResponse("INSPECTION");

    // Non-ADMIN can only see own inspections
    if (
      !hasRole(userRoles, Role.ADMIN) &&
      inspection.userId !== session.user.id
    ) {
      return unauthorizedResponse();
    }

    return createSuccessResponse(inspection);
  } catch (error) {
    return serverErrorResponse("FETCH_INSPECTIONS", error);
  }
}

// ==================== PUT /api/inspections/[id] ====================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorizedResponse();

    const { id } = await params;
    const userRoles = session.user.roles as Role[];

    if (!hasAnyRole(userRoles, [Role.ADMIN, Role.INSPECTOR, Role.SELLER])) {
      return unauthorizedResponse();
    }

    const existing = await prisma.inspection.findUnique({
      where: { id: parseInt(id, 10) },
      include: { photos: true },
    });

    if (!existing) return notFoundResponse("INSPECTION");

    // Only owner can edit, and only if PENDING
    if (
      !hasRole(userRoles, Role.ADMIN) &&
      existing.userId !== session.user.id
    ) {
      return unauthorizedResponse();
    }

    if (existing.status !== InspectionStatus.PENDING) {
      return badRequestResponse("Only pending inspections can be edited");
    }

    const body = await request.json();

    const inspection = await prisma.inspection.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(body.mileage !== undefined && { mileage: Number(body.mileage) }),
        ...(body.oilLevel !== undefined && {
          oilLevel: Boolean(body.oilLevel),
        }),
        ...(body.coolantLevel !== undefined && {
          coolantLevel: Boolean(body.coolantLevel),
        }),
        ...(body.brakeFluidLevel !== undefined && {
          brakeFluidLevel: Boolean(body.brakeFluidLevel),
        }),
        ...(body.hydraulicLevel !== undefined && {
          hydraulicLevel: Boolean(body.hydraulicLevel),
        }),
        ...(body.brakePedal !== undefined && {
          brakePedal: Boolean(body.brakePedal),
        }),
        ...(body.clutchPedal !== undefined && {
          clutchPedal: Boolean(body.clutchPedal),
        }),
        ...(body.gasPedal !== undefined && {
          gasPedal: Boolean(body.gasPedal),
        }),
        ...(body.headlights !== undefined && {
          headlights: Boolean(body.headlights),
        }),
        ...(body.tailLights !== undefined && {
          tailLights: Boolean(body.tailLights),
        }),
        ...(body.brakeLights !== undefined && {
          brakeLights: Boolean(body.brakeLights),
        }),
        ...(body.turnSignals !== undefined && {
          turnSignals: Boolean(body.turnSignals),
        }),
        ...(body.hazardLights !== undefined && {
          hazardLights: Boolean(body.hazardLights),
        }),
        ...(body.reversingLights !== undefined && {
          reversingLights: Boolean(body.reversingLights),
        }),
        ...(body.dashboardLights !== undefined && {
          dashboardLights: Boolean(body.dashboardLights),
        }),
        ...(body.observations !== undefined && {
          observations: body.observations || null,
        }),
        ...(body.signatureUrl !== undefined && {
          signatureUrl: body.signatureUrl,
        }),
        ...(body.signatureCloudinaryId !== undefined && {
          signatureCloudinaryId: body.signatureCloudinaryId,
        }),
      },
      include: INSPECTION_INCLUDE,
    });

    return createSuccessResponse(inspection);
  } catch (error) {
    return serverErrorResponse("UPDATE_INSPECTION", error);
  }
}

// ==================== DELETE /api/inspections/[id] ====================
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorizedResponse();

    const { id } = await params;
    const userRoles = session.user.roles as Role[];

    if (!hasAnyRole(userRoles, [Role.ADMIN, Role.INSPECTOR, Role.SELLER])) {
      return unauthorizedResponse();
    }

    const existing = await prisma.inspection.findUnique({
      where: { id: parseInt(id, 10) },
      include: { photos: true },
    });

    if (!existing) return notFoundResponse("INSPECTION");

    // ADMIN can delete any, INSPECTOR only own + pending
    if (!hasRole(userRoles, Role.ADMIN)) {
      if (existing.userId !== session.user.id) return unauthorizedResponse();
      if (existing.status !== InspectionStatus.PENDING) {
        return badRequestResponse("Only pending inspections can be deleted");
      }
    }

    // Delete photos from Cloudinary
    for (const photo of existing.photos) {
      try {
        await deleteFromCloudinary(photo.cloudinaryId, "image");
      } catch (err) {
        console.error(`Failed to delete photo ${photo.cloudinaryId}:`, err);
      }
    }

    // Delete signature from Cloudinary
    if (existing.signatureCloudinaryId) {
      try {
        await deleteFromCloudinary(existing.signatureCloudinaryId, "image");
      } catch (err) {
        console.error(`Failed to delete signature:`, err);
      }
    }

    await prisma.inspection.delete({ where: { id: parseInt(id, 10) } });

    return createSuccessResponse({
      message: API_SUCCESS.INSPECTION_DELETED,
    });
  } catch (error) {
    return serverErrorResponse("DELETE_INSPECTION", error);
  }
}
