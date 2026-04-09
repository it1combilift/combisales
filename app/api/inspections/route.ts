import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { hasRole, hasAnyRole } from "@/lib/roles";
import { Role, InspectionPhotoType } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendInspectionCreatedEmail } from "@/lib/inspection-notifications";

import {
  HTTP_STATUS,
  unauthorizedResponse,
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
    select: { id: true, name: true, email: true, roles: true, image: true },
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

const CHECKLIST_COMMENT_RULES = [
  {
    statusKey: "oilLevel",
    commentKey: "oilLevelComment",
    label: "Nivel de Aceite",
  },
  {
    statusKey: "coolantLevel",
    commentKey: "coolantLevelComment",
    label: "Nivel de Refrigerante",
  },
  {
    statusKey: "brakeFluidLevel",
    commentKey: "brakeFluidLevelComment",
    label: "Nivel de Liquido de Frenos",
  },
  {
    statusKey: "hydraulicLevel",
    commentKey: "hydraulicLevelComment",
    label: "Nivel de Fluido Hidraulico",
  },
  {
    statusKey: "brakePedal",
    commentKey: "brakePedalComment",
    label: "Pedal de Freno",
  },
  {
    statusKey: "clutchPedal",
    commentKey: "clutchPedalComment",
    label: "Pedal de Embrague",
  },
  {
    statusKey: "gasPedal",
    commentKey: "gasPedalComment",
    label: "Pedal de Acelerador",
  },
  {
    statusKey: "headlights",
    commentKey: "headlightsComment",
    label: "Luces Delanteras",
  },
  {
    statusKey: "tailLights",
    commentKey: "tailLightsComment",
    label: "Luces Traseras",
  },
  {
    statusKey: "brakeLights",
    commentKey: "brakeLightsComment",
    label: "Luces de Freno",
  },
  {
    statusKey: "turnSignals",
    commentKey: "turnSignalsComment",
    label: "Intermitentes",
  },
  {
    statusKey: "hazardLights",
    commentKey: "hazardLightsComment",
    label: "Luces de Emergencia",
  },
  {
    statusKey: "reversingLights",
    commentKey: "reversingLightsComment",
    label: "Luces de Marcha Atras",
  },
  {
    statusKey: "dashboardLights",
    commentKey: "dashboardLightsComment",
    label: "Luces del Tablero",
  },
] as const;

function normalizeOptionalText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// ==================== GET /api/inspections ====================
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorizedResponse();

    const userRoles = session.user.roles as Role[];
    if (!hasAnyRole(userRoles, [Role.ADMIN, Role.INSPECTOR, Role.SELLER])) {
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
    if (!hasAnyRole(userRoles, [Role.ADMIN, Role.INSPECTOR, Role.SELLER])) {
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
      // Checklist comments
      oilLevelComment,
      coolantLevelComment,
      brakeFluidLevelComment,
      hydraulicLevelComment,
      brakePedalComment,
      clutchPedalComment,
      gasPedalComment,
      headlightsComment,
      tailLightsComment,
      brakeLightsComment,
      turnSignalsComment,
      hazardLightsComment,
      reversingLightsComment,
      dashboardLightsComment,
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

    if (!photos || !Array.isArray(photos) || photos.length < 10) {
      return badRequestResponse("All 10 photos are required");
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

    // Non-ADMIN users can only create inspections for vehicles assigned to them
    if (!hasRole(userRoles, Role.ADMIN)) {
      if (vehicle.assignedInspectorId !== session.user.id) {
        return badRequestResponse(
          "You can only create inspections for vehicles assigned to you",
        );
      }
    }

    const checklistStatus = {
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
    };

    const checklistComments = {
      oilLevelComment: normalizeOptionalText(oilLevelComment),
      coolantLevelComment: normalizeOptionalText(coolantLevelComment),
      brakeFluidLevelComment: normalizeOptionalText(brakeFluidLevelComment),
      hydraulicLevelComment: normalizeOptionalText(hydraulicLevelComment),
      brakePedalComment: normalizeOptionalText(brakePedalComment),
      clutchPedalComment: normalizeOptionalText(clutchPedalComment),
      gasPedalComment: normalizeOptionalText(gasPedalComment),
      headlightsComment: normalizeOptionalText(headlightsComment),
      tailLightsComment: normalizeOptionalText(tailLightsComment),
      brakeLightsComment: normalizeOptionalText(brakeLightsComment),
      turnSignalsComment: normalizeOptionalText(turnSignalsComment),
      hazardLightsComment: normalizeOptionalText(hazardLightsComment),
      reversingLightsComment: normalizeOptionalText(reversingLightsComment),
      dashboardLightsComment: normalizeOptionalText(dashboardLightsComment),
    };

    for (const rule of CHECKLIST_COMMENT_RULES) {
      if (
        !checklistStatus[rule.statusKey] &&
        !checklistComments[rule.commentKey]
      ) {
        return badRequestResponse(`Comment is required for ${rule.label}`);
      }
    }

    const checklistFailureNotes = CHECKLIST_COMMENT_RULES.filter(
      (rule) => !checklistStatus[rule.statusKey],
    )
      .map((rule) => {
        const note = checklistComments[rule.commentKey];
        if (!note) {
          return null;
        }

        return `- ${rule.label}: ${note}`;
      })
      .filter((note): note is string => Boolean(note));

    const failureBlock = checklistFailureNotes.length
      ? ["Observaciones de Checklist (Fallo):", ...checklistFailureNotes].join(
          "\n",
        )
      : "";

    const normalizedObservation = normalizeOptionalText(observations);
    const mergedObservations = [normalizedObservation, failureBlock]
      .filter(Boolean)
      .join("\n\n");

    // Create inspection with photos
    const inspection = await prisma.inspection.create({
      data: {
        vehicleId,
        userId: session.user.id,
        mileage: Number(mileage),
        // Checklist
        oilLevel: checklistStatus.oilLevel,
        coolantLevel: checklistStatus.coolantLevel,
        brakeFluidLevel: checklistStatus.brakeFluidLevel,
        hydraulicLevel: checklistStatus.hydraulicLevel,
        brakePedal: checklistStatus.brakePedal,
        clutchPedal: checklistStatus.clutchPedal,
        gasPedal: checklistStatus.gasPedal,
        headlights: checklistStatus.headlights,
        tailLights: checklistStatus.tailLights,
        brakeLights: checklistStatus.brakeLights,
        turnSignals: checklistStatus.turnSignals,
        hazardLights: checklistStatus.hazardLights,
        reversingLights: checklistStatus.reversingLights,
        dashboardLights: checklistStatus.dashboardLights,
        // Additional
        observations: mergedObservations || null,
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
