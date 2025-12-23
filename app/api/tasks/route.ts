import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createZohoCRMService } from "@/service/ZohoCRMService";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/zoho/tasks
 * Get Zoho CRM tasks with pagination, sorting, and search
 * - ADMIN users: See all tasks
 * - SELLER users: See only tasks from their accounts (filtered by Owner email)
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

      if (!session?.user) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
      }

      if (
        session.user.role !== Role.ADMIN &&
        session.user.role !== Role.SELLER
      ) {
        return NextResponse.json({ error: "No autorizado." }, { status: 403 });
      }

  } catch (error) {
    console.error("Error fetching Zoho contacts:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("ZOHO_NO_PERMISSION")) {
      return NextResponse.json(
        {
          error: "Permisos de API no habilitados en Zoho CRM",
          details:
            "Tu usuario de Zoho no tiene permisos para acceder a la API. Contacta al administrador de Zoho CRM para habilitar 'API Access' en tu perfil de usuario.",
          helpUrl:
            "https://help.zoho.com/portal/en/kb/crm/developer-guide/api/articles/api-access-control",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Error al obtener tareas de Zoho CRM",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
