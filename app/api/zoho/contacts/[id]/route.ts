import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createZohoCRMService } from "@/service/ZohoCRMService";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hasRole, hasAnyRole } from "@/lib/roles";

/**
 * GET /api/zoho/contacts/[id]
 * Get a specific Zoho CRM contact by ID
 * - ADMIN users: Can see any contact
 * - SELLER users: Can only see contacts from their accounts (Owner email must match)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: contactId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!hasAnyRole(session.user.roles, [Role.ADMIN, Role.SELLER])) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    const zohoService = await createZohoCRMService(session.user.id);
    if (!zohoService) {
      return NextResponse.json(
        {
          error:
            "No se pudo conectar con Zoho CRM. Verifica tu conexión con Zoho.",
        },
        { status: 503 },
      );
    }

    const contact = await zohoService.getContactById(contactId);

    if (
      hasRole(session.user.roles, Role.SELLER) &&
      !hasRole(session.user.roles, Role.ADMIN)
    ) {
      const userEmail = session.user.email?.toLowerCase();
      const ownerEmail = contact.Owner?.email?.toLowerCase();

      if (ownerEmail !== userEmail) {
        return NextResponse.json(
          { error: "No tienes permiso para ver este contacto." },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("Error fetching Zoho contact:", error);

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
        error: "Error al obtener contacto de Zoho CRM",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
