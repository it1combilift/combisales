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
    if (!hasAnyRole(userRoles, [Role.ADMIN, Role.INSPECTOR])) {
      return unauthorizedResponse();
    }

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

    // Validate assigned inspector exists and has INSPECTOR role
    if (assignedInspectorId) {
      const inspector = await prisma.user.findUnique({
        where: { id: assignedInspectorId },
        select: { roles: true },
      });
      if (!inspector || !hasRole(inspector.roles, Role.INSPECTOR)) {
        return badRequestResponse("Invalid inspector assignment");
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        model,
        plate: plate.toUpperCase(),
        status: status || "ACTIVE",
        assignedInspectorId: assignedInspectorId || null,
        imageUrl: imageUrl || null,
        imageCloudinaryId: imageCloudinaryId || null,
      },
      include: {
        assignedInspector: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return createSuccessResponse(vehicle, HTTP_STATUS.CREATED);
  } catch (error) {
    return serverErrorResponse("CREATE_VEHICLE", error);
  }
}
