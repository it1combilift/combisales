import { VisitEmailData } from "@/interfaces/email";
import { formatDateShort, getFormTypeName } from "@/lib/utils";

import {
  formatFileSize,
  getFileIcon,
} from "@/components/formulario-css-analisis/utils/file-utils";

// ==================== TEMPLATES ====================

/**
 * Template HTML para notificación de visita completada
 */
export function generateVisitCompletedEmailHTML(data: VisitEmailData): string {
  const formTypeName = getFormTypeName(data.formType);
  const archivos = data.archivos || [];
  const hasArchivos = archivos.length > 0;

  const archivosHTML = hasArchivos
    ? `
      <div style="margin-top: 24px;">
        <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
          Archivos Adjuntos (${archivos.length})
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="text-align: left; padding: 10px; font-size: 12px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Archivo</th>
              <th style="text-align: left; padding: 10px; font-size: 12px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Tipo</th>
              <th style="text-align: right; padding: 10px; font-size: 12px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Tamaño</th>
            </tr>
          </thead>
          <tbody>
            ${archivos
              .map(
                (archivo) => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">
                  <a href="${
                    archivo.cloudinaryUrl
                  }" target="_blank" style="color: #2563eb; text-decoration: none; font-size: 14px;">
                    ${getFileIcon(archivo.tipoArchivo)} ${archivo.nombre}
                  </a>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #6b7280;">
                  ${archivo.tipoArchivo}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #6b7280; text-align: right;">
                  ${formatFileSize(archivo.tamanio)}
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">
          Haga clic en cada archivo para verlo o descargarlo.
        </p>
      </div>
    `
    : `
      <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 8px; border: 1px solid #fcd34d;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          No se adjuntaron archivos en esta visita.
        </p>
      </div>
    `;

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva visita completada</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 28px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
            Nueva visita completada
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">
            ${formTypeName}
          </p>
        </div>

        <!-- Body -->
        <div style="background: white; padding: 28px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          
          <!-- Info del Cliente -->
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e40af; margin: 0 0 16px 0; font-size: 18px;">
              ${data.razonSocial}
            </h2>
            
            <table style="width: 100%;">
              <tr>
                <td style="padding: 6px 0; vertical-align: top; width: 140px;">
                  <span style="color: #6b7280; font-size: 13px;">Contacto:</span>
                </td>
                <td style="padding: 6px 0;">
                  <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${
                    data.personaContacto
                  }</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; vertical-align: top;">
                  <span style="color: #6b7280; font-size: 13px;">Email:</span>
                </td>
                <td style="padding: 6px 0;">
                  <a href="mailto:${
                    data.email
                  }" style="color: #2563eb; font-size: 14px; text-decoration: none;">${
    data.email
  }</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; vertical-align: top;">
                  <span style="color: #6b7280; font-size: 13px;">Ubicación:</span>
                </td>
                <td style="padding: 6px 0;">
                  <span style="color: #1f2937; font-size: 14px;">${
                    data.direccion
                  }, ${data.localidad}<br/>${data.provinciaEstado}, ${
    data.pais
  }</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; vertical-align: top;">
                  <span style="color: #6b7280; font-size: 13px;">Fecha visita:</span>
                </td>
                <td style="padding: 6px 0;">
                  <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${formatDateShort(
                    data.visitDate
                  )}</span>
                </td>
              </tr>
              ${
                data.vendedor
                  ? `
              <tr>
                <td style="padding: 6px 0; vertical-align: top;">
                  <span style="color: #6b7280; font-size: 13px;">Vendedor:</span>
                </td>
                <td style="padding: 6px 0;">
                  <span style="color: #1f2937; font-size: 14px;">${data.vendedor.name} (${data.vendedor.email})</span>
                </td>
              </tr>
              `
                  : ""
              }
            </table>
          </div>

          <!-- Descripción -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; font-size: 15px; margin-bottom: 8px;">Descripción del Producto</h3>
            <div style="background: #fefce8; padding: 16px; border-radius: 8px; border-left: 4px solid #eab308;">
              <p style="margin: 0; color: #713f12; font-size: 14px; white-space: pre-wrap;">${
                data.descripcionProducto || "Sin descripción"
              }</p>
            </div>
          </div>

          <!-- Archivos -->
          ${archivosHTML}

        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">
            Este es un mensaje automático de <strong>Combilift Sales</strong>.
          </p>
          <p style="margin: 8px 0 0 0;">
            © ${new Date().getFullYear()} Combilift Sales. Todos los derechos reservados.
          </p>
        </div>

      </body>
    </html>
  `;
}

/**
 * Template texto plano para notificación de visita completada
 */
export function generateVisitCompletedEmailText(data: VisitEmailData): string {
  const formTypeName = getFormTypeName(data.formType);
  const archivos = data.archivos || [];

  let archivosText = "";
  if (archivos.length > 0) {
    archivosText = `
ARCHIVOS ADJUNTOS (${archivos.length}):
${archivos
  .map(
    (a) => `- ${a.nombre} (${formatFileSize(a.tamanio)}): ${a.cloudinaryUrl}`
  )
  .join("\n")}
`;
  } else {
    archivosText = "\nNo se adjuntaron archivos en esta visita.\n";
  }

  return `
NUEVA VISITA COMPLETADA
========================
Tipo: ${formTypeName}

DATOS DEL CLIENTE:
------------------
Empresa: ${data.razonSocial}
Contacto: ${data.personaContacto}
Email: ${data.email}
Ubicación: ${data.direccion}, ${data.localidad}, ${data.provinciaEstado}, ${
    data.pais
  }
Fecha visita: ${formatDateShort(data.visitDate)}
${
  data.vendedor
    ? `Vendedor: ${data.vendedor.name} (${data.vendedor.email})`
    : ""
}

DESCRIPCIÓN DEL PRODUCTO:
-------------------------
${data.descripcionProducto || "Sin descripción"}

${archivosText}

---
Este es un mensaje automático de Combilift Sales.
© ${new Date().getFullYear()} Combilift Sales. Todos los derechos reservados.
  `.trim();
}
