import { formatDateShort } from "@/lib/utils";
import { EMAIL_CONFIG } from "@/constants/constants";
import { TipoAlimentacion, VisitStatus } from "@prisma/client";
import { formatFileSize } from "@/components/formulario-css-analisis/utils/file-utils";

import {
  VisitEmailData,
  DimensionCargaEmail,
  FormularioCSSEmailData,
  FormularioIndustrialEmailData,
  FormularioLogisticaEmailData,
  FormularioStraddleCarrierEmailData,
} from "@/interfaces/email";

import es from "@/locales/es.json";
import en from "@/locales/en.json";

type Locale = "es" | "en";
const translations = { es, en };

function t(key: string, locale: string = "es"): string {
  const lang = (locale === "en" ? "en" : "es") as Locale;
  const keys = key.split(".");
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}

// ==================== COLOR PALETTE ====================
const COLORS = {
  // Brand
  brand: "#5FA82E",
  brandLight: "#7BC043",
  brandDark: "#38b000",

  // Neutral
  white: "#ffffff",
  lightGray: "#f8fafc",
  mediumGray: "#e2e8f0",
  darkGray: "#64748b",
  darkerGray: "#475569",
  black: "#1e293b",

  // Status
  success: "#16a34a",
  successBg: "#dcfce7",
  successText: "#166534",
  warning: "#d97706",
  warningBg: "#fef3c7",
  warningText: "#92400e",
  info: "#2563eb",
  infoBg: "#dbeafe",
  infoText: "#1e40af",

  // Section colors
  sectionBg: "#f1f5f9",
  sectionBorder: "#cbd5e1",

  // File badges
  imageBadge: "#3b82f6",
  pdfBadge: "#dc2626",
  videoBadge: "#9333ea",
  docBadge: "#2563eb",
  excelBadge: "#16a34a",
  defaultBadge: "#64748b",
} as const;

// ==================== HELPER FUNCTIONS ====================

function getStatusConfig(
  status: string,
  locale: string = "es",
): {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
} {
  switch (status) {
    case VisitStatus.COMPLETADA:
      return {
        label: t("email.status.completed", locale),
        bgColor: COLORS.successBg,
        textColor: COLORS.successText,
        borderColor: COLORS.success,
      };
    case VisitStatus.BORRADOR:
      return {
        label: t("email.status.draft", locale),
        bgColor: COLORS.warningBg,
        textColor: COLORS.warningText,
        borderColor: COLORS.warning,
      };
    default:
      return {
        label: t("email.status.draft", locale),
        bgColor: COLORS.warningBg,
        textColor: COLORS.warningText,
        borderColor: COLORS.warning,
      };
  }
}

function getFileTypeLabel(
  tipoArchivo: string,
  locale: string = "es",
): {
  label: string;
  color: string;
} {
  const type = tipoArchivo.toLowerCase();
  if (
    type.includes("image") ||
    type.includes("jpg") ||
    type.includes("png") ||
    type.includes("jpeg") ||
    type.includes("gif") ||
    type.includes("webp") ||
    type === "imagen"
  ) {
    return {
      label: t("email.files.fileTypes.image", locale),
      color: COLORS.imageBadge,
    };
  }
  if (type.includes("pdf")) {
    return {
      label: t("email.files.fileTypes.pdf", locale),
      color: COLORS.pdfBadge,
    };
  }
  if (
    type.includes("video") ||
    type.includes("mp4") ||
    type.includes("mov") ||
    type.includes("avi")
  ) {
    return {
      label: t("email.files.fileTypes.video", locale),
      color: COLORS.videoBadge,
    };
  }
  if (
    type.includes("doc") ||
    type.includes("word") ||
    type.includes("documento")
  ) {
    return {
      label: t("email.files.fileTypes.document", locale),
      color: COLORS.docBadge,
    };
  }
  if (
    type.includes("xls") ||
    type.includes("excel") ||
    type.includes("spreadsheet")
  ) {
    return {
      label: t("email.files.fileTypes.excel", locale),
      color: COLORS.excelBadge,
    };
  }
  return {
    label: t("email.files.fileTypes.file", locale),
    color: COLORS.defaultBadge,
  };
}

function formatNumber(
  value: number | null | undefined,
  unit?: string,
  locale: string = "es",
): string {
  if (value === null || value === undefined) return "-";
  const formatted = value.toLocaleString(locale === "en" ? "en-US" : "es-ES");
  return unit ? `${formatted} ${unit}` : formatted;
}

function formatBoolean(
  value: boolean | undefined,
  locale: string = "es",
): string {
  return value ? t("email.common.yes", locale) : t("email.common.no", locale);
}

/**
 * Get translated form type name
 */
function getFormTypeName(formType: string, locale: string = "es"): string {
  const formTypeKeys: Record<string, string> = {
    ANALISIS_CSS: "visits.formTypes.css",
    ANALISIS_INDUSTRIAL: "visits.formTypes.industrial",
    ANALISIS_LOGISTICA: "visits.formTypes.logistica",
    ANALISIS_STRADDLE_CARRIER: "visits.formTypes.straddleCarrier",
  };
  return t(formTypeKeys[formType] || "email.subject.visit", locale);
}

// ==================== SECTION BUILDING BLOCKS ====================

/**
 * Build a section header with title (no emoji)
 */
function buildSectionHeader(title: string): string {
  return `
    <tr>
      <td colspan="2" style="padding: 12px 16px; background-color: #60A82E; background: linear-gradient(135deg, #60A82E 0%, #4A8524 100%); border-radius: 6px 6px 0 0;">
        <span style="font-size: 14px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
          ${title}
        </span>
      </td>
    </tr>
  `;
}

/**
 * Build a subsection header (within a section)
 */
function buildSubsectionHeader(title: string): string {
  return `
    <tr>
      <td colspan="2" style="padding: 10px 16px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
        <span style="font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.3px;">
          ${title}
        </span>
      </td>
    </tr>
  `;
}

/**
 * Build a data row (key-value pair)
 */
function buildRow(
  label: string,
  value: string | null | undefined,
  options?: { highlight?: boolean; fullWidth?: boolean },
): string {
  if (!value || value === "-" || value.trim() === "") return "";

  const labelColor = "#6c757d";
  const valueColor = options?.highlight ? "#5FA82E" : "#1e293b";
  const bgColor = "#ffffff";
  const borderColor = "#e2e8f0";

  if (options?.fullWidth) {
    return `
      <tr>
        <td colspan="2" style="padding: 8px 16px; border-bottom: 1px solid ${borderColor}; background-color: ${bgColor};">
          <div style="font-size: 11px; color: ${labelColor}; text-transform: uppercase; margin-bottom: 4px;">${label}</div>
          <div style="font-size: 14px; color: ${valueColor}; line-height: 1.5;">${value}</div>
        </td>
      </tr>
    `;
  }

  return `
    <tr>
      <td style="padding: 8px 16px; font-size: 12px; color: ${labelColor}; width: 40%; vertical-align: top; border-bottom: 1px solid ${borderColor}; background-color: ${bgColor};">
        ${label}
      </td>
      <td style="padding: 8px 16px; font-size: 14px; color: ${valueColor}; border-bottom: 1px solid ${borderColor}; background-color: ${bgColor};">
        ${value}
      </td>
    </tr>
  `;
}

/**
 * Build a notes/description block
 */
function buildNotesBlock(label: string, content: string): string {
  if (!content) return "";
  return `
    <tr>
      <td colspan="2" style="padding: 12px 16px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
        <div style="font-size: 11px; color: #0a0908; text-transform: uppercase; margin-bottom: 6px;">${label}</div>
        <div style="font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap; background-color: #ffffff; padding: 12px; border-radius: 4px; border-left: 3px solid #5FA82E;">${content}</div>
      </td>
    </tr>
  `;
}

/**
 * Start a section container
 */
function startSection(): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; border-collapse: collapse;">
  `;
}

/**
 * End a section container
 */
function endSection(): string {
  return `</table>`;
}

// ==================== CUSTOMER INFO SECTION ====================

/**
 * Build customer information section for email
 */
function buildCustomerInfoSection(
  data: VisitEmailData,
  locale: string = "es",
): string {
  let html = "";

  // Only build section if there's meaningful customer data
  const hasCustomerData =
    data.razonSocial ||
    data.personaContacto ||
    data.email ||
    data.direccion ||
    data.localidad ||
    data.pais;

  if (!hasCustomerData) return "";

  html += startSection();
  html += buildSectionHeader(t("email.sections.customerInfo", locale));

  // Company name
  html += buildRow(
    t("email.customer.company", locale),
    data.razonSocial || null,
  );

  // Contact person
  html += buildRow(
    t("email.customer.contact", locale),
    data.personaContacto || null,
  );

  // Email
  if (data.email) {
    html += buildRow(
      t("email.customer.email", locale),
      `<a href="mailto:${data.email}" style="color: #60A82E; text-decoration: none;">${data.email}</a>`,
    );
  }

  // Build full address
  const addressParts = [data.direccion].filter(Boolean);
  const address = addressParts.join("");
  if (address) {
    html += buildRow(t("email.customer.address", locale), address);
  }

  // Location (city, state, postal code)
  const locationParts = [
    data.localidad,
    data.provinciaEstado,
    data.codigoPostal,
  ].filter(Boolean);
  const location = locationParts.join(", ");
  if (location) {
    html += buildRow(t("email.customer.city", locale), location);
  }

  // Country
  html += buildRow(t("email.customer.country", locale), data.pais || null);

  // Website
  if (data.website) {
    html += buildRow(
      t("email.customer.website", locale),
      `<a href="${data.website.startsWith("http") ? data.website : `https://${data.website}`}" target="_blank" style="text-decoration: none;">${data.website}</a>`,
    );
  }

  // Tax ID
  html += buildRow(
    t("email.customer.taxId", locale),
    data.numeroIdentificacionFiscal || null,
  );

  // Distributor info
  if (data.distribuidor) {
    html += buildSubsectionHeader(t("email.customer.distributor", locale));
    html += buildRow(
      t("email.customer.distributor", locale),
      data.distribuidor,
    );
    html += buildRow(
      t("email.customer.distributorContact", locale),
      data.contactoDistribuidor || null,
    );
  }

  html += endSection();

  return html;
}

// ==================== CSS FORM CONTENT ====================

function buildCSSFormContent(
  data: FormularioCSSEmailData,
  locale: string = "es",
): string {
  let html = "";

  // Section: Contenedor
  html += startSection();
  html += buildSectionHeader(t("forms.css.steps.container.title", locale));
  html += buildRow(
    t("forms.css.fields.containerType.label", locale),
    data.contenedorTipos
      ?.map((tipo) => t(`visits.containerTypes.${tipo}`, locale))
      .join(", ") || null,
  );
  html += buildRow(
    t("forms.css.fields.containersPerWeek.label", locale),
    formatNumber(data.contenedoresPorSemana, undefined, locale),
  );
  html += buildRow(
    t("forms.css.fields.floorConditions.label", locale),
    data.condicionesSuelo || null,
  );
  html += endSection();

  // Section: Medidas
  html += startSection();
  html += buildSectionHeader(t("forms.css.fields.measurements.label", locale));
  html += buildRow(
    t("forms.css.fields.measurements.label", locale),
    data.contenedorMedidas
      ?.map((medida) => t(`visits.containerMeasures.${medida}`, locale))
      .join(", ") || null,
  );

  if (data.contenedorMedidaOtro) {
    html += buildRow(
      t("visits.containerMeasures.OTRO", locale),
      data.contenedorMedidaOtro,
    );
  }
  html += endSection();

  // Section: Datos adicionales (if present)
  if (data.datosClienteUsuarioFinal) {
    html += startSection();
    html += buildSectionHeader(t("email.sections.additionalInfo", locale));
    html += buildNotesBlock(
      t("email.sections.endUserData", locale),
      data.datosClienteUsuarioFinal,
    );
    html += endSection();
  }

  return html;
}

// ==================== INDUSTRIAL FORM CONTENT ====================

function buildDimensionsTable(
  cargas: DimensionCargaEmail[],
  locale: string = "es",
): string {
  if (!cargas || cargas.length === 0) return "";

  const headerStyle = `padding: 10px 8px; font-size: 11px; color: #64748b; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e2e8f0; background-color: #f1f5f9;`;
  const cellStyle = `padding: 8px; font-size: 13px; text-align: center; border-bottom: 1px solid #e2e8f0;`;

  const rows = cargas
    .map(
      (c, i) => `
    <tr>
      <td style="${cellStyle} text-align: left; color: #1e293b; background-color: ${
        i % 2 === 0 ? "#ffffff" : "#f8fafc"
      };">${c.producto || "-"}</td>
      <td style="${cellStyle} color: #475569; background-color: ${
        i % 2 === 0 ? "#ffffff" : "#f8fafc"
      };">${formatNumber(c.largo, undefined, locale)}</td>
      <td style="${cellStyle} color: #475569; background-color: ${
        i % 2 === 0 ? "#ffffff" : "#f8fafc"
      };">${formatNumber(c.fondo, undefined, locale)}</td>
      <td style="${cellStyle} color: #475569; background-color: ${
        i % 2 === 0 ? "#ffffff" : "#f8fafc"
      };">${formatNumber(c.alto, undefined, locale)}</td>
      <td style="${cellStyle} color: #475569; background-color: ${
        i % 2 === 0 ? "#ffffff" : "#f8fafc"
      };">${formatNumber(c.peso, undefined, locale)}</td>
      <td style="${cellStyle} color: #60A82E; background-color: ${
        i % 2 === 0 ? "#ffffff" : "#f8fafc"
      };">${formatNumber(c.porcentaje, undefined, locale)}%</td>
    </tr>
  `,
    )
    .join("");

  return `
    <tr>
      <td colspan="2" style="padding: 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="${headerStyle} text-align: left;">${t(
                "email.industrial.loadTable.product",
                locale,
              )}</th>
              <th style="${headerStyle}">${t(
                "email.industrial.loadTable.length",
                locale,
              )}</th>
              <th style="${headerStyle}">${t(
                "email.industrial.loadTable.depth",
                locale,
              )}</th>
              <th style="${headerStyle}">${t(
                "email.industrial.loadTable.height",
                locale,
              )}</th>
              <th style="${headerStyle}">${t(
                "email.industrial.loadTable.weight",
                locale,
              )}</th>
              <th style="${headerStyle}">${t(
                "email.industrial.loadTable.percentage",
                locale,
              )}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </td>
    </tr>
  `;
}

function buildElectricalEquipmentRows(
  equipos: FormularioIndustrialEmailData["equiposElectricos"],
  locale: string = "es",
): string {
  if (!equipos || equipos.noAplica) return "";

  let rows = "";
  rows += buildRow(
    t("email.industrial.currentType", locale),
    equipos.tipoCorriente || null,
  );
  rows += buildRow(
    t("email.industrial.voltage", locale),
    formatNumber(equipos.voltaje, "V", locale),
  );
  rows += buildRow(
    t("email.industrial.frequency", locale),
    formatNumber(equipos.frecuencia, "Hz", locale),
  );
  rows += buildRow(
    t("email.industrial.amperage", locale),
    formatNumber(equipos.amperaje, "A", locale),
  );
  rows += buildRow(
    t("email.industrial.ambientTemperature", locale),
    formatNumber(equipos.temperaturaAmbiente, "°C", locale),
  );
  rows += buildRow(
    t("email.industrial.workHoursPerDay", locale),
    formatNumber(equipos.horasTrabajoPorDia, "h", locale),
  );
  if (equipos.notas) {
    rows += buildNotesBlock(t("email.industrial.notes", locale), equipos.notas);
  }
  return rows;
}

function buildIndustrialFormContent(
  data: FormularioIndustrialEmailData,
  locale: string = "es",
): string {
  let html = "";

  // Section 1: Descripción de operación
  if (data.notasOperacion) {
    html += startSection();
    html += buildSectionHeader(
      t("email.industrial.operationDescription", locale),
    );
    html += buildNotesBlock(
      t("email.industrial.operationNotes", locale),
      data.notasOperacion,
    );
    html += endSection();
  }

  // Section 2: Datos de aplicación
  html += startSection();
  html += buildSectionHeader(t("email.industrial.applicationDetails", locale));
  html += buildRow(
    t("email.industrial.lastShelfLevel", locale),
    formatNumber(data.alturaUltimoNivelEstanteria, "mm", locale),
  );
  html += buildRow(
    t("email.industrial.maxLiftHeight", locale),
    formatNumber(data.maximaAlturaElevacion, "mm", locale),
  );
  html += buildRow(
    t("email.industrial.maxHeightLoadWeight", locale),
    formatNumber(data.pesoCargaMaximaAltura, "kg", locale),
  );
  html += buildRow(
    t("email.industrial.firstLevelLoadWeight", locale),
    formatNumber(data.pesoCargaPrimerNivel, "kg", locale),
  );
  if (data.dimensionesAreaTrabajoAncho && data.dimensionesAreaTrabajoFondo) {
    html += buildRow(
      t("email.industrial.workArea", locale),
      `${formatNumber(
        data.dimensionesAreaTrabajoAncho,
        undefined,
        locale,
      )} × ${formatNumber(
        data.dimensionesAreaTrabajoFondo,
        undefined,
        locale,
      )} mm`,
    );
  }
  html += buildRow(
    t("email.industrial.workShifts", locale),
    formatNumber(data.turnosTrabajo, undefined, locale),
  );
  html += buildRow(
    t("email.industrial.desiredPower", locale),
    data.alimentacionDeseada === TipoAlimentacion.ELECTRICO
      ? t("visits.powerTypes.ELECTRICO", locale)
      : data.alimentacionDeseada === TipoAlimentacion.DIESEL
        ? t("visits.powerTypes.DIESEL", locale)
        : data.alimentacionDeseada === TipoAlimentacion.GLP
          ? t("visits.powerTypes.GLP", locale)
          : null,
  );
  html += endSection();

  // Section 3: Baterías / Equipos eléctricos
  if (data.equiposElectricos && !data.equiposElectricos.noAplica) {
    html += startSection();
    html += buildSectionHeader(
      t("email.industrial.electricalEquipment", locale),
    );
    html += buildElectricalEquipmentRows(data.equiposElectricos, locale);
    html += endSection();
  }

  // Section 4: Dimensiones de cargas
  if (data.dimensionesCargas && data.dimensionesCargas.length > 0) {
    html += startSection();
    html += buildSectionHeader(t("email.industrial.loadDimensions", locale));
    html += buildDimensionsTable(data.dimensionesCargas, locale);
    html += endSection();
  }

  // Section 5: Especificaciones del pasillo
  const hasPasilloData =
    data.profundidadProducto ||
    data.anchoLibreEntreProductos ||
    data.distanciaLibreEntreEstanterias ||
    data.fondoUtilEstanteria ||
    data.alturaBaseEstanteria ||
    data.alturaSueloPrimerBrazo ||
    data.grosorPilarColumna ||
    data.alturaMaximaInteriorEdificio;

  if (hasPasilloData) {
    html += startSection();
    html += buildSectionHeader(t("email.industrial.aisleSpecs", locale));
    html += buildRow(
      t("email.industrial.productDepth", locale),
      formatNumber(data.profundidadProducto, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.widthBetweenProducts", locale),
      formatNumber(data.anchoLibreEntreProductos, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.distBetweenRacks", locale),
      formatNumber(data.distanciaLibreEntreEstanterias, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.rackUsefulDepth", locale),
      formatNumber(data.fondoUtilEstanteria, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.rackBaseHeight", locale),
      formatNumber(data.alturaBaseEstanteria, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.floorToFirstArm", locale),
      formatNumber(data.alturaSueloPrimerBrazo, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.columnThickness", locale),
      formatNumber(data.grosorPilarColumna, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.maxInteriorHeight", locale),
      formatNumber(data.alturaMaximaInteriorEdificio, "mm", locale),
    );
    html += endSection();
  }

  return html;
}

// ==================== LOGISTICA FORM CONTENT ====================

function buildLogisticaFormContent(
  data: FormularioLogisticaEmailData,
  locale: string = "es",
): string {
  let html = "";

  // Section 1: Descripción de operación
  html += startSection();
  html += buildSectionHeader(t("email.logistica.operationDescription", locale));

  if (data.notasOperacion) {
    html += buildNotesBlock(
      t("email.logistica.operationNotes", locale),
      data.notasOperacion,
    );
  }

  // Subsection: Condiciones del lugar
  html += buildSubsectionHeader(t("email.logistica.placeConditions", locale));
  html += buildRow(
    t("email.logistica.hasRamps", locale),
    formatBoolean(data.tieneRampas, locale),
  );
  if (data.tieneRampas && data.notasRampas) {
    html += buildRow(
      t("email.logistica.rampDetails", locale),
      data.notasRampas,
    );
  }
  html += buildRow(
    t("email.logistica.hasDoorways", locale),
    formatBoolean(data.tienePasosPuertas, locale),
  );
  if (data.tienePasosPuertas && data.notasPasosPuertas) {
    html += buildRow(
      t("email.logistica.doorwayDetails", locale),
      data.notasPasosPuertas,
    );
  }
  html += buildRow(
    t("email.logistica.hasRestrictions", locale),
    formatBoolean(data.tieneRestricciones, locale),
  );
  if (data.tieneRestricciones && data.notasRestricciones) {
    html += buildRow(
      t("email.logistica.restrictionDetails", locale),
      data.notasRestricciones,
    );
  }

  // Subsection: Medidas de nave
  html += buildSubsectionHeader(
    t("email.logistica.warehouseMeasurements", locale),
  );
  html += buildRow(
    t("email.logistica.maxWarehouseHeight", locale),
    formatNumber(data.alturaMaximaNave, "mm", locale),
  );
  html += buildRow(
    t("email.logistica.currentAisleWidth", locale),
    formatNumber(data.anchoPasilloActual, "mm", locale),
  );
  html += buildRow(
    t("email.logistica.workSurface", locale),
    formatNumber(data.superficieTrabajo, "m²", locale),
  );
  html += buildRow(
    t("email.logistica.floorConditions", locale),
    data.condicionesSuelo || null,
  );
  html += buildRow(
    t("email.logistica.operationType", locale),
    data.tipoOperacion || null,
  );
  html += endSection();

  // Section 2: Datos de aplicación
  html += startSection();
  html += buildSectionHeader(t("email.logistica.applicationDetails", locale));
  html += buildRow(
    t("email.logistica.lastShelfLevel", locale),
    formatNumber(data.alturaUltimoNivelEstanteria, "mm", locale),
  );
  html += buildRow(
    t("email.logistica.maxLiftHeight", locale),
    formatNumber(data.maximaAlturaElevacion, "mm", locale),
  );
  html += buildRow(
    t("email.logistica.maxHeightLoadWeight", locale),
    formatNumber(data.pesoCargaMaximaAltura, "kg", locale),
  );
  html += buildRow(
    t("email.logistica.firstLevelLoadWeight", locale),
    formatNumber(data.pesoCargaPrimerNivel, "kg", locale),
  );
  if (data.dimensionesAreaTrabajoAncho && data.dimensionesAreaTrabajoFondo) {
    html += buildRow(
      t("email.logistica.workArea", locale),
      `${formatNumber(
        data.dimensionesAreaTrabajoAncho,
        undefined,
        locale,
      )} × ${formatNumber(
        data.dimensionesAreaTrabajoFondo,
        undefined,
        locale,
      )} mm`,
    );
  }
  html += buildRow(
    t("email.logistica.workShifts", locale),
    formatNumber(data.turnosTrabajo, undefined, locale),
  );
  html += buildRow(
    t("email.logistica.desiredPower", locale),
    data.alimentacionDeseada === TipoAlimentacion.ELECTRICO
      ? t("visits.powerTypes.ELECTRICO", locale)
      : data.alimentacionDeseada === TipoAlimentacion.DIESEL
        ? t("visits.powerTypes.DIESEL", locale)
        : data.alimentacionDeseada === TipoAlimentacion.GLP
          ? t("visits.powerTypes.GLP", locale)
          : null,
  );
  html += endSection();

  // Section 3: Baterías / Equipos eléctricos
  if (data.equiposElectricos && !data.equiposElectricos.noAplica) {
    html += startSection();
    html += buildSectionHeader(
      t("email.logistica.electricalEquipment", locale),
    );
    html += buildElectricalEquipmentRows(data.equiposElectricos, locale);
    html += endSection();
  }

  // Section 4: Dimensiones de cargas
  if (data.dimensionesCargas && data.dimensionesCargas.length > 0) {
    html += startSection();
    html += buildSectionHeader(t("email.logistica.loadDimensions", locale));
    html += buildDimensionsTable(data.dimensionesCargas, locale);
    html += endSection();
  }

  // Section 5: Pasillo actual
  if (data.pasilloActual) {
    const p = data.pasilloActual;
    const hasPasilloData =
      p.distanciaEntreEstanterias ||
      p.distanciaEntreProductos ||
      p.anchoPasilloDisponible ||
      p.tipoEstanterias ||
      p.nivelEstanterias ||
      p.alturaMaximaEstanteria;

    if (hasPasilloData) {
      html += startSection();
      html += buildSectionHeader(t("email.logistica.currentAisle", locale));
      html += buildRow(
        t("email.logistica.distBetweenRacks", locale),
        formatNumber(p.distanciaEntreEstanterias, "mm", locale),
      );
      html += buildRow(
        t("email.logistica.distBetweenProducts", locale),
        formatNumber(p.distanciaEntreProductos, "mm", locale),
      );
      html += buildRow(
        t("email.logistica.availableAisleWidth", locale),
        formatNumber(p.anchoPasilloDisponible, "mm", locale),
      );
      html += buildRow(
        t("email.logistica.rackType", locale),
        p.tipoEstanterias || null,
      );
      html += buildRow(
        t("email.logistica.rackLevels", locale),
        formatNumber(p.nivelEstanterias, undefined, locale),
      );
      html += buildRow(
        t("email.logistica.maxRackHeight", locale),
        formatNumber(p.alturaMaximaEstanteria, "mm", locale),
      );
      html += endSection();
    }
  }

  return html;
}

// ==================== STRADDLE CARRIER FORM CONTENT ====================

function buildStraddleCarrierFormContent(
  data: FormularioStraddleCarrierEmailData,
  locale: string = "es",
): string {
  let html = "";

  // Section 1: Instrucciones / Tipo de manejo
  html += startSection();
  html += buildSectionHeader(t("email.straddleCarrier.handlingType", locale));
  html += buildRow(
    t("email.straddleCarrier.handlesContainers", locale),
    formatBoolean(data.manejaContenedores, locale),
    {
      highlight: data.manejaContenedores,
    },
  );
  html += buildRow(
    t("email.straddleCarrier.handlesSpecialLoad", locale),
    formatBoolean(data.manejaCargaEspecial, locale),
    {
      highlight: data.manejaCargaEspecial,
    },
  );
  html += endSection();

  // Section 2: Contenedores (if applicable)
  if (data.manejaContenedores) {
    html += startSection();
    html += buildSectionHeader(t("email.straddleCarrier.containers", locale));

    html += buildRow(
      t("email.straddleCarrier.individualContainers", locale),
      formatBoolean(data.manejaContenedoresIndiv, locale),
    );
    html += buildRow(
      t("email.straddleCarrier.doubleStacking", locale),
      formatBoolean(data.dobleApilamiento, locale),
    );

    // Container sizes
    if (data.contenedoresTamanios) {
      const sizes: string[] = [];
      const ct = data.contenedoresTamanios;
      if (ct.size20ft?.selected)
        sizes.push(`20ft (${ct.size20ft.cantidad || 0})`);
      if (ct.size30ft?.selected)
        sizes.push(`30ft (${ct.size30ft.cantidad || 0})`);
      if (ct.size40ft?.selected)
        sizes.push(`40ft (${ct.size40ft.cantidad || 0})`);
      if (ct.size45ft?.selected)
        sizes.push(`45ft (${ct.size45ft.cantidad || 0})`);
      if (ct.size53ft?.selected)
        sizes.push(`53ft (${ct.size53ft.cantidad || 0})`);
      if (sizes.length > 0) {
        html += buildRow(
          t("email.straddleCarrier.containerSizes", locale),
          sizes.join(", "),
        );
      }
    }

    html += buildRow(
      t("email.straddleCarrier.maxContainerWeight", locale),
      formatNumber(data.pesoMaximoContenedor, "kg", locale),
    );

    if (data.infoAdicionalContenedores) {
      html += buildNotesBlock(
        t("email.straddleCarrier.additionalInfo", locale),
        data.infoAdicionalContenedores,
      );
    }
    html += endSection();
  }

  // Section 3: Carga especial (if applicable)
  if (data.manejaCargaEspecial) {
    html += startSection();
    html += buildSectionHeader(t("email.straddleCarrier.specialLoad", locale));

    // Subsection: Dimensiones de productos
    html += buildSubsectionHeader(
      t("email.straddleCarrier.productDimensions", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.longestProduct", locale),
      formatNumber(data.productoMasLargo, "mm", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.shortestProduct", locale),
      formatNumber(data.productoMasCorto, "mm", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.widestProduct", locale),
      formatNumber(data.productoMasAncho, "mm", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.narrowestProduct", locale),
      formatNumber(data.productoMasEstrecho, "mm", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.tallestProduct", locale),
      formatNumber(data.productoMasAlto, "mm", locale),
    );

    // Subsection: Puntos de elevación
    html += buildSubsectionHeader(
      t("email.straddleCarrier.liftPointsAndWeights", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.liftPointsLength", locale),
      formatNumber(data.puntosElevacionLongitud, "mm", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.liftPointsWidth", locale),
      formatNumber(data.puntosElevacionAncho, "mm", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.maxWeightLongProduct", locale),
      formatNumber(data.pesoMaximoProductoLargo, "kg", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.maxWeightShortProduct", locale),
      formatNumber(data.pesoMaximoProductoCorto, "kg", locale),
    );
    html += endSection();
  }

  // Section 4: Otros / Condiciones
  const hasOtrosData =
    data.zonasPasoAncho ||
    data.zonasPasoAlto ||
    data.condicionesPiso ||
    data.pisoPlano !== undefined ||
    data.restriccionesAltura ||
    data.restriccionesAnchura ||
    data.notasAdicionales;

  if (hasOtrosData) {
    html += startSection();
    html += buildSectionHeader(
      t("email.straddleCarrier.additionalConditions", locale),
    );

    // Subsection: Zonas de paso
    if (data.zonasPasoAncho || data.zonasPasoAlto) {
      html += buildSubsectionHeader(
        t("email.straddleCarrier.passageZones", locale),
      );
      html += buildRow(
        t("email.straddleCarrier.passageWidth", locale),
        formatNumber(data.zonasPasoAncho, "mm", locale),
      );
      html += buildRow(
        t("email.straddleCarrier.passageHeight", locale),
        formatNumber(data.zonasPasoAlto, "mm", locale),
      );
    }

    // Subsection: Condiciones del piso
    html += buildSubsectionHeader(
      t("email.straddleCarrier.floorConditions", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.floorConditionsLabel", locale),
      data.condicionesPiso || null,
    );
    html += buildRow(
      t("email.straddleCarrier.flatFloor", locale),
      formatBoolean(data.pisoPlano, locale),
    );

    // Subsection: Restricciones
    if (data.restriccionesAltura || data.restriccionesAnchura) {
      html += buildSubsectionHeader(
        t("email.straddleCarrier.restrictions", locale),
      );
      html += buildRow(
        t("email.straddleCarrier.heightRestriction", locale),
        formatNumber(data.restriccionesAltura, "mm", locale),
      );
      html += buildRow(
        t("email.straddleCarrier.widthRestriction", locale),
        formatNumber(data.restriccionesAnchura, "mm", locale),
      );
    }

    // Notes
    if (data.notasAdicionales) {
      html += buildNotesBlock(
        t("email.straddleCarrier.additionalNotes", locale),
        data.notasAdicionales,
      );
    }
    html += endSection();
  }

  return html;
}

// ==================== FORM CONTENT ROUTER ====================

function buildFormSpecificContent(
  data: VisitEmailData,
  locale: string,
): string {
  if (data.formularioCSS) {
    return buildCSSFormContent(data.formularioCSS, locale);
  }
  if (data.formularioIndustrial) {
    return buildIndustrialFormContent(data.formularioIndustrial, locale);
  }
  if (data.formularioLogistica) {
    return buildLogisticaFormContent(data.formularioLogistica, locale);
  }
  if (data.formularioStraddleCarrier) {
    return buildStraddleCarrierFormContent(
      data.formularioStraddleCarrier,
      locale,
    );
  }
  return "";
}

// ==================== FILES SECTION ====================

function buildFilesSection(
  archivos: VisitEmailData["archivos"],
  locale: string = "es",
): string {
  if (!archivos || archivos.length === 0) return "";

  const rows = archivos
    .map((archivo, index) => {
      const fileType = getFileTypeLabel(archivo.tipoArchivo, locale);
      const bgColor = index % 2 === 0 ? "#ffffff" : "#f8fafc";
      return `
        <tr>
          <td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; background-color: ${bgColor};">
            <a href="${
              archivo.cloudinaryUrl
            }" target="_blank" rel="noopener" style="color: #60A82E; text-decoration: none; font-size: 13px;">
              ${archivo.nombre}
            </a>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; background-color: ${bgColor};">
            <span style="display: inline-block; padding: 2px 8px; background-color: ${
              fileType.color
            }; border-radius: 10px; font-size: 10px; color: #ffffff;">${
              fileType.label
            }</span>
          </td>
          <td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 12px; color: #64748b; background-color: ${bgColor};">
            ${formatFileSize(archivo.tamanio)}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    ${startSection()}
    <tr>
      <td colspan="2" style="padding: 12px 16px; background-color: #60A82E; background: linear-gradient(135deg, #60A82E 0%, #4A8524 100%); border-radius: 6px 6px 0 0;">
        <span style="font-size: 14px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
          ${t("email.files.header", locale)} (${archivos.length})
        </span>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding: 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 8px 16px; font-size: 11px; color: #64748b; text-transform: uppercase; text-align: left; border-bottom: 2px solid #e2e8f0; background-color: #f1f5f9;">${t(
                "email.files.file",
                locale,
              )}</th>
              <th style="padding: 8px 12px; font-size: 11px; color: #64748b; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e2e8f0; background-color: #f1f5f9;">${t(
                "email.files.type",
                locale,
              )}</th>
              <th style="padding: 8px 16px; font-size: 11px; color: #64748b; text-transform: uppercase; text-align: right; border-bottom: 2px solid #e2e8f0; background-color: #f1f5f9;">${t(
                "email.files.size",
                locale,
              )}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </td>
    </tr>
    ${endSection()}
  `;
}

// ==================== MAIN HTML TEMPLATE ====================

export function generateVisitCompletedEmailHTML(data: VisitEmailData): string {
  const locale = data.locale || "es";
  const formTypeName = getFormTypeName(data.formType, locale);
  const statusConfig = getStatusConfig(data.status, locale);
  const customerInfoSection = buildCustomerInfoSection(data, locale);
  const formSpecificContent = buildFormSpecificContent(data, locale);
  const filesSection = buildFilesSection(data.archivos, locale);

  // Minimal client info
  const companyName = data.razonSocial || t("email.common.notAssigned", locale);
  const sellerInfo = data.vendedor
    ? `${data.vendedor.name}`
    : t("email.common.notAssigned", locale);

  // Description section
  const descriptionSection = data.descripcionProducto
    ? `
      ${startSection()}
      <tr>
        <td colspan="2" style="padding: 12px 16px; background-color: #60A82E; background: linear-gradient(135deg, #60A82E 0%, #4A8524 100%); border-radius: 6px 6px 0 0;">
          <span style="font-size: 14px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
            ${t("email.sections.productDescription", locale)}
          </span>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 16px; border-bottom: 1px solid #e2e8f0; background-color: #ffffff;">
          <div style="font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${
            data.descripcionProducto
          }</div>
        </td>
      </tr>
      ${endSection()}
    `
    : "";

  // Get the title based on status
  const emailTitle =
    data.status === VisitStatus.COMPLETADA
      ? t("email.header.visitCompleted", locale)
      : t("email.header.visitDraft", locale);

  // Get preheader based on status
  const preheader =
    data.status === VisitStatus.COMPLETADA
      ? t("email.preheader.completed", locale)
      : t("email.preheader.draft", locale);

  // Get draft prefix
  const draftPrefix =
    data.status === VisitStatus.BORRADOR
      ? `[${t("email.status.draft", locale)}] `
      : "";

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${draftPrefix}${t(
    "email.subject.visit",
    locale,
  )}: ${companyName} - ${formTypeName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table { border-collapse: collapse; }
    td { font-family: Arial, sans-serif; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">

  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}: ${companyName} - ${formTypeName}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f8fafc;">
    <tr>
      <td style="padding: 20px 12px;">
        
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #5FA82E; background: linear-gradient(135deg, #5FA82E 0%, #38b000 100%); padding: 24px 20px 20px 20px; text-align: center;">
              <!-- Logo Container - Subtle white background that blends well -->
              <div style="display: inline-block">
                <img src="${
                  EMAIL_CONFIG.companyLogo
                }" alt="Combilift" style="max-width: 150px; height: auto; display: block;" />
              </div>
              <!-- Title -->
              <h1 style="margin: 0 0 6px 0; font-size: 18px; letter-spacing: -0.3px; color: #ced4da; font-weight: normal;">
                ${emailTitle.toUpperCase()}
              </h1>
              <p style="margin: 0; font-size: 16px; color: #ced4da; font-weight: normal;">${formTypeName}</p>
            </td>
          </tr>

          <!-- Status + Info Bar -->
          <tr>
            <td style="padding: 14px 20px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                  <!-- Status Badge -->
                  <td style="vertical-align: middle;">
                    <span style="display: inline-block; padding: 5px 12px; background-color: ${
                      statusConfig.bgColor
                    }; border-radius: 4px; border-left: 3px solid ${
                      statusConfig.borderColor
                    }; font-size: 11px; color: ${
                      statusConfig.textColor
                    }; text-transform: uppercase; font-weight: normal;">
                      ${statusConfig.label}
                    </span>
                  </td>
                  <!-- Company + Seller + Date -->
                  <td style="text-align: right; vertical-align: middle;">
                    <span style="font-size: 14px; color: #1e293b; font-weight: normal;">${companyName}</span>
                    <span style="color: #64748b; margin: 0 6px;">|</span>
                    <span style="font-size: 13px; color: #475569; font-weight: normal;">${sellerInfo}</span>
                    <span style="color: #64748b; margin: 0 6px;">|</span>
                    <span style="font-size: 12px; color: #64748b; font-weight: normal;">${formatDateShort(
                      data.visitDate,
                      locale,
                    )}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px; background-color: #ffffff;">
              
              <!-- Customer Information -->
              ${customerInfoSection}

              <!-- Description -->
              ${descriptionSection}

              <!-- Form-specific content -->
              ${formSpecificContent}

              <!-- Files -->
              ${filesSection}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 14px 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 2px 0; font-size: 11px; color: #64748b;">
                ${t(
                  "email.common.automaticMessage",
                  locale,
                )} <strong style="color: #1e293b;">Combilift Sales</strong>
              </p>
              <p style="margin: 0; font-size: 10px; color: #64748b;">
                ${new Date().getFullYear()} Combilift. ${t(
                  "email.common.allRightsReserved",
                  locale,
                )}
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

// ==================== PLAIN TEXT TEMPLATE ====================

export function generateVisitCompletedEmailText(data: VisitEmailData): string {
  const locale = data.locale || "es";
  const formTypeName = getFormTypeName(data.formType, locale);
  const archivos = data.archivos || [];
  const statusLabel =
    data.status === VisitStatus.COMPLETADA
      ? t("email.plainText.visitCompleted", locale).toUpperCase()
      : data.status === VisitStatus.BORRADOR
        ? t("email.plainText.visitDraft", locale).toUpperCase()
        : t("email.plainText.unknownStatus", locale).toUpperCase();

  // Build location string
  const locationParts = [
    data.localidad,
    data.provinciaEstado,
    data.codigoPostal,
    data.pais,
  ].filter(Boolean);
  const location = locationParts.join(", ");

  let text = `
${"═".repeat(55)}
COMBISALES - ${statusLabel}
${"═".repeat(55)}

${t("email.plainText.type", locale)}:     ${formTypeName}
${t("email.plainText.company", locale)}:  ${data.razonSocial || "-"}
${t("email.plainText.seller", locale)}: ${
    data.vendedor ? data.vendedor.name : t("email.common.notAssigned", locale)
  }
${t("email.plainText.date", locale)}:    ${formatDateShort(
    data.visitDate,
    locale,
  )}

${"─".repeat(55)}
${t("email.plainText.customerInfo", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.contact", locale)}:      ${data.personaContacto || "-"}
${t("email.plainText.email", locale)}:        ${data.email || "-"}
${t("email.plainText.address", locale)}:      ${data.direccion || "-"}
${t("email.plainText.location", locale)}:     ${location || "-"}
${data.website ? `Website:      ${data.website}` : ""}
${data.numeroIdentificacionFiscal ? `${t("email.plainText.taxId", locale)}:       ${data.numeroIdentificacionFiscal}` : ""}
${data.distribuidor ? `${t("email.plainText.distributor", locale)}:   ${data.distribuidor}` : ""}
${data.contactoDistribuidor ? `${t("email.plainText.distributorContact", locale)}: ${data.contactoDistribuidor}` : ""}

${"─".repeat(55)}
${t("email.plainText.productDescription", locale).toUpperCase()}
${"─".repeat(55)}

${data.descripcionProducto || t("email.common.noDescription", locale)}

`;

  // CSS Form
  if (data.formularioCSS) {
    const css = data.formularioCSS;
    text += `
${"─".repeat(55)}
${t("email.plainText.container", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.types", locale)}:              ${
      css.contenedorTipos?.join(", ") || "-"
    }
${t("email.plainText.containersPerWeek", locale)}:   ${
      css.contenedoresPorSemana || "-"
    }
${t("email.plainText.floorConditions", locale)}:  ${css.condicionesSuelo || "-"}

${"─".repeat(55)}
${t("email.plainText.containerMeasurements", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.measurements", locale)}:            ${
      css.contenedorMedidas?.join(", ") || "-"
    }
${
  css.contenedorMedidaOtro
    ? `${t("email.plainText.otherMeasurement", locale)}:        ${
        css.contenedorMedidaOtro
      }`
    : ""
}
`;
  }

  // Industrial Form
  if (data.formularioIndustrial) {
    const ind = data.formularioIndustrial;
    text += `
${"─".repeat(55)}
${t("email.plainText.applicationData", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.lastShelfLevel", locale)}:     ${formatNumber(
      ind.alturaUltimoNivelEstanteria,
      "mm",
      locale,
    )}
${t("email.plainText.maxLiftHeight", locale)}:   ${formatNumber(
      ind.maximaAlturaElevacion,
      "mm",
      locale,
    )}
${t("email.plainText.maxHeightLoadWeight", locale)}:  ${formatNumber(
      ind.pesoCargaMaximaAltura,
      "kg",
      locale,
    )}
${t("email.plainText.firstLevelLoadWeight", locale)}: ${formatNumber(
      ind.pesoCargaPrimerNivel,
      "kg",
      locale,
    )}
${t("email.plainText.workShifts", locale)}:          ${formatNumber(
      ind.turnosTrabajo,
      undefined,
      locale,
    )}
${t("email.plainText.power", locale)}:            ${
      ind.alimentacionDeseada || "-"
    }
`;
    if (ind.notasOperacion) {
      text += `
${"─".repeat(55)}
${t("email.plainText.operationNotes", locale).toUpperCase()}
${"─".repeat(55)}

${ind.notasOperacion}
`;
    }
  }

  // Logistica Form
  if (data.formularioLogistica) {
    const log = data.formularioLogistica;
    text += `
${"─".repeat(55)}
${t("email.plainText.operatingConditions", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.maxWarehouseHeight", locale)}:        ${formatNumber(
      log.alturaMaximaNave,
      "mm",
      locale,
    )}
${t("email.plainText.aisleWidth", locale)}:           ${formatNumber(
      log.anchoPasilloActual,
      "mm",
      locale,
    )}
${t("email.plainText.workSurface", locale)}:      ${formatNumber(
      log.superficieTrabajo,
      "m²",
      locale,
    )}
${t("email.plainText.floorConditions", locale)}:       ${
      log.condicionesSuelo || "-"
    }
${t("email.plainText.operationType", locale)}:          ${
      log.tipoOperacion || "-"
    }

${"─".repeat(55)}
${t("email.plainText.applicationData", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.lastShelfLevel", locale)}:     ${formatNumber(
      log.alturaUltimoNivelEstanteria,
      "mm",
      locale,
    )}
${t("email.plainText.maxLiftHeight", locale)}:   ${formatNumber(
      log.maximaAlturaElevacion,
      "mm",
      locale,
    )}
${t("email.plainText.power", locale)}:            ${
      log.alimentacionDeseada || "-"
    }
`;
    if (log.notasOperacion) {
      text += `
${"─".repeat(55)}
${t("email.plainText.operationNotes", locale).toUpperCase()}
${"─".repeat(55)}

${log.notasOperacion}
`;
    }
  }

  // Straddle Carrier Form
  if (data.formularioStraddleCarrier) {
    const sc = data.formularioStraddleCarrier;
    text += `
${"─".repeat(55)}
${t("email.plainText.handlingType", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.handlesContainers", locale)}:   ${formatBoolean(
      sc.manejaContenedores,
      locale,
    )}
${t("email.plainText.handlesSpecialLoad", locale)}: ${formatBoolean(
      sc.manejaCargaEspecial,
      locale,
    )}
`;
    if (sc.manejaContenedores) {
      text += `
${"─".repeat(55)}
${t("email.plainText.containers", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.individualContainers", locale)}:   ${formatBoolean(
        sc.manejaContenedoresIndiv,
        locale,
      )}
${t("email.plainText.doubleStacking", locale)}:     ${formatBoolean(
        sc.dobleApilamiento,
        locale,
      )}
${t("email.plainText.maxContainerWeight", locale)}:  ${formatNumber(
        sc.pesoMaximoContenedor,
        "kg",
        locale,
      )}
`;
    }
    if (sc.manejaCargaEspecial) {
      text += `
${"─".repeat(55)}
${t("email.plainText.specialLoad", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.longestProduct", locale)}:    ${formatNumber(
        sc.productoMasLargo,
        "mm",
        locale,
      )}
${t("email.plainText.shortestProduct", locale)}:    ${formatNumber(
        sc.productoMasCorto,
        "mm",
        locale,
      )}
${t("email.plainText.widestProduct", locale)}:    ${formatNumber(
        sc.productoMasAncho,
        "mm",
        locale,
      )}
${t("email.plainText.tallestProduct", locale)}:     ${formatNumber(
        sc.productoMasAlto,
        "mm",
        locale,
      )}
`;
    }
    if (sc.notasAdicionales) {
      text += `
${"─".repeat(55)}
${t("email.plainText.additionalNotes", locale).toUpperCase()}
${"─".repeat(55)}

${sc.notasAdicionales}
`;
    }
  }

  // Files
  if (archivos.length > 0) {
    text += `
${"─".repeat(55)}
${t("email.plainText.attachedFiles", locale).toUpperCase()} (${archivos.length})
${"─".repeat(55)}

${archivos
  .map(
    (a, i) =>
      `${i + 1}. ${a.nombre}\n   ${t("email.plainText.fileType", locale)}: ${
        getFileTypeLabel(a.tipoArchivo, locale).label
      } | ${t("email.plainText.fileSize", locale)}: ${formatFileSize(
        a.tamanio,
      )}`,
  )
  .join("\n\n")}
`;
  }

  text += `

${"═".repeat(55)}
${t("email.common.automaticMessage", locale)} CombiSales
© ${new Date().getFullYear()} Combilift
${"═".repeat(55)}
`;

  return text.trim();
}
