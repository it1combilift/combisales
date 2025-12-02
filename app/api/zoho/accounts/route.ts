import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createZohoCRMService } from "@/service/ZohoCRMService";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/zoho/accounts
 * Get Zoho CRM accounts with pagination, sorting, and search
 * - ADMIN users: See all accounts
 * - SELLER users: See only their own accounts (filtered by Owner email)
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
    const perPage = parseInt(searchParams.get("per_page") || "50");
    const sortBy = searchParams.get("sort_by") || "Modified_Time";
    const sortOrder = (searchParams.get("sort_order") || "desc") as
      | "asc"
      | "desc";
    const search = searchParams.get("search");

    const zohoService = await createZohoCRMService(session.user.id);
    if (!zohoService) {
      return NextResponse.json(
        {
          error:
            "No se pudo conectar con Zoho CRM. Verifica tu conexión con Zoho.",
        },
        { status: 503 }
      );
    }

    let accountsResponse;

    if (search && search.trim().length > 0) {
      accountsResponse = await zohoService.searchAccounts(search, {
        page,
        per_page: perPage,
      });
    } else {
      accountsResponse = await zohoService.getAccounts({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
    }

    let filteredAccounts = accountsResponse.data;

    if (session.user.role === Role.SELLER) {
      const userEmail = session.user.email?.toLowerCase();
      filteredAccounts = accountsResponse.data.filter(
        (account) => account.Owner?.email?.toLowerCase() === userEmail
      );
    }

    return NextResponse.json({
      accounts: filteredAccounts,
      pagination: {
        page: accountsResponse.info.page,
        per_page: accountsResponse.info.per_page,
        count: filteredAccounts.length,
        more_records: accountsResponse.info.more_records,
      },
    });
  } catch (error) {
    console.error("Error fetching Zoho accounts:", error);

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
        error: "Error al obtener clientes de Zoho CRM",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
