import { Resend } from "resend";
import { EMAIL_CONFIG } from "@/constants/constants";
import { SendEmailParams, SendEmailResult } from "@/interfaces/email";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    "RESEND_API_KEY no está configurada en las variables de entorno"
  );
}

let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY no está configurada");
    }
    resendInstance = new Resend(resendApiKey);
  }
  return resendInstance;
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
    const resend = getResendClient();
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
