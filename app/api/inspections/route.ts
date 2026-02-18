import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role, InspectionPhotoType } from "@prisma/client";
import { hasRole, hasAnyRole } from "@/lib/roles";

import {
  HTTP_STATUS,
  API_SUCCESS,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

import { sendInspectionCreatedEmail } from "@/lib/inspection-notifications";

// Include object for full inspection data
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

// ==================== GET /api/inspections ====================
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorizedResponse();

    const userRoles = session.user.roles as Role[];
    if (!hasAnyRole(userRoles, [Role.ADMIN, Role.INSPECTOR])) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const vehicleId = searchParams.get("vehicleId");

    // ADMIN sees all, INSPECTOR sees only own
    const where: Record<string, unknown> = {};
    if (!hasRole(userRoles, Role.ADMIN)) {
      where.userId = session.user.id;
    }
    if (status) where.status = status;
    if (vehicleId) where.vehicleId = vehicleId;

    const inspections = await prisma.inspection.findMany({
      where,
      include: INSPECTION_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    return createSuccessResponse(inspections);
  } catch (error) {
    return serverErrorResponse("FETCH_INSPECTIONS", error);
  }
}

// ==================== POST /api/inspections ====================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorizedResponse();

    const userRoles = session.user.roles as Role[];
    if (!hasAnyRole(userRoles, [Role.ADMIN, Role.INSPECTOR])) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      vehicleId,
      mileage,
      // Checklist
      oilLevel,
      coolantLevel,
      brakeFluidLevel,
      hydraulicLevel,
      brakePedal,
      clutchPedal,
      gasPedal,
      headlights,
      tailLights,
      brakeLights,
      turnSignals,
      hazardLights,
      reversingLights,
      dashboardLights,
      // Additional
      observations,
      signatureUrl,
      signatureCloudinaryId,
      // Photos
      photos,
    } = body;

    if (!vehicleId || !mileage) {
      return badRequestResponse("vehicleId and mileage are required");
    }

    if (!photos || !Array.isArray(photos) || photos.length < 6) {
      return badRequestResponse("All 6 photos are required");
    }

    if (!signatureUrl) {
      return badRequestResponse("Signature is required");
    }

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) {
      return badRequestResponse("Vehicle not found");
    }

    // Create inspection with photos
    const inspection = await prisma.inspection.create({
      data: {
        vehicleId,
        userId: session.user.id,
        mileage: Number(mileage),
        // Checklist
        oilLevel: Boolean(oilLevel),
        coolantLevel: Boolean(coolantLevel),
        brakeFluidLevel: Boolean(brakeFluidLevel),
        hydraulicLevel: Boolean(hydraulicLevel),
        brakePedal: Boolean(brakePedal),
        clutchPedal: Boolean(clutchPedal),
        gasPedal: Boolean(gasPedal),
        headlights: Boolean(headlights),
        tailLights: Boolean(tailLights),
        brakeLights: Boolean(brakeLights),
        turnSignals: Boolean(turnSignals),
        hazardLights: Boolean(hazardLights),
        reversingLights: Boolean(reversingLights),
        dashboardLights: Boolean(dashboardLights),
        // Additional
        observations: observations || null,
        signatureUrl,
        signatureCloudinaryId: signatureCloudinaryId || null,
        // Photos
        photos: {
          create: photos.map(
            (photo: {
              photoType: string;
              cloudinaryId: string;
              cloudinaryUrl: string;
              cloudinaryType: string;
              format: string;
              width?: number;
              height?: number;
              size: number;
            }) => ({
              photoType: photo.photoType as InspectionPhotoType,
              cloudinaryId: photo.cloudinaryId,
              cloudinaryUrl: photo.cloudinaryUrl,
              cloudinaryType: photo.cloudinaryType,
              format: photo.format,
              width: photo.width || null,
              height: photo.height || null,
              size: photo.size,
            }),
          ),
        },
      },
      include: INSPECTION_INCLUDE,
    });

    // Send notification email to admins
    try {
      await sendInspectionCreatedEmail(inspection);
    } catch (emailError) {
      console.error(
        "Failed to send inspection notification email:",
        emailError,
      );
    }

    return createSuccessResponse(inspection, HTTP_STATUS.CREATED);
  } catch (error) {
    return serverErrorResponse("CREATE_INSPECTION", error);
  }
}
