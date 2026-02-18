import { sendEmail } from "@/lib/resend";
import { getServerSession } from "next-auth";
import { helpRequestSchema } from "@/schemas/help";
import { HELP_CONFIG } from "@/constants/constants";
import { NextRequest, NextResponse } from "next/server";
import { getAnyValidZohoTokens } from "@/lib/zoho-tokens";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createZohoDeskTicket } from "@/service/ZohoDeskService";
import { getPrimaryRole } from "@/lib/roles";

import {
  HELP_CATEGORY_TO_PRIORITY,
  ZohoDeskServiceResult,
} from "@/interfaces/zoho-desk";

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
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const validationResult = helpRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data",
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
      userRole: getPrimaryRole(session.user.roles),
      locale: body.locale || "es",
      submittedAt: new Date(),
    };

    // Generate email content
    const htmlContent = generateSupportRequestEmailHTML(emailData);
    const textContent = generateSupportRequestEmailText(emailData);

    // Get translated category label for subject
    const categoryLabel = getCategoryLabel(
      helpData.category,
      body.locale || "es",
    );

    // Send email
    const emailResult = await sendEmail({
      to: [...HELP_CONFIG.supportRecipients],
      subject: `[${categoryLabel}] ${emailData.subject}`,
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

    // ==================== ZOHO DESK TICKET CREATION ====================
    // Create ticket in parallel - don't block email success response
    let ticketResult: ZohoDeskServiceResult = {
      success: false,
      ticketId: null,
      ticketNumber: null,
      error: null,
    };

    const departmentId = process.env.ZOHO_DESK_DEPARTMENT_ID;

    if (departmentId) {
      try {
        // Get any valid Zoho tokens (from any authenticated user with Zoho)
        const zohoAuth = await getAnyValidZohoTokens();

        if (zohoAuth?.tokens) {
          // Build ticket description with images as links
          const ticketDescription = buildTicketDescription(
            helpData.description,
            helpData.images || [],
            session.user.name || "Usuario",
            session.user.email || "",
            getPrimaryRole(session.user.roles) || "DEALER",
          );

          ticketResult = await createZohoDeskTicket(zohoAuth.tokens, {
            subject: `[${categoryLabel}] ${helpData.subject}`,
            description: ticketDescription,
            departmentId: departmentId,
            contact: {
              email: session.user.email || "soporte@combilift.es",
              firstName: session.user.name?.split(" ")[0] || "Usuario",
              lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
            },
            priority: HELP_CATEGORY_TO_PRIORITY[helpData.category] || "Medium",
            status: "Open",
            channel: "Web",
            category: categoryLabel,
          });

          if (ticketResult.success) {
            console.log(
              `[Help API] Zoho Desk ticket created: #${ticketResult.ticketNumber} (ID: ${ticketResult.ticketId})`,
            );
          } else {
            console.warn(
              "[Help API] Failed to create Zoho Desk ticket:",
              ticketResult.error,
            );
          }
        } else {
          console.warn(
            "[Help API] No valid Zoho tokens available for Desk ticket creation",
          );
          ticketResult.error = "No valid Zoho authentication available";
        }
      } catch (error) {
        console.error("[Help API] Error creating Zoho Desk ticket:", error);
        ticketResult.error =
          error instanceof Error ? error.message : "Unknown error";
      }
    } else {
      console.warn(
        "[Help API] ZOHO_DESK_DEPARTMENT_ID not configured, skipping ticket creation",
      );
    }

    return NextResponse.json({
      success: true,
      message: "Solicitud enviada correctamente",
      data: {
        id: emailResult.data?.id,
        ticket: ticketResult.success
          ? {
              id: ticketResult.ticketId,
              number: ticketResult.ticketNumber,
            }
          : null,
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

// ==================== HELPER FUNCTIONS ====================

/**
 * Build HTML description for Zoho Desk ticket
 * Includes user info and image attachments as links
 */
function buildTicketDescription(
  description: string,
  images: Array<{
    cloudinaryId: string;
    cloudinaryUrl: string;
    nombre: string;
    tamanio: number;
  }>,
  userName: string,
  userEmail: string,
  userRole: string,
): string {
  let html = `
    <h3>Información del Usuario</h3>
    <p><strong>Nombre:</strong> ${userName}</p>
    <p><strong>Email:</strong> ${userEmail}</p>
    <p><strong>Rol:</strong> ${userRole}</p>
    <hr>
    <h3>Descripción del Problema</h3>
    <p>${description.replace(/\n/g, "<br>")}</p>
  `;

  if (images.length > 0) {
    html += `
      <hr>
      <h3>Archivos Adjuntos (${images.length})</h3>
      <ul>
    `;

    for (const img of images) {
      const sizeKB = Math.round(img.tamanio / 1024);
      html += `<li><a href="${img.cloudinaryUrl}" target="_blank">${img.nombre}</a> (${sizeKB} KB)</li>`;
    }

    html += `</ul>`;
  }

  html += `
    <hr>
    <p><em>Ticket generado automáticamente desde CombiSales - ${new Date().toLocaleString("es-ES")}</em></p>
  `;

  return html;
}

/**
 * Get localized category label based on locale
 */
function getCategoryLabel(category: string, locale: string = "es"): string {
  const labels: Record<string, Record<string, string>> = {
    es: {
      bug: "Reporte de Error",
      technical: "Problema Técnico",
      feature: "Solicitud de Función",
      question: "Pregunta General",
      other: "Otro",
    },
    en: {
      bug: "Bug Report",
      technical: "Technical Issue",
      feature: "Feature Request",
      question: "General Question",
      other: "Other",
    },
  };

  const localeLabels = labels[locale] || labels.es;
  return localeLabels[category] || category;
}
