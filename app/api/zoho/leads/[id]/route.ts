import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createZohoCRMService } from "@/service/ZohoCRMService";
import { Role } from "@prisma/client";
import { hasRole, hasAnyRole } from "@/lib/roles";

/**
 * GET /api/zoho/leads/[id]
 * Get a specific Zoho CRM lead by ID
 * - ADMIN users: Can see any lead
 * - SELLER users: Can only see their own leads (Owner email must match)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!hasAnyRole(session.user.roles, [Role.ADMIN, Role.SELLER])) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id: leadId } = await params;

    const zohoService = await createZohoCRMService(session.user.id);
    if (!zohoService) {
      return NextResponse.json(
        {
          error: "No se pudo conectar con Zoho CRM",
          details:
            "Tokens de Zoho no válidos. Intente cerrar sesión y volver a iniciar.",
        },
        { status: 401 },
      );
    }

    const lead = await zohoService.getLeadById(leadId);

    // SELLER users can only see their own leads
    if (hasRole(session.user.roles, Role.SELLER)) {
      if (lead.Owner?.email !== session.user.email) {
        return NextResponse.json(
          { error: "No tiene permisos para ver este lead" },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error fetching lead:", error);

    // Handle "not found" errors
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Lead no encontrado" },
          { status: 404 },
        );
      }
      if (error.message.includes("ZOHO_NO_PERMISSION")) {
        return NextResponse.json(
          {
            error: "Sin permisos de API en Zoho CRM",
            details: error.message,
          },
          { status: 403 },
        );
      }
    }

    return NextResponse.json(
      {
        error: "Error al obtener el lead",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
