import {
  FileText,
  Package,
  Ruler,
  Paperclip,
  Building2,
  MapPin,
  Users,
} from "lucide-react";

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

// Customer data steps (only for DEALER flow with enableCustomerEntry=true)
const CUSTOMER_STEPS: StepConfig[] = [
  {
    number: 1,
    title: "forms.css.steps.company.title",
    shortTitle: "forms.css.steps.company.shortTitle",
    description: "forms.css.steps.company.description",
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
    number: 2,
    title: "forms.css.steps.location.title",
    shortTitle: "forms.css.steps.location.shortTitle",
    description: "forms.css.steps.location.description",
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
    number: 3,
    title: "forms.css.steps.commercial.title",
    shortTitle: "forms.css.steps.commercial.shortTitle",
    description: "forms.css.steps.commercial.description",
    icon: Users,
    color: "amber",
    fields: [
      "distribuidor",
      "contactoDistribuidor",
      "fechaCierre",
      "datosClienteUsuarioFinal",
    ],
  },
];

// Regular steps (product/technical steps)
const REGULAR_STEPS: StepConfig[] = [
  {
    number: 1,
    title: "forms.css.steps.product.title",
    shortTitle: "forms.css.steps.product.shortTitle",
    description: "forms.css.steps.product.description",
    icon: FileText,
    color: "violet",
    fields: ["descripcionProducto", "fechaCierre"],
  },
  {
    number: 2,
    title: "forms.css.steps.container.title",
    shortTitle: "forms.css.steps.container.shortTitle",
    description: "forms.css.steps.container.description",
    icon: Package,
    color: "emerald",
    fields: ["contenedorTipos", "contenedoresPorSemana", "condicionesSuelo"],
  },
  {
    number: 3,
    title: "forms.css.steps.measurements.title",
    shortTitle: "forms.css.steps.measurements.shortTitle",
    description: "forms.css.steps.measurements.description",
    icon: Ruler,
    color: "rose",
    fields: ["contenedorMedidas", "contenedorMedidaOtro"],
  },
  {
    number: 4,
    title: "forms.css.steps.files.title",
    shortTitle: "forms.css.steps.files.shortTitle",
    description: "forms.css.steps.files.description",
    icon: Paperclip,
    color: "cyan",
    fields: ["archivos"],
  },
];

// Default export for backward compatibility
export const FORM_STEPS: StepConfig[] = REGULAR_STEPS;

/**
 * Get form steps based on enableCustomerEntry flag
 * When enableCustomerEntry is true (DEALER flow), customer data steps are prepended
 * When false (normal ADMIN/SELLER flow), only regular steps are returned
 */
export function getFormSteps(
  enableCustomerEntry: boolean = false,
): StepConfig[] {
  if (!enableCustomerEntry) {
    return REGULAR_STEPS;
  }

  // For DEALER flow: prepend customer data steps and renumber all steps
  const customerStepsWithCorrectNumbers = CUSTOMER_STEPS.map((step, index) => ({
    ...step,
    number: index + 1,
  }));

  const regularStepsWithShiftedNumbers = REGULAR_STEPS.map((step, index) => ({
    ...step,
    number: CUSTOMER_STEPS.length + index + 1,
  }));

  return [
    ...customerStepsWithCorrectNumbers,
    ...regularStepsWithShiftedNumbers,
  ];
}

export function getStepColorClasses(color: string): StepColorClasses {
  return STEP_COLOR_MAP[color as StepColor] || STEP_COLOR_MAP.primary;
}

export function getTotalSteps(): number {
  return FORM_STEPS.length;
}

export function getStepByNumber(stepNumber: number): StepConfig | undefined {
  return FORM_STEPS.find((step) => step.number === stepNumber);
}
