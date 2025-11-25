import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAuthLogs,
  getUserAuthStats,
  detectSuspiciousActivity,
  getSystemAuthSummary,
} from "@/lib/auth-logs";

/**
 * GET /api/auth/logs
 * Obtener logs de auditoría de autenticación
 *
 * Query params:
 * - type: "user" | "suspicious" | "system"
 * - userId: string (para type=user)
 * - hours: number (para type=system, default 24)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Solo admins pueden ver logs de sistema, usuarios pueden ver sus propios logs
    const isAdmin = session.user.role === "ADMIN";
    const requestedUserId = searchParams.get("userId");

    // Si no es admin y intenta ver logs de otro usuario, denegar
    if (!isAdmin && requestedUserId && requestedUserId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const type = searchParams.get("type") || "user";
    const userId = requestedUserId || session.user.id;
    const hours = parseInt(searchParams.get("hours") || "24");

    switch (type) {
      case "user": {
        const [logs, stats] = await Promise.all([
          getAuthLogs({ userId, limit: 100 }),
          getUserAuthStats(userId),
        ]);
        return NextResponse.json({ logs, stats });
      }

      case "suspicious": {
        const suspicious = await detectSuspiciousActivity(15, 5);
        return NextResponse.json({ suspicious });
      }

      case "system": {
        const summary = await getSystemAuthSummary(hours);
        return NextResponse.json({ summary });
      }

      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error fetching auth logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
