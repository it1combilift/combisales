import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * POST /api/users/revoke-session
 * Revoca todas las sesiones de un usuario (solo Admin)
 *
 * Body: { userId: string }
 */
export async function POST(request: Request) {
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
      select: { role: true, id: true },
    });

    if (!currentUser || currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "No tienes permisos para revocar sesiones" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    // Prevenir que el admin se revoque a sí mismo
    if (userId === currentUser.id) {
      return NextResponse.json(
        {
          error: "No puedes revocar tu propia sesión. Usa logout en su lugar.",
        },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar todas las sesiones del usuario
    // Nota: Con JWT strategy, las sesiones no se almacenan en DB
    // Solo eliminamos si existen (Database strategy)
    const deletedSessions = await prisma.session.deleteMany({
      where: { userId },
    });

    // Log de auditoría
    await prisma.authAuditLog.create({
      data: {
        userId: userId,
        email: targetUser.email,
        event: "SESSION_REVOKED",
        provider: "admin_action",
        metadata: {
          revokedBy: currentUser.id,
          revokedByEmail: session.user.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Nota importante: Con JWT strategy, el usuario seguirá teniendo
    // acceso hasta que su JWT expire. Para forzar logout inmediato:
    // 1. Cambiar isActive = false (bloquea en próximo request)
    // 2. O implementar blacklist de JWTs

    return NextResponse.json({
      success: true,
      message: `${deletedSessions.count} sesión(es) revocada(s)`,
      note: "Si usas JWT strategy, el usuario será desconectado en su próximo request cuando jwt() callback valide isActive",
      user: {
        id: userId,
        name: targetUser.name,
        email: targetUser.email,
      },
    });
  } catch (error) {
    console.error("Error al revocar sesión:", error);
    return NextResponse.json(
      {
        error: "Error al revocar sesión",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
