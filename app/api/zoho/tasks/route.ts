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

    if (session.user.role !== Role.ADMIN && session.user.role !== Role.SELLER) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "200");
    const sortBy = searchParams.get("sort_by") || "Modified_Time";
    const sortOrder = (searchParams.get("sort_order") || "desc") as
      | "asc"
      | "desc";
    const search = searchParams.get("search");
    const accountId = searchParams.get("account_id");
    const contactId = searchParams.get("contact_id");

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

    let tasksResponse;

    // Priority: accountId > contactId > search > all
    if (accountId && accountId.trim().length > 0) {
      tasksResponse = await zohoService.getTasksByAccountId(accountId, {
        page,
        per_page: perPage,
      });
    } else if (contactId && contactId.trim().length > 0) {
      tasksResponse = await zohoService.getTasksByContactId(contactId, {
        page,
        per_page: perPage,
      });
    } else if (search && search.trim().length > 0) {
      tasksResponse = await zohoService.searchTasks(search.trim(), {
        page,
        per_page: perPage,
      });
    } else {
      tasksResponse = await zohoService.getTasks({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
    }

    let filteredTasks = tasksResponse.data;

    // SELLER users can only see tasks they own
    if (session.user.role === Role.SELLER) {
      filteredTasks = filteredTasks.filter(
        (task) => task.Owner?.email === session.user.email
      );
    }

    return NextResponse.json({
      tasks: filteredTasks,
      info: {
        ...tasksResponse.info,
        count: filteredTasks.length,
      },
    });
  } catch (error) {
    console.error("Error fetching Zoho tasks:", error);

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
