import {
  Unplug,
  Ruler,
  Paperclip,
  Building2,
  PencilLine,
  NotebookText,
  AlignHorizontalSpaceAround,
} from "lucide-react";

// Customer data step shown only when enableCustomerEntry is true
export const CUSTOMER_DATA_STEP = {
  key: "customerData" as const,
  number: 1,
  title: "forms.logistica.steps.customerData.title",
  shortTitle: "forms.logistica.steps.customerData.shortTitle",
  description: "forms.logistica.steps.customerData.description",
  icon: Building2,
  color: "indigo" as const,
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

// Regular form steps (without customer data)
export const REGULAR_STEPS = [
  {
    key: "operation" as const,
    number: 1,
    title: "forms.logistica.steps.operation.title",
    shortTitle: "forms.logistica.steps.operation.shortTitle",
    description: "forms.logistica.steps.operation.description",
    icon: PencilLine,
    color: "primary" as const,
    fields: [
      "fechaCierre",
      "notasOperacion",
      "tieneRampas",
      "notasRampas",
      "tienePasosPuertas",
      "notasPasosPuertas",
      "tieneRestricciones",
      "notasRestricciones",
      "alturaMaximaNave",
      "anchoPasilloActual",
      "superficieTrabajo",
      "condicionesSuelo",
      "tipoOperacion",
    ],
  },
  {
    key: "application" as const,
    number: 2,
    title: "forms.logistica.steps.application.title",
    shortTitle: "forms.logistica.steps.application.shortTitle",
    description: "forms.logistica.steps.application.description",
    icon: NotebookText,
    color: "blue" as const,
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
    title: "forms.logistica.steps.batteries.title",
    shortTitle: "forms.logistica.steps.batteries.shortTitle",
    description: "forms.logistica.steps.batteries.description",
    icon: Unplug,
    color: "amber" as const,
    fields: ["equiposElectricos"],
  },
  {
    key: "loads" as const,
    number: 4,
    title: "forms.logistica.steps.loads.title",
    shortTitle: "forms.logistica.steps.loads.shortTitle",
    description: "forms.logistica.steps.loads.description",
    icon: Ruler,
    color: "emerald" as const,
    fields: ["dimensionesCargas"],
  },
  {
    key: "aisle" as const,
    number: 5,
    title: "forms.logistica.steps.aisle.title",
    shortTitle: "forms.logistica.steps.aisle.shortTitle",
    description: "forms.logistica.steps.aisle.description",
    icon: AlignHorizontalSpaceAround,
    color: "violet" as const,
    fields: ["pasilloActual"],
  },
  {
    key: "files" as const,
    number: 6,
    title: "forms.logistica.steps.files.title",
    shortTitle: "forms.logistica.steps.files.shortTitle",
    description: "forms.logistica.steps.files.description",
    icon: Paperclip,
    color: "rose" as const,
    fields: ["archivos"],
  },
];

// Legacy export for backward compatibility
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
      number: index + 2, // Start from 2 since customer data is step 1
    })),
  ];
}
