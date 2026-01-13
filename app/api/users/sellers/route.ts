import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/users/sellers
 * Get all users with SELLER role (for DEALER assignment)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "No tienes permisos para ver vendedores" },
        { status: 403 }
      );
    }

    const sellers = await prisma.user.findMany({
      where: {
        role: Role.SELLER,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        image: true,
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
      { status: 500 }
    );
  }
}
