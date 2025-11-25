import { prisma } from "@/lib/prisma";

/**
 * Utilidades para consultar logs de auditoría de autenticación
 */

export interface AuthLogQuery {
  userId?: string;
  email?: string;
  event?: string;
  provider?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

/**
 * Obtener logs de auditoría con filtros
 */
export async function getAuthLogs(query: AuthLogQuery = {}) {
  const {
    userId,
    email,
    event,
    provider,
    startDate,
    endDate,
    limit = 50,
  } = query;

  const where: any = {};

  if (userId) where.userId = userId;
  if (email) where.email = email;
  if (event) where.event = event;
  if (provider) where.provider = provider;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  return await prisma.authAuditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Obtener estadísticas de autenticación de un usuario
 */
export async function getUserAuthStats(userId: string) {
  const [totalLogins, failedLogins, lastLogin, tokenRefreshes, providers] =
    await Promise.all([
      // Total de logins exitosos
      prisma.authAuditLog.count({
        where: {
          userId,
          event: "LOGIN_SUCCESS",
        },
      }),

      // Logins fallidos
      prisma.authAuditLog.count({
        where: {
          userId,
          event: "LOGIN_FAILED",
        },
      }),

      // Último login exitoso
      prisma.authAuditLog.findFirst({
        where: {
          userId,
          event: "LOGIN_SUCCESS",
        },
        orderBy: { createdAt: "desc" },
      }),

      // Refresh de tokens
      prisma.authAuditLog.count({
        where: {
          userId,
          event: "TOKEN_REFRESH_SUCCESS",
        },
      }),

      // Providers usados
      prisma.authAuditLog.groupBy({
        by: ["provider"],
        where: {
          userId,
          event: "LOGIN_SUCCESS",
        },
        _count: true,
      }),
    ]);

  return {
    totalLogins,
    failedLogins,
    lastLogin: lastLogin?.createdAt,
    tokenRefreshes,
    providers: providers.map((p) => ({
      provider: p.provider,
      count: p._count,
    })),
  };
}

/**
 * Detectar actividad sospechosa (múltiples intentos fallidos)
 */
export async function detectSuspiciousActivity(
  timeWindowMinutes: number = 15,
  maxAttempts: number = 5
) {
  const since = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

  // Agrupar intentos fallidos por email
  const failedAttempts = await prisma.authAuditLog.groupBy({
    by: ["email"],
    where: {
      event: "LOGIN_FAILED",
      createdAt: { gte: since },
    },
    _count: true,
    having: {
      email: {
        _count: {
          gte: maxAttempts,
        },
      },
    },
  });

  // Obtener detalles de cada email sospechoso
  const suspiciousActivities = await Promise.all(
    failedAttempts.map(async (attempt) => {
      const logs = await prisma.authAuditLog.findMany({
        where: {
          email: attempt.email!,
          event: "LOGIN_FAILED",
          createdAt: { gte: since },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        email: attempt.email,
        attempts: attempt._count,
        logs,
      };
    })
  );

  return suspiciousActivities;
}

/**
 * Obtener resumen de actividad reciente del sistema
 */
export async function getSystemAuthSummary(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const [
    totalLogins,
    failedLogins,
    uniqueUsers,
    tokenRefreshes,
    eventBreakdown,
  ] = await Promise.all([
    // Logins exitosos
    prisma.authAuditLog.count({
      where: {
        event: "LOGIN_SUCCESS",
        createdAt: { gte: since },
      },
    }),

    // Logins fallidos
    prisma.authAuditLog.count({
      where: {
        event: "LOGIN_FAILED",
        createdAt: { gte: since },
      },
    }),

    // Usuarios únicos que se autenticaron
    prisma.authAuditLog.findMany({
      where: {
        event: "LOGIN_SUCCESS",
        createdAt: { gte: since },
      },
      distinct: ["userId"],
      select: { userId: true },
    }),

    // Token refreshes exitosos
    prisma.authAuditLog.count({
      where: {
        event: "TOKEN_REFRESH_SUCCESS",
        createdAt: { gte: since },
      },
    }),

    // Desglose por evento
    prisma.authAuditLog.groupBy({
      by: ["event"],
      where: {
        createdAt: { gte: since },
      },
      _count: true,
    }),
  ]);

  return {
    period: `Last ${hours} hours`,
    totalLogins,
    failedLogins,
    successRate:
      totalLogins > 0
        ? ((totalLogins / (totalLogins + failedLogins)) * 100).toFixed(2)
        : "0",
    uniqueUsers: uniqueUsers.length,
    tokenRefreshes,
    events: eventBreakdown.map((e) => ({
      event: e.event,
      count: e._count,
    })),
  };
}

/**
 * Limpiar logs antiguos (ejecutar periódicamente)
 */
export async function cleanOldAuthLogs(daysToKeep: number = 90) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

  const result = await prisma.authAuditLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
    },
  });

  return {
    deleted: result.count,
    cutoffDate,
  };
}
