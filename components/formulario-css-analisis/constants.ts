import { Package, Ruler, Paperclip, Building2, PencilLine } from "lucide-react";

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
  key: string;
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
    key: "customerData",
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
      "direccion",
      "localidad",
      "codigoPostal",
      "provinciaEstado",
      "pais",
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
    key: "product",
    number: 1,
    title: "forms.css.steps.product.title",
    shortTitle: "forms.css.steps.product.shortTitle",
    description: "forms.css.steps.product.description",
    icon: PencilLine,
    color: "violet",
    fields: ["descripcionProducto", "fechaCierre"],
  },
  {
    key: "container",
    number: 2,
    title: "forms.css.steps.container.title",
    shortTitle: "forms.css.steps.container.shortTitle",
    description: "forms.css.steps.container.description",
    icon: Package,
    color: "emerald",
    fields: ["contenedorTipos", "contenedoresPorSemana", "condicionesSuelo"],
  },
  {
    key: "measurements",
    number: 3,
    title: "forms.css.steps.measurements.title",
    shortTitle: "forms.css.steps.measurements.shortTitle",
    description: "forms.css.steps.measurements.description",
    icon: Ruler,
    color: "rose",
    fields: ["contenedorMedidas", "contenedorMedidaOtro"],
  },
  {
    key: "files",
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
 * Get form steps based on enableCustomerEntry flag and position options
 * @param enableCustomerEntry - Whether to include customer data step (DEALER flow)
 * @param customerStepBeforeFiles - When true, places customer step before files (end of form)
 * @returns Array of step configurations with correct numbering
 */
export function getFormSteps(
  enableCustomerEntry: boolean = false,
  customerStepBeforeFiles: boolean = false,
): StepConfig[] {
  if (!enableCustomerEntry) {
    return REGULAR_STEPS;
  }

  if (customerStepBeforeFiles) {
    // DEALER flow with customer step before files:
    // Regular steps 1..N-1, Customer step, Files step (last)
    const filesStep = REGULAR_STEPS[REGULAR_STEPS.length - 1]; // Last step is files
    const otherSteps = REGULAR_STEPS.slice(0, -1); // All except files

    const numberedOtherSteps = otherSteps.map((step, idx) => ({
      ...step,
      number: idx + 1,
    }));

    const customerStepNumber = numberedOtherSteps.length + 1;
    const customerStepWithNumber = {
      ...CUSTOMER_STEPS[0],
      number: customerStepNumber,
    };

    const filesStepWithNumber = {
      ...filesStep,
      number: customerStepNumber + 1,
    };

    return [...numberedOtherSteps, customerStepWithNumber, filesStepWithNumber];
  }

  // Default DEALER flow: prepend customer data steps and renumber all steps
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
