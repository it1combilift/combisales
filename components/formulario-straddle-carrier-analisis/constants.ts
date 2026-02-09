import {
  Info,
  Container,
  Package,
  Settings,
  Paperclip,
  Building2,
} from "lucide-react";

// Customer data step shown only when enableCustomerEntry is true
export const CUSTOMER_DATA_STEP = {
  key: "customerData" as const,
  number: 1,
  title: "forms.straddleCarrier.steps.customerData.title",
  shortTitle: "forms.straddleCarrier.steps.customerData.shortTitle",
  description: "forms.straddleCarrier.steps.customerData.description",
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
    key: "instructions" as const,
    number: 1,
    title: "forms.straddleCarrier.steps.instructions.title",
    shortTitle: "forms.straddleCarrier.steps.instructions.shortTitle",
    description: "forms.straddleCarrier.steps.instructions.description",
    icon: Info,
    color: "primary" as const,
    fields: ["fechaCierre", "manejaContenedores", "manejaCargaEspecial"],
  },
  {
    key: "containers" as const,
    number: 2,
    title: "forms.straddleCarrier.steps.containers.title",
    shortTitle: "forms.straddleCarrier.steps.containers.shortTitle",
    description: "forms.straddleCarrier.steps.containers.description",
    icon: Container,
    color: "blue" as const,
    fields: [
      "manejaContenedoresIndiv",
      "dobleApilamiento",
      "contenedoresTamanios",
      "pesoMaximoContenedor",
      "infoAdicionalContenedores",
    ],
  },
  {
    key: "specialLoad" as const,
    number: 3,
    title: "forms.straddleCarrier.steps.specialLoad.title",
    shortTitle: "forms.straddleCarrier.steps.specialLoad.shortTitle",
    description: "forms.straddleCarrier.steps.specialLoad.description",
    icon: Package,
    color: "amber" as const,
    fields: [
      "productoMasLargo",
      "productoMasCorto",
      "productoMasAncho",
      "productoMasEstrecho",
      "puntosElevacionLongitud",
      "puntosElevacionAncho",
      "pesoMaximoProductoLargo",
      "pesoMaximoProductoCorto",
      "productoMasAlto",
    ],
  },
  {
    key: "others" as const,
    number: 4,
    title: "forms.straddleCarrier.steps.others.title",
    shortTitle: "forms.straddleCarrier.steps.others.shortTitle",
    description: "forms.straddleCarrier.steps.others.description",
    icon: Settings,
    color: "violet" as const,
    fields: [
      "zonasPasoAncho",
      "zonasPasoAlto",
      "condicionesPiso",
      "pisoPlano",
      "restriccionesAltura",
      "restriccionesAnchura",
      "notasAdicionales",
    ],
  },
  {
    key: "files" as const,
    number: 5,
    title: "forms.straddleCarrier.steps.files.title",
    shortTitle: "forms.straddleCarrier.steps.files.shortTitle",
    description: "forms.straddleCarrier.steps.files.description",
    icon: Paperclip,
    color: "emerald" as const,
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

// Container sizes configuration
export const CONTAINER_SIZES = [
  { key: "size20ft", label: "20 ft", shortLabel: "20'" },
  { key: "size30ft", label: "30 ft", shortLabel: "30'" },
  { key: "size40ft", label: "40 ft", shortLabel: "40'" },
  { key: "size45ft", label: "45 ft", shortLabel: "45'" },
  { key: "size53ft", label: "53 ft", shortLabel: "53'" },
] as const;
