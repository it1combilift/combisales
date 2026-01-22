import {
  FileText,
  Package,
  Zap,
  Ruler,
  Route,
  Paperclip,
  Building2,
} from "lucide-react";

// Customer data step shown only when enableCustomerEntry is true
export const CUSTOMER_DATA_STEP = {
  number: 1,
  title: "forms.logistica.steps.customerData.title",
  shortTitle: "forms.logistica.steps.customerData.shortTitle",
  description: "forms.logistica.steps.customerData.description",
  icon: Building2,
  color: "indigo" as const,
  fields: [
    "customerName",
    "customerEmail",
    "customerPhone",
    "customerAddress",
    "customerCity",
    "customerCountry",
    "customerNotes",
  ],
};

// Regular form steps (without customer data)
export const REGULAR_STEPS = [
  {
    number: 1,
    title: "forms.logistica.steps.operation.title",
    shortTitle: "forms.logistica.steps.operation.shortTitle",
    description: "forms.logistica.steps.operation.description",
    icon: FileText,
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
    number: 2,
    title: "forms.logistica.steps.application.title",
    shortTitle: "forms.logistica.steps.application.shortTitle",
    description: "forms.logistica.steps.application.description",
    icon: Package,
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
    number: 3,
    title: "forms.logistica.steps.batteries.title",
    shortTitle: "forms.logistica.steps.batteries.shortTitle",
    description: "forms.logistica.steps.batteries.description",
    icon: Zap,
    color: "amber" as const,
    fields: ["equiposElectricos"],
  },
  {
    number: 4,
    title: "forms.logistica.steps.loads.title",
    shortTitle: "forms.logistica.steps.loads.shortTitle",
    description: "forms.logistica.steps.loads.description",
    icon: Ruler,
    color: "emerald" as const,
    fields: ["dimensionesCargas"],
  },
  {
    number: 5,
    title: "forms.logistica.steps.aisle.title",
    shortTitle: "forms.logistica.steps.aisle.shortTitle",
    description: "forms.logistica.steps.aisle.description",
    icon: Route,
    color: "violet" as const,
    fields: ["pasilloActual"],
  },
  {
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

// Get form steps based on whether customer entry is enabled
export function getFormSteps(enableCustomerEntry: boolean = false) {
  if (!enableCustomerEntry) {
    return REGULAR_STEPS;
  }

  // Return customer step + regular steps with renumbered steps
  return [
    CUSTOMER_DATA_STEP,
    ...REGULAR_STEPS.map((step, index) => ({
      ...step,
      number: index + 2, // Start from 2 since customer data is step 1
    })),
  ];
}
