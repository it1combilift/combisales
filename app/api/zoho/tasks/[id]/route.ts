import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createZohoCRMService } from "@/service/ZohoCRMService";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/zoho/tasks/[id]
 * Get a specific Zoho CRM task by ID
 * - ADMIN users: Can see any task
 * - SELLER users: Can only see their own tasks (Owner email must match)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (session.user.role !== Role.ADMIN && session.user.role !== Role.SELLER) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    const { id: taskId } = await params;

    const zohoService = await createZohoCRMService(session.user.id);
    if (!zohoService) {
      return NextResponse.json(
        {
          error: "No se pudo conectar con Zoho CRM",
          details:
            "No se encontraron credenciales válidas de Zoho para este usuario",
        },
        { status: 401 }
      );
    }

    const task = await zohoService.getTaskById(taskId);

    // SELLER users can only see their own tasks
    if (session.user.role === Role.SELLER) {
      if (task.Owner?.email !== session.user.email) {
        return NextResponse.json(
          { error: "No tienes permisos para ver esta tarea" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching Zoho task:", error);

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
        error: "Error al obtener tarea de Zoho CRM",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
