import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { EMAIL_CONFIG } from "@/constants/constants";
import { Role, InspectionStatus, InspectionPhotoType } from "@prisma/client";

// ==================== TYPES ====================
interface InspectionPhoto {
  photoType: InspectionPhotoType;
  cloudinaryUrl: string;
}

interface InspectionEmailData {
  id: number;
  mileage: number;
  status: InspectionStatus;
  observations: string | null;
  vehicle: {
    model: string;
    plate: string;
  };
  user: {
    name: string | null;
    email: string;
  };
  photos?: InspectionPhoto[];
  approval?: {
    approved: boolean;
    comments: string | null;
    user?: {
      name: string | null;
      email: string;
    };
  } | null;
  createdAt: Date | string;
}

interface ReminderVehicleData {
  id: string;
  model: string;
  plate: string;
}

interface InspectionReminderEmailData {
  recipientName: string;
  recipientEmail: string;
  frequency: "MONTHLY" | "WEEKLY";
  month: number;
  year: number;
  week: number | null;
  assignedVehicles: ReminderVehicleData[];
}

const CHECKLIST_FAILURE_HEADER = "Observaciones de Checklist (Fallo):";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMultilineHtml(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function splitObservationSections(rawObservations: string): {
  generalText: string;
  failedChecklistItems: string[];
} {
  const normalized = rawObservations.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return {
      generalText: "",
      failedChecklistItems: [],
    };
  }

  const headerIndex = normalized.indexOf(CHECKLIST_FAILURE_HEADER);
  if (headerIndex < 0) {
    return {
      generalText: normalized,
      failedChecklistItems: [],
    };
  }

  const generalText = normalized.slice(0, headerIndex).trim();
  const checklistPart = normalized
    .slice(headerIndex + CHECKLIST_FAILURE_HEADER.length)
    .trim();

  const failedChecklistItems = checklistPart
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith("-") ? line.slice(1).trim() : line))
    .filter(Boolean);

  return {
    generalText,
    failedChecklistItems,
  };
}

const PHOTO_TYPE_LABELS: Record<InspectionPhotoType, string> = {
  FRONT: "Frontal",
  REAR: "Trasera",
  DRIVER_SIDE: "Lateral Izquierdo",
  PASSENGER_SIDE: "Lateral Derecho",
  INTERIOR: "Interior",
  SAFETY_DEVICES: "Cuadro con Motor Encendido",
  WHEEL_FRONT_LEFT: "Rueda D/I ",
  WHEEL_FRONT_RIGHT: "Rueda D/D",
  WHEEL_REAR_LEFT: "Rueda T/I",
  WHEEL_REAR_RIGHT: "Rueda T/D",
};

// ==================== EMAIL TEMPLATES ====================
function generateInspectionEmailHTML(
  data: InspectionEmailData,
  type: "created" | "approved" | "rejected",
): string {
  const statusColors = {
    created: {
      bg: "#DBEAFE",
      text: "#1E40AF",
      border: "#93C5FD",
      label: "Pendiente de Aprobacion",
    },
    approved: {
      bg: "#E8F5E9",
      text: "#1B5E20",
      border: "#4CAF50",
      label: "Aprobada",
    },
    rejected: {
      bg: "#FFEBEE",
      text: "#C62828",
      border: "#EF5350",
      label: "Rechazada",
    },
  };

  const color = statusColors[type];
  const inspectorName = data.user?.name || data.user?.email || "Desconocido";
  const date = new Date(data.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const title =
    type === "created"
      ? "Nueva Inspeccion de Vehiculo Enviada"
      : type === "approved"
        ? "Inspeccion de Vehiculo Aprobada"
        : "Inspeccion de Vehiculo Rechazada";

  const observationSections = data.observations
    ? splitObservationSections(data.observations)
    : null;

  const observationsHtml = observationSections
    ? `<div style="margin-bottom:16px;">
        <strong style="color:#424242;display:block;margin-bottom:8px;">Observaciones:</strong>
        ${
          observationSections.generalText
            ? `<div style="background:#f7f7f7;border:1px solid #e8e8e8;border-radius:8px;padding:10px 12px;color:#616161;line-height:1.55;white-space:normal;">${formatMultilineHtml(observationSections.generalText)}</div>`
            : ""
        }
        ${
          observationSections.failedChecklistItems.length > 0
            ? `<div style="margin-top:${observationSections.generalText ? "10px" : "0"};background:#fff7f7;border:1px solid #ffd6d6;border-radius:8px;padding:10px 12px;">
                <div style="color:#b42318;font-weight:600;font-size:13px;margin-bottom:6px;">Detalle de checklist en fallo</div>
                <ul style="margin:0;padding-left:18px;color:#7a271a;line-height:1.5;">
                  ${observationSections.failedChecklistItems
                    .map((item) => `<li>${escapeHtml(item)}</li>`)
                    .join("")}
                </ul>
              </div>`
            : ""
        }
      </div>`
    : "";

  const approvalCommentsHtml = data.approval?.comments
    ? `<div style="margin-bottom:16px;">
          <strong style="color:#424242;">Comentarios del Revisor:</strong>
          <p style="color:#616161;margin:4px 0;line-height:1.5;">${formatMultilineHtml(data.approval.comments)}</p>
          <span style="color:#9e9e9e;font-size:12px;">Por ${escapeHtml(data.approval.user?.name || data.approval.user?.email || "Revisor")}</span>
        </div>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;">
    <tr>
      <td style="background:#679436;padding:24px;text-align:center;">
        <img src="${EMAIL_CONFIG.companyLogo}" alt="Combilift" height="40" style="filter:brightness(0) invert(1);"/>
        <h1 style="color:#fff;margin:12px 0 0;font-size:20px;">${title}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <div style="background:${color.bg};border-left:4px solid ${color.border};padding:12px 16px;margin-bottom:20px;border-radius:4px;">
          <span style="color:${color.text};font-weight:bold;font-size:14px;">${color.label}</span>
        </div>

        <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:8px;margin-bottom:16px;">
          <tr style="background:#f5f5f5;">
            <td colspan="2" style="font-weight:bold;font-size:14px;color:#424242;">Informacion del Vehiculo</td>
          </tr>
          <tr>
            <td style="color:#757575;width:40%;">Vehiculo</td>
            <td style="font-weight:500;">${escapeHtml(data.vehicle.model)}</td>
          </tr>
          <tr style="background:#fafafa;">
            <td style="color:#757575;">Matricula</td>
            <td style="font-weight:500;">${escapeHtml(data.vehicle.plate)}</td>
          </tr>
          <tr>
            <td style="color:#757575;">Kilometraje</td>
            <td style="font-weight:500;">${data.mileage.toLocaleString()} km</td>
          </tr>
          <tr style="background:#fafafa;">
            <td style="color:#757575;">Inspector</td>
            <td style="font-weight:500;">${escapeHtml(inspectorName)}</td>
          </tr>
          <tr>
            <td style="color:#757575;">Fecha</td>
            <td style="font-weight:500;">${date}</td>
          </tr>
        </table>

        ${observationsHtml}

        ${
          data.photos && data.photos.length > 0
            ? `<div style="margin-bottom:20px;">
              <strong style="color:#424242;display:block;margin-bottom:10px;">Fotografias de Inspeccion (${data.photos.length})</strong>
              <table width="100%" cellpadding="4" cellspacing="0">
                <tr>
                  ${data.photos
                    .map(
                      (photo, i) => `
                    ${i > 0 && i % 3 === 0 ? "</tr><tr>" : ""}
                    <td width="33%" style="text-align:center;vertical-align:top;padding:4px;">
                      <a href="${photo.cloudinaryUrl}" target="_blank" style="display:block;text-decoration:none;">
                        <img
                          src="${photo.cloudinaryUrl}"
                          alt="${PHOTO_TYPE_LABELS[photo.photoType] || photo.photoType}"
                          width="160"
                          style="max-width:160px;height:110px;object-fit:cover;border-radius:6px;border:1px solid #e0e0e0;display:block;margin:0 auto;"
                        />
                        <span style="display:block;margin-top:4px;font-size:11px;color:#757575;">
                          ${PHOTO_TYPE_LABELS[photo.photoType] || photo.photoType}
                        </span>
                      </a>
                    </td>`,
                    )
                    .join("")}
                </tr>
              </table>
            </div>`
            : ""
        }

        ${approvalCommentsHtml}

        <div style="text-align:center;margin-top:24px;">
          <a href="${process.env.NEXTAUTH_URL || ""}/dashboard/inspections/${data.id}" target="_blank"
             style="display:inline-block;padding:12px 24px;background:#679436;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
            Ver detalle de la inspeccion
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background:#f5f5f5;padding:16px;text-align:center;color:#9e9e9e;font-size:12px;">
        CombiSales &mdash; Sistema de Inspeccion Vehicular
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateInspectionEmailText(
  data: InspectionEmailData,
  type: "created" | "approved" | "rejected",
): string {
  const title =
    type === "created"
      ? "Nueva inspeccion de vehiculo enviada"
      : type === "approved"
        ? "Inspeccion de vehiculo aprobada"
        : "Inspeccion de vehiculo rechazada";

  const lines = [
    title,
    "=".repeat(title.length),
    "",
    `Vehiculo: ${data.vehicle.model} (${data.vehicle.plate})`,
    `Kilometraje: ${data.mileage.toLocaleString()} km`,
    `Inspector: ${data.user?.name || data.user?.email}`,
    `Fecha: ${new Date(data.createdAt).toLocaleDateString("es-ES")}`,
  ];

  if (data.observations) {
    lines.push("", `Observaciones: ${data.observations}`);
  }

  if (data.photos && data.photos.length > 0) {
    lines.push("", `Fotografias de inspeccion (${data.photos.length}):`);
    data.photos.forEach((photo) => {
      lines.push(
        `  ${PHOTO_TYPE_LABELS[photo.photoType] || photo.photoType}: ${photo.cloudinaryUrl}`,
      );
    });
  }

  if (data.approval?.comments) {
    lines.push(
      "",
      `Comentarios del revisor: ${data.approval.comments}`,
      `Por: ${data.approval.user?.name || data.approval.user?.email}`,
    );
  }

  return lines.join("\n");
}

// ==================== SEND FUNCTIONS ====================

/**
 * Send notification when a new inspection is created.
 * Recipients: all active ADMIN users + the inspector who created it.
 */
export async function sendInspectionCreatedEmail(
  inspection: InspectionEmailData,
): Promise<void> {
  const admins = await prisma.user.findMany({
    where: {
      roles: { has: Role.ADMIN },
      isActive: true,
    },
    select: { email: true, name: true },
  });

  // Build unique recipient list: all admins + the inspector (self)
  const recipientEmails = new Set<string>(admins.map((a) => a.email));
  if (inspection.user?.email) {
    recipientEmails.add(inspection.user.email);
  }

  if (recipientEmails.size === 0) return;

  const html = generateInspectionEmailHTML(inspection, "created");
  const text = generateInspectionEmailText(inspection, "created");

  for (const email of recipientEmails) {
    try {
      await sendEmail({
        to: email,
        subject: `[Inspeccion] Nueva inspeccion - ${inspection.vehicle.model} (${inspection.vehicle.plate})`,
        html,
        text,
      });
    } catch (error) {
      console.error(`Failed to send inspection email to ${email}:`, error);
    }
  }
}

/**
 * Send notification to the inspector when their inspection is approved/rejected
 */
export async function sendInspectionApprovedEmail(
  inspection: InspectionEmailData,
): Promise<void> {
  if (!inspection.user?.email) return;

  const type =
    inspection.status === InspectionStatus.APPROVED ? "approved" : "rejected";
  const html = generateInspectionEmailHTML(inspection, type);
  const text = generateInspectionEmailText(inspection, type);

  const statusLabel = type === "approved" ? "Aprobada" : "Rechazada";

  try {
    await sendEmail({
      to: inspection.user.email,
      subject: `[Inspeccion] ${statusLabel} - ${inspection.vehicle.model} (${inspection.vehicle.plate})`,
      html,
      text,
    });
  } catch (error) {
    console.error(
      `Failed to send approval email to ${inspection.user.email}:`,
      error,
    );
  }
}

function generateInspectionReminderEmailHTML(
  data: InspectionReminderEmailData,
): string {
  const monthName = new Date(data.year, data.month - 1, 1).toLocaleDateString(
    "es-ES",
    {
      month: "long",
      year: "numeric",
    },
  );

  const visibleVehicles = data.assignedVehicles.slice(0, 8);
  const hiddenCount = Math.max(
    data.assignedVehicles.length - visibleVehicles.length,
    0,
  );
  const isWeekly = data.frequency === "WEEKLY";
  const periodLabel = isWeekly
    ? `semana ${data.week ?? "actual"} de ${data.year}`
    : monthName;
  const reminderTitle = isWeekly
    ? "Recordatorio semanal de inspecciones"
    : "Recordatorio mensual de inspecciones";
  const cadenceDescription = isWeekly
    ? "Este es tu recordatorio semanal para revisar y registrar las inspecciones"
    : "Este es el recordatorio programado";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;">
    <tr>
      <td style="background:#679436;padding:24px;text-align:center;">
        <img src="${EMAIL_CONFIG.companyLogo}" alt="Combilift" height="40" style="filter:brightness(0) invert(1);"/>
        <h1 style="color:#fff;margin:12px 0 0;font-size:20px;">${reminderTitle}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <p style="margin:0 0 12px;color:#424242;">Hola ${data.recipientName},</p>
        <p style="margin:0 0 16px;color:#616161;line-height:1.5;">
          ${cadenceDescription} de los vehículos que tienes asignados para <strong>${periodLabel}</strong>.
        </p>

        <table width="100%" cellpadding="10" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:8px;margin-bottom:16px;">
          <tr style="background:#f5f5f5;">
            <td style="font-weight:bold;font-size:14px;color:#424242;">Vehículos asignados (${data.assignedVehicles.length})</td>
          </tr>
          ${visibleVehicles
            .map(
              (vehicle, index) => `
            <tr style="background:${index % 2 === 0 ? "#ffffff" : "#fafafa"};">
              <td style="color:#424242;">${vehicle.model} <span style="color:#757575;">(${vehicle.plate})</span></td>
            </tr>`,
            )
            .join("")}
          ${
            hiddenCount > 0
              ? `<tr><td style="color:#757575;">Y ${hiddenCount} vehículo(s) más.</td></tr>`
              : ""
          }
        </table>

        <div style="text-align:center;margin-top:24px;">
          <a href="${process.env.NEXTAUTH_URL || ""}/dashboard/inspections" target="_blank"
             style="display:inline-block;padding:12px 24px;background:#679436;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
            Ir al módulo de inspecciones
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background:#f5f5f5;padding:16px;text-align:center;color:#9e9e9e;font-size:12px;">
        CombiSales &mdash; Sistema de Inspeccion Vehicular
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateInspectionReminderEmailText(
  data: InspectionReminderEmailData,
): string {
  const monthName = new Date(data.year, data.month - 1, 1).toLocaleDateString(
    "es-ES",
    {
      month: "long",
      year: "numeric",
    },
  );
  const isWeekly = data.frequency === "WEEKLY";
  const periodLabel = isWeekly
    ? `semana ${data.week ?? "actual"} de ${data.year}`
    : monthName;
  const title = isWeekly
    ? `Recordatorio semanal de inspecciones (${periodLabel})`
    : `Recordatorio mensual de inspecciones (${periodLabel})`;
  const cadenceLine = isWeekly
    ? "Este es tu recordatorio semanal para registrar las inspecciones de los vehículos asignados."
    : "Este es tu recordatorio mensual para registrar las inspecciones de los vehículos asignados.";

  const lines = [
    title,
    "",
    `Hola ${data.recipientName},`,
    "",
    cadenceLine,
    "",
    `Vehículos asignados (${data.assignedVehicles.length}):`,
    ...data.assignedVehicles.map(
      (vehicle) => `- ${vehicle.model} (${vehicle.plate})`,
    ),
    "",
    `Abrir inspecciones: ${(process.env.NEXTAUTH_URL || "") + "/dashboard/inspections"}`,
  ];

  return lines.join("\n");
}

export async function sendInspectionMonthlyReminderEmail(
  data: InspectionReminderEmailData,
): Promise<boolean> {
  const html = generateInspectionReminderEmailHTML(data);
  const text = generateInspectionReminderEmailText(data);

  try {
    const result = await sendEmail({
      to: data.recipientEmail,
      subject:
        data.frequency === "WEEKLY"
          ? `[Inspecciones] Recordatorio semanal - Semana ${String(data.week ?? "--")}/${data.year}`
          : `[Inspecciones] Recordatorio mensual - ${String(data.month).padStart(2, "0")}/${data.year}`,
      html,
      text,
    });

    if (!result.success) {
      console.error(
        `Failed to send monthly inspection reminder to ${data.recipientEmail}:`,
        result.error,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      `Failed to send monthly inspection reminder to ${data.recipientEmail}:`,
      error,
    );
    return false;
  }
}

export const sendInspectionScheduledReminderEmail =
  sendInspectionMonthlyReminderEmail;
