import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Token Refresh Cron Job
 * Ejecutar cada 50 minutos para refrescar tokens próximos a expirar
 *
 * Configuración en vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/refresh-tokens",
 *     "schedule": "0/50 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  // Verificar autorización del cron job
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    totalProcessed: 0,
    refreshed: 0,
    failed: 0,
    errors: [] as Array<{ userId: string; error: string }>,
  };

  try {
    // Buscar tokens que expiran en los próximos 10 minutos
    const expiringAt = Math.floor(Date.now() / 1000) + 600; // +10 minutos

    const accounts = await prisma.account.findMany({
      where: {
        provider: "zoho",
        refresh_token: { not: null },
        expires_at: { lte: expiringAt },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    results.totalProcessed = accounts.length;

    // Procesar cada cuenta
    for (const account of accounts) {
      // Saltar usuarios inactivos
      if (!account.user.isActive) {
        continue;
      }

      try {
        // Llamar a Zoho para refrescar el token
        const response = await fetch(
          "https://accounts.zoho.com/oauth/v2/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              refresh_token: account.refresh_token!,
              client_id: process.env.ZOHO_CLIENT_ID!,
              client_secret: process.env.ZOHO_CLIENT_SECRET!,
              grant_type: "refresh_token",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Zoho API error: ${response.statusText}`);
        }

        const tokens = await response.json();

        if (tokens.access_token) {
          const newExpiresAt =
            Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600);

          // Actualizar Account con el nuevo token
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: "zoho",
                providerAccountId: account.providerAccountId,
              },
            },
            data: {
              access_token: tokens.access_token,
              expires_at: newExpiresAt,
              token_refreshed_at: new Date(),
              token_expires_in: tokens.expires_in,
            },
          });

          // Log del refresh exitoso
          await prisma.authAuditLog.create({
            data: {
              userId: account.userId,
              email: account.user.email,
              event: "TOKEN_REFRESH_SUCCESS",
              provider: "zoho",
              metadata: {
                cronJob: true,
                expiresIn: tokens.expires_in,
              },
            },
          });

          results.refreshed++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          userId: account.userId,
          error: (error as Error).message,
        });

        // Log del refresh fallido
        await prisma.authAuditLog.create({
          data: {
            userId: account.userId,
            email: account.user.email,
            event: "TOKEN_REFRESH_FAILED",
            provider: "zoho",
            metadata: {
              cronJob: true,
              error: (error as Error).message,
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        results,
      },
      { status: 500 }
    );
  }
}
