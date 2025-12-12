import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail, sendTestEmail, EMAIL_CONFIG } from "@/lib/resend";

/**
 * POST /api/email
 * Enviar un email
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { to, subject, html, text, replyTo } = body;

    // Validación básica
    if (!to || !subject) {
      return NextResponse.json(
        { success: false, error: "Se requiere 'to' y 'subject'" },
        { status: 400 }
      );
    }

    if (!html && !text) {
      return NextResponse.json(
        { success: false, error: "Se requiere 'html' o 'text'" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject,
      html,
      text,
      replyTo,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email enviado correctamente",
      data: result.data,
    });
  } catch (error) {
    console.error("Error en POST /api/email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email/test
 * Enviar email de prueba
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const to = searchParams.get("to") || EMAIL_CONFIG.testEmail;

    const result = await sendTestEmail(to);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email de prueba enviado a ${to}`,
      data: result.data,
    });
  } catch (error) {
    console.error("Error en GET /api/email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 }
    );
  }
}
