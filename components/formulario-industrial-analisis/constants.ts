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
  number: 1,
  title: "forms.industrial.steps.customerData.title",
  shortTitle: "forms.industrial.steps.customerData.shortTitle",
  description: "forms.industrial.steps.customerData.description",
  icon: Building2,
  color: "primary" as const,
  fields: [
    "razonSocial",
    "personaContacto",
    "email",
    "direccion",
    "localidad",
    "provinciaEstado",
    "pais",
    "codigoPostal",
    "numeroIdentificacionFiscal",
    "distribuidor",
    "contactoDistribuidor",
  ],
};

// Regular steps (used in normal ADMIN/SELLER flow)
const REGULAR_STEPS = [
  {
    number: 1,
    title: "forms.industrial.steps.operation.title",
    shortTitle: "forms.industrial.steps.operation.shortTitle",
    description: "forms.industrial.steps.operation.description",
    icon: PencilLine,
    color: "blue" as const,
    fields: ["notasOperacion", "fechaCierre"],
  },
  {
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
    number: 3,
    title: "forms.industrial.steps.batteries.title",
    shortTitle: "forms.industrial.steps.batteries.shortTitle",
    description: "forms.industrial.steps.batteries.description",
    icon: Unplug,
    color: "violet" as const,
    fields: ["equiposElectricos"],
  },
  {
    number: 4,
    title: "forms.industrial.steps.loads.title",
    shortTitle: "forms.industrial.steps.loads.shortTitle",
    description: "forms.industrial.steps.loads.description",
    icon: Ruler,
    color: "emerald" as const,
    fields: ["dimensionesCargas"],
  },
  {
    number: 5,
    title: "forms.industrial.steps.aisle.title",
    shortTitle: "forms.industrial.steps.aisle.shortTitle",
    description: "forms.industrial.steps.aisle.description",
    icon: Route,
    color: "rose" as const,
    fields: ["especificacionesPasillo"],
  },
  {
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
 * Get form steps based on enableCustomerEntry flag
 * When enableCustomerEntry is true (DEALER flow), customer data step is prepended
 * When false (normal ADMIN/SELLER flow), only regular steps are returned
 */
export function getFormSteps(enableCustomerEntry: boolean = false) {
  if (!enableCustomerEntry) {
    return REGULAR_STEPS;
  }

  // For DEALER flow: prepend customer data step and renumber all steps
  return [
    CUSTOMER_DATA_STEP,
    ...REGULAR_STEPS.map((step, index) => ({
      ...step,
      number: index + 2, // Shift numbers by 1
    })),
  ];
}
