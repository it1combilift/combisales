import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createZohoCRMService } from "@/service/ZohoCRMService";
import { Role } from "@prisma/client";

/**
 * GET /api/zoho/leads
 * Get Zoho CRM leads with pagination, sorting, and search
 * - ADMIN users: See all leads
 * - SELLER users: See only leads from their accounts (filtered by Owner email)
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (session.user.role !== Role.ADMIN && session.user.role !== Role.SELLER) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "200");
    const sortBy = searchParams.get("sort_by") || "Modified_Time";
    const sortOrder = (searchParams.get("sort_order") || "desc") as
      | "asc"
      | "desc";
    const search = searchParams.get("search");

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

    let response;
    if (search) {
      response = await zohoService.searchLeads(search, {
        page,
        per_page: perPage,
      });
    } else {
      response = await zohoService.getLeads({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
    }

    // For SELLER users, filter leads by owner email
    let leads = response.data || [];
    if (session.user.role === Role.SELLER && session.user.email) {
      leads = leads.filter((lead) => lead.Owner?.email === session.user.email);
    }

    return NextResponse.json({
      leads,
      info: {
        ...response.info,
        // Update count after filtering for SELLER
        count:
          session.user.role === Role.SELLER
            ? leads.length
            : response.info.count,
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);

    if (error instanceof Error) {
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
        error: "Error al obtener los leads",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
