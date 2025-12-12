import { FileText, Package, Zap, Ruler, Layout, Paperclip } from "lucide-react";

/**
 * Pasos del formulario Industrial optimizados
 * Se eliminó el paso de datos del cliente (autocompletados)
 * Ahora el flujo empieza directamente con el contenido relevante
 */
export const FORM_STEPS = [
  {
    number: 1,
    title: "Descripción operación",
    description: "Detalles de la operación",
    icon: FileText,
    color: "blue" as const,
    fields: ["notasOperacion", "fechaCierre"],
  },
  {
    number: 2,
    title: "Datos aplicación",
    description: "Información técnica",
    icon: Package,
    color: "amber" as const,
    fields: [
      "descripcionProducto",
      "alturaUltimoNivelEstanteria",
      "maximaAlturaElevacion",
      "pesoCargaMaximaAltura",
      "pesoCargaPrimerNivel",
      "dimensionesAreaTrabajoAncho",
      "dimensionesAreaTrabajoFondo",
      "turnosTrabajo",
      "fechaEstimadaDefinicion",
      "alimentacionDeseada",
    ],
  },
  {
    number: 3,
    title: "Equipos eléctricos",
    description: "Especificaciones eléctricas",
    icon: Zap,
    color: "violet" as const,
    fields: ["equiposElectricos"],
  },
  {
    number: 4,
    title: "Dimensiones cargas",
    description: "Tabla de dimensiones",
    icon: Ruler,
    color: "emerald" as const,
    fields: ["dimensionesCargas"],
  },
  {
    number: 5,
    title: "Especificaciones pasillo",
    description: "Medidas del pasillo",
    icon: Layout,
    color: "rose" as const,
    fields: ["especificacionesPasillo"],
  },
  {
    number: 6,
    title: "Archivos adjuntos",
    description: "Fotos, videos y documentos",
    icon: Paperclip,
    color: "cyan" as const,
    fields: ["archivos"],
  },
];
