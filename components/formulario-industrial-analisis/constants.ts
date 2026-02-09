import {
  Ruler,
  Route,
  Paperclip,
  Building2,
  PencilLine,
  Unplug,
  NotebookText,
} from "lucide-react";

// Customer data step (only for DEALER flow with enableCustomerEntry=true)
const CUSTOMER_DATA_STEP = {
  key: "customerData" as const,
  number: 1,
  title: "forms.industrial.steps.customerData.title",
  shortTitle: "forms.industrial.steps.customerData.shortTitle",
  description: "forms.industrial.steps.customerData.description",
  icon: Building2,
  color: "primary" as const,
  fields: [
    "razonSocial",
    "direccion",
    "website",
    "personaContacto",
    "email",
    "localidad",
    "provinciaEstado",
    "pais",
    "codigoPostal",
    "numeroIdentificacionFiscal",
    "distribuidor",
    "contactoDistribuidor",
    "fechaCierre",
  ],
};

// Regular steps (used in normal ADMIN/SELLER flow)
const REGULAR_STEPS = [
  {
    key: "operation" as const,
    number: 1,
    title: "forms.industrial.steps.operation.title",
    shortTitle: "forms.industrial.steps.operation.shortTitle",
    description: "forms.industrial.steps.operation.description",
    icon: PencilLine,
    color: "blue" as const,
    fields: ["notasOperacion", "fechaCierre"],
  },
  {
    key: "application" as const,
    number: 2,
    title: "forms.industrial.steps.application.title",
    shortTitle: "forms.industrial.steps.application.shortTitle",
    description: "forms.industrial.steps.application.description",
    icon: NotebookText,
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
    key: "batteries" as const,
    number: 3,
    title: "forms.industrial.steps.batteries.title",
    shortTitle: "forms.industrial.steps.batteries.shortTitle",
    description: "forms.industrial.steps.batteries.description",
    icon: Unplug,
    color: "violet" as const,
    fields: ["equiposElectricos"],
  },
  {
    key: "loads" as const,
    number: 4,
    title: "forms.industrial.steps.loads.title",
    shortTitle: "forms.industrial.steps.loads.shortTitle",
    description: "forms.industrial.steps.loads.description",
    icon: Ruler,
    color: "emerald" as const,
    fields: ["dimensionesCargas"],
  },
  {
    key: "aisle" as const,
    number: 5,
    title: "forms.industrial.steps.aisle.title",
    shortTitle: "forms.industrial.steps.aisle.shortTitle",
    description: "forms.industrial.steps.aisle.description",
    icon: Route,
    color: "rose" as const,
    fields: ["especificacionesPasillo"],
  },
  {
    key: "files" as const,
    number: 6,
    title: "forms.industrial.steps.files.title",
    shortTitle: "forms.industrial.steps.files.shortTitle",
    description: "forms.industrial.steps.files.description",
    icon: Paperclip,
    color: "cyan" as const,
    fields: ["archivos"],
  },
];

// Default export for backward compatibility
export const FORM_STEPS = REGULAR_STEPS;

/**
 * Get form steps based on enableCustomerEntry flag and position options
 * @param enableCustomerEntry - Whether to include customer data step (DEALER flow)
 * @param customerStepBeforeFiles - When true, places customer step before files (end of form)
 * @returns Array of step configurations with correct numbering
 */
export function getFormSteps(
  enableCustomerEntry: boolean = false,
  customerStepBeforeFiles: boolean = false,
) {
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
      ...CUSTOMER_DATA_STEP,
      number: customerStepNumber,
    };

    const filesStepWithNumber = {
      ...filesStep,
      number: customerStepNumber + 1,
    };

    return [...numberedOtherSteps, customerStepWithNumber, filesStepWithNumber];
  }

  // Default DEALER flow: prepend customer data step and renumber all steps
  return [
    CUSTOMER_DATA_STEP,
    ...REGULAR_STEPS.map((step, index) => ({
      ...step,
      number: index + 2, // Shift numbers by 1
    })),
  ];
}
