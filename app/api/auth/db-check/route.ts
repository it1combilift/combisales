import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
      },
    });

    const userCount = await prisma.user.count();
    const accountCount = await prisma.account.count();
    const sessionCount = await prisma.session.count();

    return NextResponse.json({
      message: "Conexión exitosa a la base de datos",
      counts: {
        users: userCount,
        accounts: accountCount,
        sessions: sessionCount,
      },
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        accountsCount: user.accounts.length,
        sessionsCount: user.sessions.length,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error al conectar con la base de datos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
