import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get list of users (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "No tienes permisos para ver la lista de usuarios" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        country: true,
        isActive: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
        sessions: {
          select: {
            expires: true,
          },
          orderBy: {
            expires: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Obtener último login de AuthAuditLog para cada usuario
    const usersWithAuth = await Promise.all(
      users.map(async (user) => {
        const lastLogin = await prisma.authAuditLog.findFirst({
          where: {
            userId: user.id,
            event: "LOGIN_SUCCESS",
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            createdAt: true,
          },
        });

        // Extraer información de autenticación
        const authMethods = user.accounts.map((acc) => acc.provider);
        const zohoAccount = user.accounts.find(
          (acc) => acc.provider === "zoho"
        );

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          country: user.country,
          isActive: user.isActive,
          createdAt: user.createdAt,
          authMethods, // ["zoho", "credentials"]
          lastLoginAt: lastLogin?.createdAt || null,
          zohoId: zohoAccount?.providerAccountId || null, // ZUID
          hasActiveSession: user.sessions.length > 0,
        };
      })
    );

    return NextResponse.json({ users: usersWithAuth });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      {
        error: "Error al obtener la lista de usuarios",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
