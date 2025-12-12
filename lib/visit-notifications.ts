import { VisitStatus } from "@prisma/client";
import { sendEmail, EMAIL_CONFIG } from "@/lib/resend";

import {
  SendVisitNotificationParams,
  VisitNotificationResult,
} from "@/interfaces/email";

import {
  generateVisitCompletedEmailHTML,
  generateVisitCompletedEmailText,
} from "@/lib/email-templates";

/**
 * Enviar notificación de visita completada
 * Incluye los datos del cliente y enlaces a los archivos adjuntos
 */
export async function sendVisitCompletedNotification({
  visitData,
  to = EMAIL_CONFIG.testEmail,
}: SendVisitNotificationParams): Promise<VisitNotificationResult> {
  const recipients = Array.isArray(to) ? to : [to];
  const archivosCount = visitData.archivos?.length || 0;

  const subject = `Nueva Visita: ${visitData.razonSocial} - ${visitData.formType
    .replace("ANALISIS_", "")
    .replace("_", " ")}${
    archivosCount > 0
      ? ` (${archivosCount} archivo${archivosCount > 1 ? "s" : ""})`
      : ""
  }`;

  try {
    const result = await sendEmail({
      to: recipients,
      subject,
      html: generateVisitCompletedEmailHTML(visitData),
      text: generateVisitCompletedEmailText(visitData),
      replyTo: visitData.email,
    });

    return {
      ...result,
      sentTo: recipients,
    };
  } catch (error) {
    console.error("Error enviando notificación de visita:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      sentTo: [],
    };
  }
}

/**
 * Configuración para notificaciones
 * Centraliza los destinatarios por defecto
 */
export const NOTIFICATION_CONFIG = {
  visitCompleted: {
    recipients: [EMAIL_CONFIG.testEmail],
    enabled: true,
  },
} as const;

/**
 * Determinar si se debe enviar notificación de visita
 */
export function shouldSendVisitNotification(status: string): boolean {
  return (
    status === VisitStatus.COMPLETADA &&
    NOTIFICATION_CONFIG.visitCompleted.enabled
  );
}
