import React from "react";

import { InspectionStatus, InspectionPhotoType, Role } from "@prisma/client";

// ── PDF Components (components/pdf/*) ──────────────────────────
import { PdfHeader } from "@/components/pdf/pdf-header";
import { PdfInfoCards } from "@/components/pdf/pdf-info-cards";
// import { PdfScore } from "@/components/pdf/pdf-score";
import { PdfChecklist } from "@/components/pdf/pdf-checklist";
import { PdfPhotos } from "@/components/pdf/pdf-photos";
import { PdfObservations } from "@/components/pdf/pdf-observations";
import { PdfSignature } from "@/components/pdf/pdf-signature";
import { PdfApproval } from "@/components/pdf/pdf-approval";

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════

interface PdfVehicle {
  model: string;
  plate: string;
  imageUrl: string | null;
  status: string;
}

interface PdfUser {
  name: string | null;
  email: string;
  roles: Role[];
  image?: string | null;
}

interface PdfPhoto {
  photoType: InspectionPhotoType;
  cloudinaryUrl: string;
}

interface PdfApprovalData {
  approved: boolean;
  comments: string | null;
  user?: { name: string | null; email: string } | null;
  createdAt: string | Date;
}

export interface InspectionPdfData {
  id: number;
  mileage: number;
  status: InspectionStatus;
  observations: string | null;
  signatureUrl: string | null;
  createdAt: string | Date;

  oilLevel: boolean;
  coolantLevel: boolean;
  brakeFluidLevel: boolean;
  hydraulicLevel: boolean;
  brakePedal: boolean;
  clutchPedal: boolean;
  gasPedal: boolean;
  headlights: boolean;
  tailLights: boolean;
  brakeLights: boolean;
  turnSignals: boolean;
  hazardLights: boolean;
  reversingLights: boolean;
  dashboardLights: boolean;

  vehicle: PdfVehicle;
  user: PdfUser;
  photos: PdfPhoto[];
  approval?: PdfApprovalData | null;
}

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════

type Locale = "es" | "en";

const PDF_LABELS: Record<Locale, Record<string, string>> = {
  en: {
    title: "Vehicle Inspection Report",
    subtitle: "CombiSales — Vehicle Inspection System",
    companyFooter: "CombiSales — Vehicle Inspection System",
    generatedOn: "Generated on",
    page: "Page",
    of: "of",
    generalInfo: "General Information",
    inspectionId: "Inspection ID",
    date: "Date",
    status: "Status",
    mileage: "Mileage",
    vehicleInfo: "Vehicle Information",
    model: "Model",
    plate: "License Plate",
    inspectorInfo: "Inspector Information",
    name: "Name",
    email: "Email",
    role: "Role",
    statusPending: "Pending Review",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    checklistTitle: "Inspection Checklist",
    checklistItem: "Item",
    checklistStatus: "Status",
    checklistPass: "PASS",
    checklistFail: "FAIL",
    checklistScore: "Inspection Score",
    passed: "Passed",
    failed: "Failed",
    fluidLevels: "Fluid Levels",
    oilLevel: "Oil Level",
    coolantLevel: "Coolant Level",
    brakeFluidLevel: "Brake Fluid Level",
    hydraulicLevel: "Hydraulic Fluid Level",
    pedals: "Pedals",
    brakePedal: "Brake Pedal",
    clutchPedal: "Clutch Pedal",
    gasPedal: "Gas Pedal",
    lights: "Lights",
    headlights: "Headlights",
    tailLights: "Tail Lights",
    brakeLights: "Brake Lights",
    turnSignals: "Turn Signals",
    hazardLights: "Hazard Lights",
    reversingLights: "Reversing Lights",
    dashboardLights: "Dashboard Lights",
    photosTitle: "Vehicle Photographs",
    photoFront: "Front",
    photoRear: "Rear",
    photoDriverSide: "Driver Side",
    photoPassengerSide: "Passenger Side",
    photoInterior: "Interior",
    photoSafetyDevices: "Safety Devices",
    observationsTitle: "Observations",
    noObservations: "No observations recorded.",
    signatureTitle: "Digital Signature",
    signedBy: "Digitally signed",
    signatureDate: "Date",
    approvalTitle: "Approval Decision",
    approvedBy: "Reviewed by",
    approvalStatus: "Decision",
    approvalComments: "Comments",
    approvalDate: "Date",
    roleAdmin: "Admin",
    roleInspector: "Inspector",
    roleSeller: "P. Manager",
    roleDealer: "Dealer",
  },
  es: {
    title: "Reporte de Inspección Vehicular",
    subtitle: "CombiSales — Sistema de Inspección Vehicular",
    companyFooter: "CombiSales — Sistema de Inspección Vehicular",
    generatedOn: "Generado el",
    page: "Página",
    of: "de",
    generalInfo: "Información General",
    inspectionId: "ID de Inspección",
    date: "Fecha",
    status: "Estado",
    mileage: "Kilometraje",
    vehicleInfo: "Información del Vehículo",
    model: "Modelo",
    plate: "Matrícula",
    inspectorInfo: "Información del Inspector",
    name: "Nombre",
    email: "Email",
    role: "Rol",
    statusPending: "Pendiente de Aprobación",
    statusApproved: "Aprobada",
    statusRejected: "Rechazada",
    checklistTitle: "Lista de Verificación",
    checklistItem: "Elemento",
    checklistStatus: "Estado",
    checklistPass: "OK",
    checklistFail: "FALLO",
    checklistScore: "Resultado de Inspección",
    passed: "Aprobados",
    failed: "Fallidos",
    fluidLevels: "Niveles de Fluidos",
    oilLevel: "Nivel de Aceite",
    coolantLevel: "Nivel de Refrigerante",
    brakeFluidLevel: "Nivel de Líquido de Frenos",
    hydraulicLevel: "Nivel de Fluido Hidráulico",
    pedals: "Pedales",
    brakePedal: "Pedal de Freno",
    clutchPedal: "Pedal de Embrague",
    gasPedal: "Pedal de Acelerador",
    lights: "Luces",
    headlights: "Luces Delanteras",
    tailLights: "Luces Traseras",
    brakeLights: "Luces de Freno",
    turnSignals: "Intermitentes",
    hazardLights: "Luces de Emergencia",
    reversingLights: "Luces de Marcha Atrás",
    dashboardLights: "Luces del Tablero",
    photosTitle: "Fotografías del Vehículo",
    photoFront: "Frontal",
    photoRear: "Trasera",
    photoDriverSide: "Lado del Conductor",
    photoPassengerSide: "Lado del Copiloto",
    photoInterior: "Interior",
    photoSafetyDevices: "Dispositivos de Seguridad",
    observationsTitle: "Observaciones",
    noObservations: "Sin observaciones registradas.",
    signatureTitle: "Firma Digital",
    signedBy: "Firmado digitalmente",
    signatureDate: "Fecha",
    approvalTitle: "Decisión de Aprobación",
    approvedBy: "Revisado por",
    approvalStatus: "Decisión",
    approvalComments: "Comentarios",
    approvalDate: "Fecha",
    roleAdmin: "Admin",
    roleInspector: "Inspector",
    roleSeller: "P. Manager",
    roleDealer: "Dealer",
  },
};

// ═══════════════════════════════════════════════════════════════
//  BROWSER FACTORY
//  - Production (Vercel): puppeteer-core + @sparticuz/chromium-min
//    Downloads Chromium at cold-start from GitHub releases.
//    Set CHROMIUM_EXECUTABLE_PATH env var in Vercel to override.
//  - Local development: regular puppeteer (bundled Chrome)
// ═══════════════════════════════════════════════════════════════

// Hosted chromium binary for Lambda/Vercel (x64, matches @sparticuz/chromium-min@143.0.4)
const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar";

async function getBrowser() {
  if (process.env.NODE_ENV === "production") {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    const puppeteerCore = (await import("puppeteer-core")).default;

    // Allow overriding via Vercel env var (set to the pack URL or a /tmp path)
    const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH
      ? await chromium.executablePath(process.env.CHROMIUM_EXECUTABLE_PATH)
      : await chromium.executablePath(CHROMIUM_PACK_URL);

    return puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: null,
      executablePath,
      headless: true,
    });
  } else {
    const puppeteer = (await import("puppeteer")).default;
    return puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}

// ═══════════════════════════════════════════════════════════════
//  IMAGE PRE-FETCH (convert external URLs → base64 data URIs)
// ═══════════════════════════════════════════════════════════════

const LOGO_URL =
  "https://res.cloudinary.com/dwjxcpfrf/image/upload/v1768957949/Untitled_design__1_-removebg-preview_t8oji9.png";

async function fetchAsBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return url; // fallback to original URL
    const contentType = res.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return url; // fallback to original URL on timeout/error
  }
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function formatDate(date: string | Date, locale: Locale): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(date: string | Date, locale: Locale): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusText(
  status: InspectionStatus,
  t: Record<string, string>,
): string {
  switch (status) {
    case "APPROVED":
      return t.statusApproved;
    case "REJECTED":
      return t.statusRejected;
    default:
      return t.statusPending;
  }
}

function getStatusType(
  status: InspectionStatus,
): "approved" | "rejected" | "pending" {
  switch (status) {
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    default:
      return "pending";
  }
}

function getRoleLabel(roles: Role[], t: Record<string, string>): string {
  return roles
    .map((r) => {
      switch (r) {
        case "ADMIN":
          return t.roleAdmin;
        case "INSPECTOR":
          return t.roleInspector;
        case "SELLER":
          return t.roleSeller;
        case "DEALER":
          return t.roleDealer;
        default:
          return r;
      }
    })
    .join(", ");
}

// ═══════════════════════════════════════════════════════════════
//  REACT DOCUMENT — Composes all components/pdf/* components
// ═══════════════════════════════════════════════════════════════

function InspectionPdfDocument({
  data,
  locale,
  logoBase64,
  photoMap,
  signatureBase64,
}: {
  data: InspectionPdfData;
  locale: Locale;
  logoBase64: string;
  photoMap: Map<string, string>;
  signatureBase64: string | null;
}) {
  const t = PDF_LABELS[locale];

  // ── Checklist Groups ──
  const groups = [
    {
      name: t.fluidLevels,
      items: [
        { label: t.oilLevel, passed: data.oilLevel },
        { label: t.coolantLevel, passed: data.coolantLevel },
        { label: t.brakeFluidLevel, passed: data.brakeFluidLevel },
        { label: t.hydraulicLevel, passed: data.hydraulicLevel },
      ],
    },
    {
      name: t.pedals,
      items: [
        { label: t.brakePedal, passed: data.brakePedal },
        { label: t.clutchPedal, passed: data.clutchPedal },
        { label: t.gasPedal, passed: data.gasPedal },
      ],
    },
    {
      name: t.lights,
      items: [
        { label: t.headlights, passed: data.headlights },
        { label: t.tailLights, passed: data.tailLights },
        { label: t.brakeLights, passed: data.brakeLights },
        { label: t.turnSignals, passed: data.turnSignals },
        { label: t.hazardLights, passed: data.hazardLights },
        { label: t.reversingLights, passed: data.reversingLights },
        { label: t.dashboardLights, passed: data.dashboardLights },
      ],
    },
  ];

  const allItems = groups.flatMap((g) => g.items);
  const passed = allItems.filter((i) => i.passed).length;
  const failed = allItems.filter((i) => !i.passed).length;
  const total = allItems.length;

  // ── Photo type labels ──
  const PHOTO_LABELS: Record<string, string> = {
    FRONT: t.photoFront,
    REAR: t.photoRear,
    DRIVER_SIDE: t.photoDriverSide,
    PASSENGER_SIDE: t.photoPassengerSide,
    INTERIOR: t.photoInterior,
    SAFETY_DEVICES: t.photoSafetyDevices,
  };

  const photos = data.photos.map((p) => ({
    label: PHOTO_LABELS[p.photoType] || p.photoType,
    url: photoMap.get(p.cloudinaryUrl) || p.cloudinaryUrl,
  }));

  return (
    <div
      className="mx-auto max-w-[210mm] space-y-4 px-7 py-4"
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* 1. Header */}
      <PdfHeader
        title={t.title}
        subtitle={t.subtitle}
        status={getStatusText(data.status, t)}
        statusType={getStatusType(data.status)}
        inspectionId={String(data.id)}
        logoUrl={logoBase64}
      />

      {/* 2. Info Cards (General + Vehicle side by side, Inspector full-width) */}
      <PdfInfoCards
        generalInfo={{
          title: t.generalInfo,
          fields: [
            {
              label: t.inspectionId,
              value: String(data.id),
            },
            { label: t.date, value: formatDateShort(data.createdAt, locale) },
            { label: t.status, value: getStatusText(data.status, t) },
            {
              label: t.mileage,
              value: `${data.mileage.toLocaleString(locale === "es" ? "es-ES" : "en-US")} km`,
            },
          ],
        }}
        vehicleInfo={{
          title: t.vehicleInfo,
          fields: [
            { label: t.model, value: data.vehicle.model },
            { label: t.plate, value: data.vehicle.plate },
          ],
        }}
        inspectorInfo={{
          title: t.inspectorInfo,
          fields: [
            { label: t.name, value: data.user.name || "—" },
            { label: t.email, value: data.user.email },
            { label: t.role, value: getRoleLabel(data.user.roles, t) },
          ],
        }}
      />

      {/* 3. Score */}
      {/* <PdfScore
        title={t.checklistScore}
        passed={passed}
        failed={failed}
        total={total}
        passedLabel={t.passed}
        failedLabel={t.failed}
      /> */}

      {/* 4. Checklist Table */}
      <PdfChecklist
        title={t.checklistTitle}
        itemHeader={t.checklistItem}
        statusHeader={t.checklistStatus}
        passLabel={t.checklistPass}
        failLabel={t.checklistFail}
        groups={groups}
      />

      {/* 5. Photos */}
      {photos.length > 0 && <PdfPhotos title={t.photosTitle} photos={photos} />}

      {/* 6. Observations */}
      <PdfObservations
        title={t.observationsTitle}
        text={data.observations}
        noObservationsLabel={t.noObservations}
      />

      {/* 7. Signature */}
      {data.signatureUrl && (
        <PdfSignature
          title={t.signatureTitle}
          signatureUrl={signatureBase64 || data.signatureUrl}
          name={data.user.name || "—"}
          role={getRoleLabel(data.user.roles, t)}
          date={formatDate(data.createdAt, locale)}
          signedByLabel={t.signedBy}
        />
      )}

      {/* 8. Approval */}
      {data.approval && (
        <PdfApproval
          title={t.approvalTitle}
          isApproved={data.approval.approved}
          statusLabel={
            data.approval.approved ? t.statusApproved : t.statusRejected
          }
          reviewedByLabel={t.approvedBy}
          reviewerName={
            data.approval.user?.name || data.approval.user?.email || "—"
          }
          dateLabel={t.approvalDate}
          dateValue={formatDate(data.approval.createdAt, locale)}
          commentsLabel={t.approvalComments}
          comments={data.approval.comments}
          decisionLabel={t.approvalStatus}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  FOOTER TEMPLATE  — Replicates PdfFooter design for puppeteer
//  (puppeteer footerTemplate requires inline-styled HTML with
//   special .pageNumber / .totalPages CSS classes for numbering)
// ═══════════════════════════════════════════════════════════════

function buildFooterTemplate(data: InspectionPdfData, locale: Locale): string {
  const t = PDF_LABELS[locale];
  const date = formatDateShort(data.createdAt, locale);

  return `
    <div style="width:100%;padding:0 28px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;">
      <div style="height:1px;background:linear-gradient(to right,#679436,rgba(103,148,54,0.4),transparent);margin-bottom:5px;"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:7px;color:#bdbdbd;letter-spacing:0.05em;">${t.companyFooter}</span>
        <span style="font-size:7px;color:#bdbdbd;">${t.generatedOn}: ${date}</span>
        <span style="font-size:7px;font-weight:600;color:#9e9e9e;">
          ${t.page} <span class="pageNumber"></span> ${t.of} <span class="totalPages"></span>
        </span>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
//  MAIN GENERATOR
//  Renders the React components to HTML, then uses Puppeteer
//  (headless Chrome) to produce a pixel-perfect PDF.
// ═══════════════════════════════════════════════════════════════

export async function generateInspectionPdf(
  data: InspectionPdfData,
  locale: Locale = "es",
): Promise<Buffer> {
  // 0) Pre-fetch all images as base64 data URIs (guarantees rendering)
  const logoBase64Promise = fetchAsBase64(LOGO_URL);

  const photoEntries = data.photos.map(
    (p) => [p.cloudinaryUrl, fetchAsBase64(p.cloudinaryUrl)] as const,
  );
  const photoResults = await Promise.all(
    photoEntries.map(async ([url, promise]) => [url, await promise] as const),
  );
  const photoMap = new Map(photoResults);

  const signatureBase64 = data.signatureUrl
    ? await fetchAsBase64(data.signatureUrl)
    : null;

  const logoBase64 = await logoBase64Promise;

  // 1) Render React component tree → static HTML
  const { renderToStaticMarkup } = await import("react-dom/server");
  const bodyHtml = renderToStaticMarkup(
    <InspectionPdfDocument
      data={data}
      locale={locale}
      logoBase64={logoBase64}
      photoMap={photoMap}
      signatureBase64={signatureBase64}
    />,
  );

  // 2) Wrap in full HTML document with Tailwind CDN for class processing
  const fullHtml = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background: #fff;
    }
    /* Prevent blank trailing page */
    body > div:last-child { margin-bottom: 0 !important; padding-bottom: 0 !important; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

  // 3) Launch headless Chrome and generate PDF
  const browser = await getBrowser();

  try {
    const page = await browser.newPage();

    // Set content and wait for Tailwind CDN + external images
    await page.setContent(fullHtml, {
      waitUntil: "networkidle0",
      timeout: 30_000,
    });

    // Generate A4 PDF with header/footer
    const pdfUint8 = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: buildFooterTemplate(data, locale),
      margin: {
        top: "6mm",
        bottom: "14mm",
        left: "0mm",
        right: "0mm",
      },
    });

    return Buffer.from(pdfUint8);
  } finally {
    await browser.close();
  }
}
