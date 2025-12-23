import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createZohoCRMService } from "@/service/ZohoCRMService";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/zoho/contacts
 * Get Zoho CRM contacts with pagination, sorting, and search
 * - ADMIN users: See all contacts
 * - SELLER users: See only contacts from their accounts (filtered by Owner email)
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
    const accountId = searchParams.get("account_id");
    const email = searchParams.get("email");

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

    let contactsResponse;
    if (email && email.trim().length > 0) {
      contactsResponse = await zohoService.searchContactsByEmail(email);
    } else if (accountId && accountId.trim().length > 0) {
      contactsResponse = await zohoService.getContactsByAccountId(accountId, {
        page,
        per_page: perPage,
      });
    } else {
      contactsResponse = await zohoService.getContacts({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
    }

    let filteredContacts = contactsResponse.data;

    if (session.user.role === Role.SELLER) {
      const userEmail = session.user.email?.toLowerCase();
      filteredContacts = contactsResponse.data.filter(
        (contact) => contact.Owner?.email?.toLowerCase() === userEmail
      );
    }

    return NextResponse.json({
      contacts: filteredContacts,
      pagination: {
        page: contactsResponse.info.page,
        per_page: contactsResponse.info.per_page,
        count: filteredContacts.length,
        more_records: contactsResponse.info.more_records,
      },
    });
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
        error: "Error al obtener contactos de Zoho CRM",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
