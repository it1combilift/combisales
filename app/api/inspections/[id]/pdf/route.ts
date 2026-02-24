import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { hasAnyRole, hasRole } from "@/lib/roles";
import { Role } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateInspectionPdf, InspectionPdfData } from "@/lib/inspection-pdf";

import {
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-response";

const INSPECTION_INCLUDE = {
  vehicle: {
    select: {
      model: true,
      plate: true,
      imageUrl: true,
      status: true,
    },
  },
  user: {
    select: { id: true, name: true, email: true, roles: true, image: true },
  },
  photos: {
    select: {
      photoType: true,
      cloudinaryUrl: true,
    },
  },
  approval: {
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  },
} as const;

// ==================== GET /api/inspections/[id]/pdf ====================
export async function GET(
  request: NextRequest,
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
      where: { id },
      include: INSPECTION_INCLUDE,
    });

    if (!inspection) return notFoundResponse("INSPECTION");

    // Non-ADMIN can only generate PDF for own inspections
    if (
      !hasRole(userRoles, Role.ADMIN) &&
      inspection.userId !== session.user.id
    ) {
      return unauthorizedResponse();
    }

    // Get locale from query params (default: es)
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") || "es") as "es" | "en";

    // Build PDF data
    const pdfData: InspectionPdfData = {
      id: inspection.id,
      mileage: inspection.mileage,
      status: inspection.status,
      observations: inspection.observations,
      signatureUrl: inspection.signatureUrl,
      createdAt: inspection.createdAt.toISOString(),
      // Checklist
      oilLevel: inspection.oilLevel,
      coolantLevel: inspection.coolantLevel,
      brakeFluidLevel: inspection.brakeFluidLevel,
      hydraulicLevel: inspection.hydraulicLevel,
      brakePedal: inspection.brakePedal,
      clutchPedal: inspection.clutchPedal,
      gasPedal: inspection.gasPedal,
      headlights: inspection.headlights,
      tailLights: inspection.tailLights,
      brakeLights: inspection.brakeLights,
      turnSignals: inspection.turnSignals,
      hazardLights: inspection.hazardLights,
      reversingLights: inspection.reversingLights,
      dashboardLights: inspection.dashboardLights,
      // Relations
      vehicle: {
        model: inspection.vehicle.model,
        plate: inspection.vehicle.plate,
        imageUrl: inspection.vehicle.imageUrl,
        status: inspection.vehicle.status,
      },
      user: {
        name: inspection.user.name,
        email: inspection.user.email,
        roles: inspection.user.roles,
        image: inspection.user.image,
      },
      photos: inspection.photos.map((p) => ({
        photoType: p.photoType,
        cloudinaryUrl: p.cloudinaryUrl,
      })),
      approval: inspection.approval
        ? {
            approved: inspection.approval.approved,
            comments: inspection.approval.comments,
            user: inspection.approval.user,
            createdAt: inspection.approval.createdAt.toISOString(),
          }
        : null,
    };

    // Generate PDF
    const pdfBuffer = await generateInspectionPdf(pdfData, locale);

    // Build filename
    const dateStr = new Date(inspection.createdAt)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    const filename = `inspection_${inspection.vehicle.plate.replace(/\s+/g, "_")}_${dateStr}.pdf`;

    // Return PDF as download
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating inspection PDF:", error);
    return serverErrorResponse("FETCH_INSPECTIONS", error);
  }
}
