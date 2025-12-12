import { FileText, Package, Ruler, Paperclip } from "lucide-react";

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

export interface StepConfig {
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ElementType;
  color: StepColor;
  fields: string[];
}

export const FORM_STEPS: StepConfig[] = [
  {
    number: 1,
    title: "Producto",
    shortTitle: "Producto",
    description: "Descripción del proyecto",
    icon: FileText,
    color: "violet",
    fields: ["descripcionProducto", "fechaCierre"],
  },
  {
    number: 2,
    title: "Contenedor",
    shortTitle: "Contenedor",
    description: "Tipo y operación",
    icon: Package,
    color: "emerald",
    fields: ["contenedorTipos", "contenedoresPorSemana", "condicionesSuelo"],
  },
  {
    number: 3,
    title: "Medidas",
    shortTitle: "Medidas",
    description: "Dimensiones del contenedor",
    icon: Ruler,
    color: "rose",
    fields: ["contenedorMedidas", "contenedorMedidaOtro"],
  },
  {
    number: 4,
    title: "Archivos",
    shortTitle: "Archivos",
    description: "Fotos, videos y documentos",
    icon: Paperclip,
    color: "cyan",
    fields: ["archivos"],
  },
];

export function getStepColorClasses(color: string): StepColorClasses {
  return STEP_COLOR_MAP[color as StepColor] || STEP_COLOR_MAP.primary;
}

export function getTotalSteps(): number {
  return FORM_STEPS.length;
}

export function getStepByNumber(stepNumber: number): StepConfig | undefined {
  return FORM_STEPS.find((step) => step.number === stepNumber);
}
