import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail, EMAIL_CONFIG } from "@/lib/resend";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/email/test
 * Enviar email de prueba sin autenticación (solo para desarrollo)
 */
export async function GET(req: NextRequest) {
  try {
    // Para desarrollo, permitimos sin autenticación
    // En producción, descomentar las siguientes líneas:
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user) {
    //   return NextResponse.json(
    //     { success: false, error: "No autorizado" },
    //     { status: 401 }
    //   );
    // }

    const { searchParams } = new URL(req.url);
    const to = searchParams.get("to") || EMAIL_CONFIG.testEmail;

    console.log(`Enviando email de prueba a: ${to}`);

    const result = await sendTestEmail(to);

    if (!result.success) {
      console.error("Error enviando email:", result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log("Email enviado correctamente. ID:", result.data?.id);

    return NextResponse.json({
      success: true,
      message: `Email de prueba enviado exitosamente a ${to}`,
      data: {
        emailId: result.data?.id,
        recipient: to,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error en GET /api/email/test:", error);
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
 * POST /api/email/test
 * Enviar email de prueba con datos personalizados
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
    const { to } = body;

    const recipient = to || EMAIL_CONFIG.testEmail;

    console.log(`Enviando email de prueba a: ${recipient}`);

    const result = await sendTestEmail(recipient);

    if (!result.success) {
      console.error("Error enviando email:", result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log("Email enviado correctamente. ID:", result.data?.id);

    return NextResponse.json({
      success: true,
      message: `Email de prueba enviado exitosamente a ${recipient}`,
      data: {
        emailId: result.data?.id,
        recipient,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error en POST /api/email/test:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 }
    );
  }
}
