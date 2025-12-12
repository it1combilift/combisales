import { Resend } from "resend";

// Inicializar cliente de Resend
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    "RESEND_API_KEY no está configurada en las variables de entorno"
  );
}

export const resend = new Resend(resendApiKey);

// Configuración por defecto
export const EMAIL_CONFIG = {
  // Email por defecto para envío (debe ser un dominio verificado en Resend)
  // Para pruebas, Resend permite usar onboarding@resend.dev
  fromEmail: "onboarding@resend.dev",
  fromName: "Combilift Sales",
  // Email de prueba
  testEmail: "anyeloisaacbenavide@gmail.com",
} as const;

// Tipos para emails
export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  data?: { id: string };
  error?: string;
}

/**
 * Enviar un email usando Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
  replyTo,
}: SendEmailParams): Promise<SendEmailResult> {
  try {
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY no está configurada");
    }

    // Resend requiere html o text
    const content = html ? { html } : { text: text || "" };

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      replyTo,
      ...content,
    });

    if (error) {
      console.error("Error enviando email:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: { id: data?.id || "" },
    };
  } catch (error) {
    console.error("Error enviando email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Enviar email de prueba
 */
export async function sendTestEmail(to?: string): Promise<SendEmailResult> {
  const recipient = to || EMAIL_CONFIG.testEmail;

  return sendEmail({
    to: recipient,
    subject: "Prueba de Resend - Combilift Sales",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email de Prueba</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Configuración Exitosa</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">¡Hola!</h2>
            <p style="color: #4b5563;">
              Este es un email de prueba enviado desde <strong>Combilift Sales</strong> usando Resend.
            </p>
            <p style="color: #4b5563;">
              Si estás recibiendo este mensaje, significa que la configuración de envío de correos está funcionando correctamente. 🎊
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">Detalles técnicos:</h3>
              <ul style="color: #6b7280; padding-left: 20px;">
                <li><strong>Servicio:</strong> Resend</li>
                <li><strong>Fecha:</strong> ${new Date().toLocaleString(
                  "es-ES",
                  { dateStyle: "full", timeStyle: "short" }
                )}</li>
                <li><strong>Destinatario:</strong> ${recipient}</li>
              </ul>
            </div>
            <p style="color: #9ca3af; font-size: 14px; margin-bottom: 0;">
              Este es un mensaje automático de prueba. No es necesario responder.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Combilift Sales. Todos los derechos reservados.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      ✅ Configuración Exitosa
      
      ¡Hola!
      
      Este es un email de prueba enviado desde Combilift Sales usando Resend.
      
      Si estás recibiendo este mensaje, significa que la configuración de envío de correos está funcionando correctamente.
      
      Detalles técnicos:
      - Servicio: Resend
      - Fecha: ${new Date().toLocaleString("es-ES")}
      - Destinatario: ${recipient}
      
      Este es un mensaje automático de prueba. No es necesario responder.
      
      © ${new Date().getFullYear()} Combilift Sales. Todos los derechos reservados.
    `,
  });
}
