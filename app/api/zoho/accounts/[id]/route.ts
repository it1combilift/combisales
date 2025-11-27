import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createZohoCRMService } from "@/service/ZohoCRMService";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/zoho/accounts/[id]
 * Get a specific Zoho CRM account by ID
 * - ADMIN users: Can see any account
 * - SELLER users: Can only see their own accounts (Owner email must match)
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

    const { id: accountId } = await params;

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

    const account = await zohoService.getAccountById(accountId);

    if (session.user.role === Role.SELLER) {
      const userEmail = session.user.email?.toLowerCase();
      const ownerEmail = account.Owner?.email?.toLowerCase();

      if (ownerEmail !== userEmail) {
        return NextResponse.json(
          { error: "No tienes permiso para ver esta cuenta." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error("Error fetching Zoho account:", error);

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
        error: "Error al obtener cuenta de Zoho CRM",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
