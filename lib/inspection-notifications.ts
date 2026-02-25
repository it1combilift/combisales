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

const PHOTO_TYPE_LABELS: Record<InspectionPhotoType, string> = {
  FRONT: "Front",
  REAR: "Rear",
  DRIVER_SIDE: "Driver Side",
  PASSENGER_SIDE: "Passenger Side",
  INTERIOR: "Interior",
  SAFETY_DEVICES: "Safety Devices",
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
      label: "Pending Approval",
    },
    approved: {
      bg: "#E8F5E9",
      text: "#1B5E20",
      border: "#4CAF50",
      label: "Approved",
    },
    rejected: {
      bg: "#FFEBEE",
      text: "#C62828",
      border: "#EF5350",
      label: "Rejected",
    },
  };

  const color = statusColors[type];
  const inspectorName = data.user?.name || data.user?.email || "Unknown";
  const date = new Date(data.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const title =
    type === "created"
      ? "New Vehicle Inspection Submitted"
      : type === "approved"
        ? "Vehicle Inspection Approved"
        : "Vehicle Inspection Rejected";

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
            <td colspan="2" style="font-weight:bold;font-size:14px;color:#424242;">Vehicle Information</td>
          </tr>
          <tr>
            <td style="color:#757575;width:40%;">Vehicle</td>
            <td style="font-weight:500;">${data.vehicle.model}</td>
          </tr>
          <tr style="background:#fafafa;">
            <td style="color:#757575;">License Plate</td>
            <td style="font-weight:500;">${data.vehicle.plate}</td>
          </tr>
          <tr>
            <td style="color:#757575;">Mileage</td>
            <td style="font-weight:500;">${data.mileage.toLocaleString()} km</td>
          </tr>
          <tr style="background:#fafafa;">
            <td style="color:#757575;">Inspector</td>
            <td style="font-weight:500;">${inspectorName}</td>
          </tr>
          <tr>
            <td style="color:#757575;">Date</td>
            <td style="font-weight:500;">${date}</td>
          </tr>
        </table>

        ${
          data.observations
            ? `<div style="margin-bottom:16px;">
              <strong style="color:#424242;">Observations:</strong>
              <p style="color:#616161;margin:4px 0;">${data.observations}</p>
            </div>`
            : ""
        }

        ${
          data.photos && data.photos.length > 0
            ? `<div style="margin-bottom:20px;">
              <strong style="color:#424242;display:block;margin-bottom:10px;">Inspection Photos (${data.photos.length})</strong>
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

        ${
          data.approval?.comments
            ? `<div style="margin-bottom:16px;">
              <strong style="color:#424242;">Reviewer Comments:</strong>
              <p style="color:#616161;margin:4px 0;">${data.approval.comments}</p>
              <span style="color:#9e9e9e;font-size:12px;">By ${data.approval.user?.name || data.approval.user?.email}</span>
            </div>`
            : ""
        }

        <div style="text-align:center;margin-top:24px;">
          <a href="${process.env.NEXTAUTH_URL || ""}/dashboard/inspections"
             style="display:inline-block;padding:12px 24px;background:#679436;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
            View Inspections
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background:#f5f5f5;padding:16px;text-align:center;color:#9e9e9e;font-size:12px;">
        Combilift Sales &mdash; Vehicle Inspection System
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
      ? "New Vehicle Inspection Submitted"
      : type === "approved"
        ? "Vehicle Inspection Approved"
        : "Vehicle Inspection Rejected";

  const lines = [
    title,
    "=".repeat(title.length),
    "",
    `Vehicle: ${data.vehicle.model} (${data.vehicle.plate})`,
    `Mileage: ${data.mileage.toLocaleString()} km`,
    `Inspector: ${data.user?.name || data.user?.email}`,
    `Date: ${new Date(data.createdAt).toLocaleDateString()}`,
  ];

  if (data.observations) {
    lines.push("", `Observations: ${data.observations}`);
  }

  if (data.photos && data.photos.length > 0) {
    lines.push("", `Inspection Photos (${data.photos.length}):`);
    data.photos.forEach((photo) => {
      lines.push(
        `  ${PHOTO_TYPE_LABELS[photo.photoType] || photo.photoType}: ${photo.cloudinaryUrl}`,
      );
    });
  }

  if (data.approval?.comments) {
    lines.push(
      "",
      `Reviewer Comments: ${data.approval.comments}`,
      `By: ${data.approval.user?.name || data.approval.user?.email}`,
    );
  }

  return lines.join("\n");
}

// ==================== SEND FUNCTIONS ====================

/**
 * Send notification to all ADMIN users when a new inspection is created
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

  if (admins.length === 0) return;

  const html = generateInspectionEmailHTML(inspection, "created");
  const text = generateInspectionEmailText(inspection, "created");

  for (const admin of admins) {
    try {
      await sendEmail({
        to: admin.email,
        subject: `[Inspection] New inspection - ${inspection.vehicle.model} (${inspection.vehicle.plate})`,
        html,
        text,
      });
    } catch (error) {
      console.error(
        `Failed to send inspection email to ${admin.email}:`,
        error,
      );
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

  const statusLabel = type === "approved" ? "Approved" : "Rejected";

  try {
    await sendEmail({
      to: inspection.user.email,
      subject: `[Inspection] ${statusLabel} - ${inspection.vehicle.model} (${inspection.vehicle.plate})`,
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
