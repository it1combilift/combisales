import {
  Building2,
  MapPin,
  Users,
  FileText,
  Package,
  Ruler,
  Paperclip,
  Layers,
  BoxSelect,
  Home,
  Globe,
} from "lucide-react";

import { ContenedorTipo, ContenedorMedida } from "@prisma/client";
import { StepConfig } from "@/interfaces/visits";

// ==================== STEP COLORS ====================
export type StepColor =
  | "primary"
  | "blue"
  | "amber"
  | "violet"
  | "emerald"
  | "rose"
  | "cyan";

export interface StepColorClasses {
  bg: string;
  text: string;
  border: string;
}

export const STEP_COLOR_MAP: Record<StepColor, StepColorClasses> = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500",
  },
};

// ==================== FORM STEPS ====================
export const FORM_STEPS: StepConfig[] = [
  {
    id: 1,
    name: "Empresa",
    description: "Datos de la empresa",
    icon: Building2,
    color: "primary",
    fields: [
      "razonSocial",
      "personaContacto",
      "email",
      "numeroIdentificacionFiscal",
      "website",
    ],
  },
  {
    id: 2,
    name: "Ubicación",
    description: "Dirección y localización",
    icon: MapPin,
    color: "blue",
    fields: [
      "direccion",
      "localidad",
      "codigoPostal",
      "provinciaEstado",
      "pais",
    ],
  },
  {
    id: 3,
    name: "Comercial",
    description: "Información de ventas",
    icon: Users,
    color: "amber",
    fields: [
      "distribuidor",
      "contactoDistribuidor",
      "fechaCierre",
      "datosClienteUsuarioFinal",
    ],
  },
  {
    id: 4,
    name: "Producto",
    description: "Descripción del proyecto",
    icon: FileText,
    color: "violet",
    fields: ["descripcionProducto"],
  },
  {
    id: 5,
    name: "Contenedor",
    description: "Tipo y operación",
    icon: Package,
    color: "emerald",
    fields: ["contenedorTipos", "contenedoresPorSemana", "condicionesSuelo"],
  },
  {
    id: 6,
    name: "Medidas",
    description: "Dimensiones del contenedor",
    icon: Ruler,
    color: "rose",
    fields: ["contenedorMedida", "contenedorMedidaOtro"],
  },
  {
    id: 7,
    name: "Archivos",
    description: "Fotos, videos y documentos",
    icon: Paperclip,
    color: "cyan",
    fields: ["archivos"],
  },
];

// ==================== CONTENEDOR ICONS ====================
export const CONTENEDOR_TIPO_ICONS: Record<ContenedorTipo, React.ElementType> =
  {
    SOBRE_CAMION: Layers,
    EN_SUELO: BoxSelect,
    INTERIOR: Home,
    EXTERIOR: Globe,
  };

// ==================== HELPER FUNCTIONS ====================
export function getStepColorClasses(color: string): StepColorClasses {
  return STEP_COLOR_MAP[color as StepColor] || STEP_COLOR_MAP.primary;
}

export function getTotalSteps(): number {
  return FORM_STEPS.length;
}

export function getStepById(stepId: number): StepConfig | undefined {
  return FORM_STEPS.find((step) => step.id === stepId);
}
