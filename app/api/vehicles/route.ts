import { prisma } from "@/lib/prisma";
import { Role, VehicleStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { hasRole, hasAnyRole } from "@/lib/roles";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import {
  HTTP_STATUS,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

// ==================== GET /api/vehicles ====================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorizedResponse();

    const userRoles = session.user.roles as Role[];
    if (!hasAnyRole(userRoles, [Role.ADMIN, Role.INSPECTOR, Role.SELLER])) {
      return unauthorizedResponse();
    }

    // ADMIN sees all vehicles; INSPECTOR/SELLER see only their assigned vehicles
    const where = hasRole(userRoles, Role.ADMIN)
      ? {}
      : { assignedInspectorId: session.user.id };

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        assignedInspector: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: { inspections: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return createSuccessResponse(vehicles);
  } catch (error) {
    return serverErrorResponse("FETCH_VEHICLES", error);
  }
}

// ==================== POST /api/vehicles ====================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorizedResponse();

    const userRoles = session.user.roles as Role[];
    if (!hasRole(userRoles, Role.ADMIN)) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      model,
      plate,
      status,
      assignedInspectorId,
      imageUrl,
      imageCloudinaryId,
    } = body;

    if (!model || !plate) {
      return badRequestResponse("Model and plate are required");
    }

    // Check plate uniqueness
    const existing = await prisma.vehicle.findUnique({ where: { plate } });
    if (existing) {
      return badRequestResponse("A vehicle with this plate already exists");
    }

    // Validate assigned user exists and has INSPECTOR or SELLER role
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

      // SELLER can only have 1 vehicle assigned
      if (
        hasRole(assignee.roles, Role.SELLER) &&
        !hasRole(assignee.roles, Role.INSPECTOR)
      ) {
        const existingVehicle = await prisma.vehicle.findFirst({
          where: { assignedInspectorId },
        });
        if (existingVehicle) {
          return badRequestResponse(
            "This Seller already has a vehicle assigned. Sellers can only have 1 vehicle.",
          );
        }
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        model,
        plate: plate.toUpperCase(),
        status: status || VehicleStatus.ACTIVE,
        assignedInspectorId: assignedInspectorId || null,
        imageUrl: imageUrl || null,
        imageCloudinaryId: imageCloudinaryId || null,
      },
      include: {
        assignedInspector: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return createSuccessResponse(vehicle, HTTP_STATUS.CREATED);
  } catch (error) {
    return serverErrorResponse("CREATE_VEHICLE", error);
  }
}
