import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hasRole } from "@/lib/roles";

/**
 * GET /api/users/sellers
 * Get all users with SELLER role (for DEALER assignment)
 * Includes users with multiple roles (e.g., ADMIN + SELLER)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { roles: true },
    });

    if (!currentUser || !hasRole(currentUser.roles, Role.ADMIN)) {
      return NextResponse.json(
        { error: "No tienes permisos para ver vendedores" },
        { status: 403 },
      );
    }

    // Find users who have SELLER in their roles array
    // This includes users with ADMIN + SELLER roles
    const sellers = await prisma.user.findMany({
      where: {
        roles: { has: Role.SELLER },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        image: true,
        roles: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ sellers });
  } catch (error) {
    console.error("Error al obtener vendedores:", error);
    return NextResponse.json(
      {
        error: "Error al obtener vendedores",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
