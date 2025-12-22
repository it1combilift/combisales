import { EMAIL_CONFIG } from "@/constants/constants";
import { formatDateShort, getFormTypeName } from "@/lib/utils";
import { formatFileSize } from "@/components/formulario-css-analisis/utils/file-utils";

import {
  VisitEmailData,
  DimensionCargaEmail,
  FormularioCSSEmailData,
  FormularioIndustrialEmailData,
  FormularioLogisticaEmailData,
  FormularioStraddleCarrierEmailData,
} from "@/interfaces/email";
import {
  CONTENEDOR_MEDIDA_LABELS,
  CONTENEDOR_TIPO_LABELS,
} from "@/interfaces/visits";

// ==================== COLOR PALETTE ====================
const COLORS = {
  // Brand
  brand: "#1a5632",
  brandLight: "#22c55e",
  brandDark: "#0d3320",

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

function getStatusConfig(status: string): {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
} {
  switch (status) {
    case "COMPLETADA":
      return {
        label: "COMPLETADA",
        bgColor: COLORS.successBg,
        textColor: COLORS.successText,
        borderColor: COLORS.success,
      };
    case "BORRADOR":
      return {
        label: "BORRADOR",
        bgColor: COLORS.warningBg,
        textColor: COLORS.warningText,
        borderColor: COLORS.warning,
      };
    default:
      return {
        label: "BORRADOR",
        bgColor: COLORS.warningBg,
        textColor: COLORS.warningText,
        borderColor: COLORS.warning,
      };
  }
}

function getFileTypeLabel(tipoArchivo: string): {
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
    return { label: "IMG", color: COLORS.imageBadge };
  }
  if (type.includes("pdf")) {
    return { label: "PDF", color: COLORS.pdfBadge };
  }
  if (
    type.includes("video") ||
    type.includes("mp4") ||
    type.includes("mov") ||
    type.includes("avi")
  ) {
    return { label: "VID", color: COLORS.videoBadge };
  }
  if (
    type.includes("doc") ||
    type.includes("word") ||
    type.includes("documento")
  ) {
    return { label: "DOC", color: COLORS.docBadge };
  }
  if (
    type.includes("xls") ||
    type.includes("excel") ||
    type.includes("spreadsheet")
  ) {
    return { label: "XLS", color: COLORS.excelBadge };
  }
  return { label: "FILE", color: COLORS.defaultBadge };
}

function formatNumber(value: number | null | undefined, unit?: string): string {
  if (value === null || value === undefined) return "-";
  const formatted = value.toLocaleString("es-ES");
  return unit ? `${formatted} ${unit}` : formatted;
}

function formatBoolean(value: boolean | undefined): string {
  return value ? "Sí" : "No";
}

// ==================== SECTION BUILDING BLOCKS ====================

/**
 * Build a section header with title (no emoji)
 */
function buildSectionHeader(title: string): string {
  return `
    <tr>
      <td colspan="2" style="padding: 12px 16px; background-color: #1a5632; background: linear-gradient(135deg, #1a5632 0%, #0d3320 100%); border-radius: 6px 6px 0 0;">
        <span style="font-size: 14px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
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
        <span style="font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.3px;">
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
  options?: { highlight?: boolean; fullWidth?: boolean }
): string {
  if (!value || value === "-" || value.trim() === "") return "";

  const labelColor = "#64748b";
  const valueColor = options?.highlight ? "#1a5632" : "#1e293b";
  const bgColor = "#ffffff";
  const borderColor = "#e2e8f0";

  if (options?.fullWidth) {
    return `
      <tr>
        <td colspan="2" style="padding: 8px 16px; border-bottom: 1px solid ${borderColor}; background-color: ${bgColor};">
          <div style="font-size: 11px; font-weight: 600; color: ${labelColor}; text-transform: uppercase; margin-bottom: 4px;">${label}</div>
          <div style="font-size: 14px; color: ${valueColor}; line-height: 1.5;">${value}</div>
        </td>
      </tr>
    `;
  }

  return `
    <tr>
      <td style="padding: 8px 16px; font-size: 12px; font-weight: 600; color: ${labelColor}; width: 40%; vertical-align: top; border-bottom: 1px solid ${borderColor}; background-color: ${bgColor};">
        ${label}
      </td>
      <td style="padding: 8px 16px; font-size: 14px; color: ${valueColor}; font-weight: ${
    options?.highlight ? "600" : "400"
  }; border-bottom: 1px solid ${borderColor}; background-color: ${bgColor};">
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
        <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">${label}</div>
        <div style="font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap; background-color: #ffffff; padding: 12px; border-radius: 4px; border-left: 3px solid #1a5632;">${content}</div>
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

// ==================== CSS FORM CONTENT ====================

function buildCSSFormContent(data: FormularioCSSEmailData): string {
  let html = "";

  // Section: Contenedor
  html += startSection();
  html += buildSectionHeader("Contenedor");
  html += buildRow(
    "Tipos de contenedor",
    data.contenedorTipos
      ?.map((tipo) => CONTENEDOR_TIPO_LABELS[tipo])
      .join(", ") || null
  );
  html += buildRow(
    "Contenedores por semana",
    formatNumber(data.contenedoresPorSemana)
  );
  html += buildRow("Condiciones del suelo", data.condicionesSuelo || null);
  html += endSection();

  // Section: Medidas
  html += startSection();
  html += buildSectionHeader("Medidas del Contenedor");
  html += buildRow(
    "Medidas seleccionadas",
    data.contenedorMedidas
      ?.map((medida) => CONTENEDOR_MEDIDA_LABELS[medida])
      .join(", ") || null
  );

  if (data.contenedorMedidaOtro) {
    html += buildRow("Otra medida", data.contenedorMedidaOtro);
  }
  html += endSection();

  // Section: Datos adicionales (if present)
  if (data.datosClienteUsuarioFinal) {
    html += startSection();
    html += buildSectionHeader("Información Adicional");
    html += buildNotesBlock(
      "Datos usuario final",
      data.datosClienteUsuarioFinal
    );
    html += endSection();
  }

  return html;
}

// ==================== INDUSTRIAL FORM CONTENT ====================

function buildDimensionsTable(cargas: DimensionCargaEmail[]): string {
  if (!cargas || cargas.length === 0) return "";

  const headerStyle = `padding: 10px 8px; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e2e8f0; background-color: #f1f5f9;`;
  const cellStyle = `padding: 8px; font-size: 13px; text-align: center; border-bottom: 1px solid #e2e8f0;`;

  const rows = cargas
    .map(
      (c, i) => `
    <tr>
      <td style="${cellStyle} text-align: left; font-weight: 500; color: #1e293b; background-color: ${
        i % 2 === 0 ? "#ffffff" : "#f8fafc"
      };">${c.producto || "-"}</td>
      <td style="${cellStyle} color: #475569; background-color: ${
        i % 2 === 0 ? "#ffffff" : "#f8fafc"
      };">${formatNumber(c.largo)}</td>
      <td style="${cellStyle} color: #475569; background-color: ${
        i % 2 === 0 ? "#ffffff" : "#f8fafc"
      };">${formatNumber(c.fondo)}</td>
      <td style="${cellStyle} color: #475569; background-color: ${
        i % 2 === 0 ? "#ffffff" : "#f8fafc"
      };">${formatNumber(c.alto)}</td>
      <td style="${cellStyle} color: #475569; background-color: ${
        i % 2 === 0 ? "#ffffff" : "#f8fafc"
      };">${formatNumber(c.peso)}</td>
      <td style="${cellStyle} color: #1a5632; font-weight: 600; background-color: ${
        i % 2 === 0 ? "#ffffff" : "#f8fafc"
      };">${formatNumber(c.porcentaje)}%</td>
    </tr>
  `
    )
    .join("");

  return `
    <tr>
      <td colspan="2" style="padding: 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="${headerStyle} text-align: left;">Producto</th>
              <th style="${headerStyle}">Largo (mm)</th>
              <th style="${headerStyle}">Fondo (mm)</th>
              <th style="${headerStyle}">Alto (mm)</th>
              <th style="${headerStyle}">Peso (kg)</th>
              <th style="${headerStyle}">%</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </td>
    </tr>
  `;
}

function buildElectricalEquipmentRows(
  equipos: FormularioIndustrialEmailData["equiposElectricos"]
): string {
  if (!equipos || equipos.noAplica) return "";

  let rows = "";
  rows += buildRow("Tipo de corriente", equipos.tipoCorriente || null);
  rows += buildRow("Voltaje", formatNumber(equipos.voltaje, "V"));
  rows += buildRow("Frecuencia", formatNumber(equipos.frecuencia, "Hz"));
  rows += buildRow("Amperaje", formatNumber(equipos.amperaje, "A"));
  rows += buildRow(
    "Temperatura ambiente",
    formatNumber(equipos.temperaturaAmbiente, "°C")
  );
  rows += buildRow(
    "Horas trabajo/día",
    formatNumber(equipos.horasTrabajoPorDia, "h")
  );
  if (equipos.notas) {
    rows += buildNotesBlock("Notas", equipos.notas);
  }
  return rows;
}

function buildIndustrialFormContent(
  data: FormularioIndustrialEmailData
): string {
  let html = "";

  // Section 1: Descripción de operación
  if (data.notasOperacion) {
    html += startSection();
    html += buildSectionHeader("Descripción de Operación");
    html += buildNotesBlock("Notas de operación", data.notasOperacion);
    html += endSection();
  }

  // Section 2: Datos de aplicación
  html += startSection();
  html += buildSectionHeader("Datos de Aplicación");
  html += buildRow(
    "Altura último nivel estantería",
    formatNumber(data.alturaUltimoNivelEstanteria, "mm")
  );
  html += buildRow(
    "Máxima altura de elevación",
    formatNumber(data.maximaAlturaElevacion, "mm")
  );
  html += buildRow(
    "Peso carga a máxima altura",
    formatNumber(data.pesoCargaMaximaAltura, "kg")
  );
  html += buildRow(
    "Peso carga primer nivel",
    formatNumber(data.pesoCargaPrimerNivel, "kg")
  );
  if (data.dimensionesAreaTrabajoAncho && data.dimensionesAreaTrabajoFondo) {
    html += buildRow(
      "Área de trabajo",
      `${formatNumber(data.dimensionesAreaTrabajoAncho)} × ${formatNumber(
        data.dimensionesAreaTrabajoFondo
      )} mm`
    );
  }
  html += buildRow("Turnos de trabajo", formatNumber(data.turnosTrabajo));
  html += buildRow("Alimentación deseada", data.alimentacionDeseada || null, {
    highlight: true,
  });
  html += endSection();

  // Section 3: Baterías / Equipos eléctricos
  if (data.equiposElectricos && !data.equiposElectricos.noAplica) {
    html += startSection();
    html += buildSectionHeader("Baterías / Equipos Eléctricos");
    html += buildElectricalEquipmentRows(data.equiposElectricos);
    html += endSection();
  }

  // Section 4: Dimensiones de cargas
  if (data.dimensionesCargas && data.dimensionesCargas.length > 0) {
    html += startSection();
    html += buildSectionHeader("Dimensiones de Cargas");
    html += buildDimensionsTable(data.dimensionesCargas);
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
    html += buildSectionHeader("Especificaciones del Pasillo");
    html += buildRow(
      "Profundidad del producto",
      formatNumber(data.profundidadProducto, "mm")
    );
    html += buildRow(
      "Ancho libre entre productos",
      formatNumber(data.anchoLibreEntreProductos, "mm")
    );
    html += buildRow(
      "Distancia libre entre estanterías",
      formatNumber(data.distanciaLibreEntreEstanterias, "mm")
    );
    html += buildRow(
      "Fondo útil estantería",
      formatNumber(data.fondoUtilEstanteria, "mm")
    );
    html += buildRow(
      "Altura base estantería",
      formatNumber(data.alturaBaseEstanteria, "mm")
    );
    html += buildRow(
      "Altura suelo al primer brazo",
      formatNumber(data.alturaSueloPrimerBrazo, "mm")
    );
    html += buildRow(
      "Grosor pilar/columna",
      formatNumber(data.grosorPilarColumna, "mm")
    );
    html += buildRow(
      "Altura máx. interior edificio",
      formatNumber(data.alturaMaximaInteriorEdificio, "mm")
    );
    html += endSection();
  }

  return html;
}

// ==================== LOGISTICA FORM CONTENT ====================

function buildLogisticaFormContent(data: FormularioLogisticaEmailData): string {
  let html = "";

  // Section 1: Descripción de operación
  html += startSection();
  html += buildSectionHeader("Descripción de Operación");

  if (data.notasOperacion) {
    html += buildNotesBlock("Notas de operación", data.notasOperacion);
  }

  // Subsection: Condiciones del lugar
  html += buildSubsectionHeader("Condiciones del lugar");
  html += buildRow("Tiene rampas", formatBoolean(data.tieneRampas));
  if (data.tieneRampas && data.notasRampas) {
    html += buildRow("Detalles rampas", data.notasRampas);
  }
  html += buildRow(
    "Tiene pasos/puertas",
    formatBoolean(data.tienePasosPuertas)
  );
  if (data.tienePasosPuertas && data.notasPasosPuertas) {
    html += buildRow("Detalles pasos/puertas", data.notasPasosPuertas);
  }
  html += buildRow(
    "Tiene restricciones",
    formatBoolean(data.tieneRestricciones)
  );
  if (data.tieneRestricciones && data.notasRestricciones) {
    html += buildRow("Detalles restricciones", data.notasRestricciones);
  }

  // Subsection: Medidas de nave
  html += buildSubsectionHeader("Medidas de la nave");
  html += buildRow(
    "Altura máxima nave",
    formatNumber(data.alturaMaximaNave, "mm")
  );
  html += buildRow(
    "Ancho pasillo actual",
    formatNumber(data.anchoPasilloActual, "mm")
  );
  html += buildRow(
    "Superficie de trabajo",
    formatNumber(data.superficieTrabajo, "m²")
  );
  html += buildRow("Condiciones del suelo", data.condicionesSuelo || null);
  html += buildRow("Tipo de operación", data.tipoOperacion || null);
  html += endSection();

  // Section 2: Datos de aplicación
  html += startSection();
  html += buildSectionHeader("Datos de Aplicación");
  html += buildRow(
    "Altura último nivel estantería",
    formatNumber(data.alturaUltimoNivelEstanteria, "mm")
  );
  html += buildRow(
    "Máxima altura de elevación",
    formatNumber(data.maximaAlturaElevacion, "mm")
  );
  html += buildRow(
    "Peso carga a máxima altura",
    formatNumber(data.pesoCargaMaximaAltura, "kg")
  );
  html += buildRow(
    "Peso carga primer nivel",
    formatNumber(data.pesoCargaPrimerNivel, "kg")
  );
  if (data.dimensionesAreaTrabajoAncho && data.dimensionesAreaTrabajoFondo) {
    html += buildRow(
      "Área de trabajo",
      `${formatNumber(data.dimensionesAreaTrabajoAncho)} × ${formatNumber(
        data.dimensionesAreaTrabajoFondo
      )} mm`
    );
  }
  html += buildRow("Turnos de trabajo", formatNumber(data.turnosTrabajo));
  html += buildRow("Alimentación deseada", data.alimentacionDeseada || null, {
    highlight: true,
  });
  html += endSection();

  // Section 3: Baterías / Equipos eléctricos
  if (data.equiposElectricos && !data.equiposElectricos.noAplica) {
    html += startSection();
    html += buildSectionHeader("Baterías / Equipos Eléctricos");
    html += buildElectricalEquipmentRows(data.equiposElectricos);
    html += endSection();
  }

  // Section 4: Dimensiones de cargas
  if (data.dimensionesCargas && data.dimensionesCargas.length > 0) {
    html += startSection();
    html += buildSectionHeader("Dimensiones de Cargas");
    html += buildDimensionsTable(data.dimensionesCargas);
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
      html += buildSectionHeader("Pasillo Actual");
      html += buildRow(
        "Distancia entre estanterías",
        formatNumber(p.distanciaEntreEstanterias, "mm")
      );
      html += buildRow(
        "Distancia entre productos",
        formatNumber(p.distanciaEntreProductos, "mm")
      );
      html += buildRow(
        "Ancho pasillo disponible",
        formatNumber(p.anchoPasilloDisponible, "mm")
      );
      html += buildRow("Tipo de estanterías", p.tipoEstanterias || null);
      html += buildRow(
        "Niveles de estanterías",
        formatNumber(p.nivelEstanterias)
      );
      html += buildRow(
        "Altura máx. estantería",
        formatNumber(p.alturaMaximaEstanteria, "mm")
      );
      html += endSection();
    }
  }

  return html;
}

// ==================== STRADDLE CARRIER FORM CONTENT ====================

function buildStraddleCarrierFormContent(
  data: FormularioStraddleCarrierEmailData
): string {
  let html = "";

  // Section 1: Instrucciones / Tipo de manejo
  html += startSection();
  html += buildSectionHeader("Tipo de Manejo");
  html += buildRow(
    "Maneja contenedores",
    formatBoolean(data.manejaContenedores),
    {
      highlight: data.manejaContenedores,
    }
  );
  html += buildRow(
    "Maneja carga especial",
    formatBoolean(data.manejaCargaEspecial),
    {
      highlight: data.manejaCargaEspecial,
    }
  );
  html += endSection();

  // Section 2: Contenedores (if applicable)
  if (data.manejaContenedores) {
    html += startSection();
    html += buildSectionHeader("Contenedores");

    html += buildRow(
      "Contenedores individuales",
      formatBoolean(data.manejaContenedoresIndiv)
    );
    html += buildRow("Doble apilamiento", formatBoolean(data.dobleApilamiento));

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
        html += buildRow("Tamaños de contenedores", sizes.join(", "));
      }
    }

    html += buildRow(
      "Peso máx. contenedor",
      formatNumber(data.pesoMaximoContenedor, "kg")
    );

    if (data.infoAdicionalContenedores) {
      html += buildNotesBlock(
        "Información adicional",
        data.infoAdicionalContenedores
      );
    }
    html += endSection();
  }

  // Section 3: Carga especial (if applicable)
  if (data.manejaCargaEspecial) {
    html += startSection();
    html += buildSectionHeader("Carga Especial");

    // Subsection: Dimensiones de productos
    html += buildSubsectionHeader("Dimensiones de productos");
    html += buildRow(
      "Producto más largo",
      formatNumber(data.productoMasLargo, "mm")
    );
    html += buildRow(
      "Producto más corto",
      formatNumber(data.productoMasCorto, "mm")
    );
    html += buildRow(
      "Producto más ancho",
      formatNumber(data.productoMasAncho, "mm")
    );
    html += buildRow(
      "Producto más estrecho",
      formatNumber(data.productoMasEstrecho, "mm")
    );
    html += buildRow(
      "Producto más alto",
      formatNumber(data.productoMasAlto, "mm")
    );

    // Subsection: Puntos de elevación
    html += buildSubsectionHeader("Puntos de elevación y pesos");
    html += buildRow(
      "Puntos elevación (longitud)",
      formatNumber(data.puntosElevacionLongitud, "mm")
    );
    html += buildRow(
      "Puntos elevación (ancho)",
      formatNumber(data.puntosElevacionAncho, "mm")
    );
    html += buildRow(
      "Peso máx. producto largo",
      formatNumber(data.pesoMaximoProductoLargo, "kg")
    );
    html += buildRow(
      "Peso máx. producto corto",
      formatNumber(data.pesoMaximoProductoCorto, "kg")
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
    html += buildSectionHeader("Condiciones Adicionales");

    // Subsection: Zonas de paso
    if (data.zonasPasoAncho || data.zonasPasoAlto) {
      html += buildSubsectionHeader("Zonas de paso");
      html += buildRow(
        "Ancho zonas de paso",
        formatNumber(data.zonasPasoAncho, "mm")
      );
      html += buildRow(
        "Alto zonas de paso",
        formatNumber(data.zonasPasoAlto, "mm")
      );
    }

    // Subsection: Condiciones del piso
    html += buildSubsectionHeader("Condiciones del piso");
    html += buildRow("Condiciones del piso", data.condicionesPiso || null);
    html += buildRow("Piso plano", formatBoolean(data.pisoPlano));

    // Subsection: Restricciones
    if (data.restriccionesAltura || data.restriccionesAnchura) {
      html += buildSubsectionHeader("Restricciones");
      html += buildRow(
        "Restricción de altura",
        formatNumber(data.restriccionesAltura, "mm")
      );
      html += buildRow(
        "Restricción de anchura",
        formatNumber(data.restriccionesAnchura, "mm")
      );
    }

    // Notes
    if (data.notasAdicionales) {
      html += buildNotesBlock("Notas adicionales", data.notasAdicionales);
    }
    html += endSection();
  }

  return html;
}

// ==================== FORM CONTENT ROUTER ====================

function buildFormSpecificContent(data: VisitEmailData): string {
  if (data.formularioCSS) {
    return buildCSSFormContent(data.formularioCSS);
  }
  if (data.formularioIndustrial) {
    return buildIndustrialFormContent(data.formularioIndustrial);
  }
  if (data.formularioLogistica) {
    return buildLogisticaFormContent(data.formularioLogistica);
  }
  if (data.formularioStraddleCarrier) {
    return buildStraddleCarrierFormContent(data.formularioStraddleCarrier);
  }
  return "";
}

// ==================== FILES SECTION ====================

function buildFilesSection(archivos: VisitEmailData["archivos"]): string {
  if (!archivos || archivos.length === 0) return "";

  const rows = archivos
    .map((archivo, index) => {
      const fileType = getFileTypeLabel(archivo.tipoArchivo);
      const bgColor = index % 2 === 0 ? "#ffffff" : "#f8fafc";
      return `
        <tr>
          <td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; background-color: ${bgColor};">
            <a href="${
              archivo.cloudinaryUrl
            }" target="_blank" rel="noopener" style="color: #1a5632; text-decoration: none; font-size: 13px; font-weight: 500;">
              ${archivo.nombre}
            </a>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; background-color: ${bgColor};">
            <span style="display: inline-block; padding: 2px 8px; background-color: ${
              fileType.color
            }; border-radius: 10px; font-size: 10px; font-weight: 700; color: #ffffff;">${
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
      <td colspan="2" style="padding: 12px 16px; background-color: #1a5632; background: linear-gradient(135deg, #1a5632 0%, #0d3320 100%); border-radius: 6px 6px 0 0;">
        <span style="font-size: 14px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
          Archivos Adjuntos (${archivos.length})
        </span>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding: 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 8px 16px; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; text-align: left; border-bottom: 2px solid #e2e8f0; background-color: #f1f5f9;">Archivo</th>
              <th style="padding: 8px 12px; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e2e8f0; background-color: #f1f5f9;">Tipo</th>
              <th style="padding: 8px 16px; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; text-align: right; border-bottom: 2px solid #e2e8f0; background-color: #f1f5f9;">Tamano</th>
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
  const formTypeName = getFormTypeName(data.formType);
  const statusConfig = getStatusConfig(data.status);
  const formSpecificContent = buildFormSpecificContent(data);
  const filesSection = buildFilesSection(data.archivos);

  // Minimal client info
  const companyName = data.razonSocial;
  const sellerInfo = data.vendedor ? `${data.vendedor.name}` : "No asignado";

  // Description section
  const descriptionSection = data.descripcionProducto
    ? `
      ${startSection()}
      <tr>
        <td colspan="2" style="padding: 12px 16px; background-color: #1a5632; background: linear-gradient(135deg, #1a5632 0%, #0d3320 100%); border-radius: 6px 6px 0 0;">
          <span style="font-size: 14px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
            Descripcion del Producto
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

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${
    data.status === "BORRADOR" ? "[Borrador] " : ""
  }Visita: ${companyName} - ${formTypeName}</title>
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
    ${
      data.status === "COMPLETADA" ? "Visita completada" : "Borrador de visita"
    }: ${companyName} - ${formTypeName}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f8fafc;">
    <tr>
      <td style="padding: 20px 12px;">
        
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1a5632; background: linear-gradient(135deg, #1a5632 0%, #0d3320 100%); padding: 20px; text-align: center;">
              <!-- Logo -->
              <div style="display: inline-block; background-color: #ffffff; padding: 10px 18px; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <img src="${
                  EMAIL_CONFIG.companyLogo
                }" alt="Combilift" style="max-width: 160px; height: auto; display: block;" />
              </div>
              <!-- Title -->
              <h1 style="color: #ffffff; margin: 0 0 4px 0; font-size: 20px; font-weight: 700;">
                ${
                  data.status === "COMPLETADA"
                    ? "Visita completada"
                    : "Borrador de visita"
                }
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">${formTypeName}</p>
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
  }; font-size: 11px; font-weight: 700; color: ${
    statusConfig.textColor
  }; text-transform: uppercase;">
                      ${statusConfig.label}
                    </span>
                  </td>
                  <!-- Company + Seller + Date -->
                  <td style="text-align: right; vertical-align: middle;">
                    <span style="font-size: 14px; font-weight: 600; color: #1e293b;">${companyName}</span>
                    <span style="color: #64748b; margin: 0 6px;">|</span>
                    <span style="font-size: 13px; color: #475569;">${sellerInfo}</span>
                    <span style="color: #64748b; margin: 0 6px;">|</span>
                    <span style="font-size: 12px; color: #64748b;">${formatDateShort(
                      data.visitDate
                    )}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px; background-color: #ffffff;">
              
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
                Mensaje automatico de <strong style="color: #1e293b;">Combilift Sales</strong>
              </p>
              <p style="margin: 0; font-size: 10px; color: #64748b;">
                ${new Date().getFullYear()} Combilift. Todos los derechos reservados.
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
  const formTypeName = getFormTypeName(data.formType);
  const archivos = data.archivos || [];
  const statusLabel =
    data.status === "COMPLETADA"
      ? "VISITA COMPLETADA"
      : data.status === "BORRADOR"
      ? "BORRADOR DE VISITA"
      : "VISITA EN PROGRESO";

  let text = `
${"═".repeat(55)}
COMBISALES - ${statusLabel}
${"═".repeat(55)}

Tipo:     ${formTypeName}
Empresa:  ${data.razonSocial}
Vendedor: ${data.vendedor ? data.vendedor.name : "No asignado"}
Fecha:    ${formatDateShort(data.visitDate)}

${"─".repeat(55)}
DESCRIPCIÓN DEL PRODUCTO
${"─".repeat(55)}

${data.descripcionProducto || "Sin descripción proporcionada"}

`;

  // CSS Form
  if (data.formularioCSS) {
    const css = data.formularioCSS;
    text += `
${"─".repeat(55)}
CONTENEDOR
${"─".repeat(55)}

Tipos:              ${css.contenedorTipos?.join(", ") || "-"}
Contenedores/sem:   ${css.contenedoresPorSemana || "-"}
Condiciones suelo:  ${css.condicionesSuelo || "-"}

${"─".repeat(55)}
MEDIDAS DEL CONTENEDOR
${"─".repeat(55)}

Medidas:            ${css.contenedorMedidas?.join(", ") || "-"}
${
  css.contenedorMedidaOtro
    ? `Otra medida:        ${css.contenedorMedidaOtro}`
    : ""
}
`;
  }

  // Industrial Form
  if (data.formularioIndustrial) {
    const ind = data.formularioIndustrial;
    text += `
${"─".repeat(55)}
DATOS DE APLICACIÓN
${"─".repeat(55)}

Altura último nivel:     ${formatNumber(ind.alturaUltimoNivelEstanteria, "mm")}
Máx. altura elevación:   ${formatNumber(ind.maximaAlturaElevacion, "mm")}
Peso carga máx. altura:  ${formatNumber(ind.pesoCargaMaximaAltura, "kg")}
Peso carga primer nivel: ${formatNumber(ind.pesoCargaPrimerNivel, "kg")}
Turnos trabajo:          ${formatNumber(ind.turnosTrabajo)}
Alimentación:            ${ind.alimentacionDeseada || "-"}
`;
    if (ind.notasOperacion) {
      text += `
${"─".repeat(55)}
NOTAS DE OPERACIÓN
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
CONDICIONES DE OPERACIÓN
${"─".repeat(55)}

Altura máx. nave:        ${formatNumber(log.alturaMaximaNave, "mm")}
Ancho pasillo:           ${formatNumber(log.anchoPasilloActual, "mm")}
Superficie trabajo:      ${formatNumber(log.superficieTrabajo, "m²")}
Condiciones suelo:       ${log.condicionesSuelo || "-"}
Tipo operación:          ${log.tipoOperacion || "-"}

${"─".repeat(55)}
DATOS DE APLICACIÓN
${"─".repeat(55)}

Altura último nivel:     ${formatNumber(log.alturaUltimoNivelEstanteria, "mm")}
Máx. altura elevación:   ${formatNumber(log.maximaAlturaElevacion, "mm")}
Alimentación:            ${log.alimentacionDeseada || "-"}
`;
    if (log.notasOperacion) {
      text += `
${"─".repeat(55)}
NOTAS DE OPERACIÓN
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
TIPO DE MANEJO
${"─".repeat(55)}

Maneja contenedores:   ${formatBoolean(sc.manejaContenedores)}
Maneja carga especial: ${formatBoolean(sc.manejaCargaEspecial)}
`;
    if (sc.manejaContenedores) {
      text += `
${"─".repeat(55)}
CONTENEDORES
${"─".repeat(55)}

Contenedores indiv.:   ${formatBoolean(sc.manejaContenedoresIndiv)}
Doble apilamiento:     ${formatBoolean(sc.dobleApilamiento)}
Peso máx. contenedor:  ${formatNumber(sc.pesoMaximoContenedor, "kg")}
`;
    }
    if (sc.manejaCargaEspecial) {
      text += `
${"─".repeat(55)}
CARGA ESPECIAL
${"─".repeat(55)}

Producto más largo:    ${formatNumber(sc.productoMasLargo, "mm")}
Producto más corto:    ${formatNumber(sc.productoMasCorto, "mm")}
Producto más ancho:    ${formatNumber(sc.productoMasAncho, "mm")}
Producto más alto:     ${formatNumber(sc.productoMasAlto, "mm")}
`;
    }
    if (sc.notasAdicionales) {
      text += `
${"─".repeat(55)}
NOTAS ADICIONALES
${"─".repeat(55)}

${sc.notasAdicionales}
`;
    }
  }

  // Files
  if (archivos.length > 0) {
    text += `
${"─".repeat(55)}
ARCHIVOS ADJUNTOS (${archivos.length})
${"─".repeat(55)}

${archivos
  .map(
    (a, i) =>
      `${i + 1}. ${a.nombre}\n   Tipo: ${
        getFileTypeLabel(a.tipoArchivo).label
      } | Tamaño: ${formatFileSize(a.tamanio)}`
  )
  .join("\n\n")}
`;
  }

  text += `

${"═".repeat(55)}
Mensaje automático de CombiSales
© ${new Date().getFullYear()} Combilift
${"═".repeat(55)}
`;

  return text.trim();
}
