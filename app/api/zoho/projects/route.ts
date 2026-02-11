import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createZohoCRMService } from "@/service/ZohoCRMService";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hasRole, hasAnyRole } from "@/lib/roles";

/**
 * GET /api/zoho/projects
 * Get Zoho CRM projects (Deals) with pagination, sorting, and search
 * - ADMIN users: See all projects
 * - SELLER users: See only projects from their accounts (filtered by Owner email)
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!hasAnyRole(session.user.roles, [Role.ADMIN, Role.SELLER])) {
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

    const zohoService = await createZohoCRMService(session.user.id);
    if (!zohoService) {
      return NextResponse.json(
        {
          error: "No se pudo conectar con Zoho CRM",
          details:
            "No se encontraron credenciales válidas de Zoho para este usuario",
        },
        { status: 401 },
      );
    }

    let dealsResponse;

    // Priority: accountId > search > all
    if (accountId && accountId.trim().length > 0) {
      dealsResponse = await zohoService.getDealsByAccountId(accountId, {
        page,
        per_page: perPage,
      });
    } else if (search && search.trim().length > 0) {
      dealsResponse = await zohoService.searchDeals(search.trim(), {
        page,
        per_page: perPage,
      });
    } else {
      dealsResponse = await zohoService.getDeals({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
    }

    let filteredDeals = dealsResponse.data;

    // SELLER users can only see deals they own
    if (
      hasRole(session.user.roles, Role.SELLER) &&
      !hasRole(session.user.roles, Role.ADMIN)
    ) {
      filteredDeals = filteredDeals.filter(
        (deal) => deal.Owner?.email === session.user.email,
      );
    }

    return NextResponse.json({
      projects: filteredDeals,
      info: {
        ...dealsResponse.info,
        count: filteredDeals.length,
      },
    });
  } catch (error) {
    console.error("Error fetching Zoho projects:", error);

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
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error: "Error al obtener proyectos de Zoho CRM",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
