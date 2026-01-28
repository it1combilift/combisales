import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { helpRequestSchema } from "@/schemas/help";
import { HELP_CONFIG } from "@/constants/constants";
import { sendEmail } from "@/lib/resend";

import {
  generateSupportRequestEmailHTML,
  generateSupportRequestEmailText,
  SupportRequestEmailData,
} from "@/lib/support-email-templates";

/**
 * POST /api/help
 * Submit a help/support request
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = helpRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const helpData = validationResult.data;

    // Build email data
    const emailData: SupportRequestEmailData = {
      ...helpData,
      userName: session.user.name || "Usuario desconocido",
      userEmail: session.user.email || "",
      userRole: session.user.role,
      locale: body.locale || "es",
      submittedAt: new Date(),
    };

    // Generate email content
    const htmlContent = generateSupportRequestEmailHTML(emailData);
    const textContent = generateSupportRequestEmailText(emailData);

    // Send email
    const emailResult = await sendEmail({
      to: [...HELP_CONFIG.supportRecipients],
      subject: `[${emailData.category.toUpperCase()}] ${emailData.subject}`,
      html: htmlContent,
      text: textContent,
      replyTo: session.user.email || undefined,
    });

    if (!emailResult.success) {
      console.error("[Help API] Error sending email:", emailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: "Error al enviar el correo",
          details: emailResult.error,
        },
        { status: 500 },
      );
    }

    console.log(
      `[Help API] Support request sent successfully from ${session.user.email}`,
    );

    return NextResponse.json({
      success: true,
      message: "Solicitud enviada correctamente",
      data: {
        id: emailResult.data?.id,
      },
    });
  } catch (error) {
    console.error("[Help API] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  }
}
