import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";
import { hasRole, hasAnyRole } from "@/lib/roles";

import {
  HTTP_STATUS,
  API_SUCCESS,
  unauthorizedResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

// ==================== GET /api/vehicles/[id] ====================
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorizedResponse();

    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        assignedInspector: {
          select: { id: true, name: true, email: true },
        },
        inspections: {
          select: {
            id: true,
            mileage: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!vehicle) return notFoundResponse("VEHICLE");

    return createSuccessResponse(vehicle);
  } catch (error) {
    return serverErrorResponse("FETCH_VEHICLES", error);
  }
}

// ==================== PUT /api/vehicles/[id] ====================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorizedResponse();

    const userRoles = session.user.roles as Role[];
    if (!hasRole(userRoles, Role.ADMIN)) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const {
      model,
      plate,
      status,
      assignedInspectorId,
      imageUrl,
      imageCloudinaryId,
      force,
    } = body;

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("VEHICLE");

    // Check plate uniqueness if changing
    if (plate && plate.toUpperCase() !== existing.plate) {
      const duplicate = await prisma.vehicle.findUnique({
        where: { plate: plate.toUpperCase() },
      });
      if (duplicate) {
        return badRequestResponse("A vehicle with this plate already exists");
      }
    }

    // Validate assignee if assigning
    if (assignedInspectorId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assignedInspectorId },
        select: { roles: true },
      });
      if (
        !assignee ||
        !hasAnyRole(assignee.roles, [Role.INSPECTOR, Role.SELLER])
      ) {
        return badRequestResponse(
          "Invalid assignment: user must be an Inspector or Seller",
        );
      }

      // Prevent reassigning a vehicle that is currently assigned to another user (unless force=true)
      if (
        !force &&
        existing.assignedInspectorId &&
        existing.assignedInspectorId !== assignedInspectorId
      ) {
        return badRequestResponse(
          "This vehicle is already assigned to another user. Use force=true to override.",
        );
      }

      // SELLER can only have 1 vehicle assigned (exclude current vehicle being edited)
      if (
        hasRole(assignee.roles, Role.SELLER) &&
        !hasRole(assignee.roles, Role.INSPECTOR)
      ) {
        const existingVehicle = await prisma.vehicle.findFirst({
          where: {
            assignedInspectorId,
            id: { not: id },
          },
        });
        if (existingVehicle) {
          return badRequestResponse(
            "This Seller already has a vehicle assigned. Sellers can only have 1 vehicle.",
          );
        }
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(model && { model }),
        ...(plate && { plate: plate.toUpperCase() }),
        ...(status !== undefined && { status }),
        ...(assignedInspectorId !== undefined && { assignedInspectorId }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(imageCloudinaryId !== undefined && { imageCloudinaryId }),
      },
      include: {
        assignedInspector: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return createSuccessResponse(vehicle);
  } catch (error) {
    return serverErrorResponse("UPDATE_VEHICLE", error);
  }
}

// ==================== DELETE /api/vehicles/[id] ====================
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorizedResponse();

    const userRoles = session.user.roles as Role[];
    if (!hasRole(userRoles, Role.ADMIN)) return unauthorizedResponse();

    const { id } = await params;

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("VEHICLE");

    await prisma.vehicle.delete({ where: { id } });

    return createSuccessResponse({
      message: API_SUCCESS.VEHICLE_DELETED,
    });
  } catch (error) {
    return serverErrorResponse("DELETE_VEHICLE", error);
  }
}
