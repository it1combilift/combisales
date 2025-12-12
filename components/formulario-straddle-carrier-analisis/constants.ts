import { Info, Container, Package, Settings, Paperclip } from "lucide-react";

// Steps optimizados: Se eliminó el Step de datos del cliente (autocompletado)
// El campo fechaCierre se movió al Step 1 (Instrucciones)
export const FORM_STEPS = [
  {
    number: 1,
    title: "Instrucciones",
    description: "Detalles de las cargas",
    icon: Info,
    color: "primary" as const,
    fields: ["fechaCierre", "manejaContenedores", "manejaCargaEspecial"],
  },
  {
    number: 2,
    title: "Contenedores",
    description: "Cuadro 1 - Contenedores",
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
    number: 3,
    title: "Carga especial",
    description: "Cuadro 2 - Dimensiones",
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
    number: 4,
    title: "Otros",
    description: "Condiciones adicionales",
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
    number: 5,
    title: "Archivos adjuntos",
    description: "Fotos, videos y documentos",
    icon: Paperclip,
    color: "emerald" as const,
    fields: ["archivos"],
  },
];

// Container sizes configuration
export const CONTAINER_SIZES = [
  { key: "size20ft", label: "20 ft", shortLabel: "20'" },
  { key: "size30ft", label: "30 ft", shortLabel: "30'" },
  { key: "size40ft", label: "40 ft", shortLabel: "40'" },
  { key: "size45ft", label: "45 ft", shortLabel: "45'" },
  { key: "size53ft", label: "53 ft", shortLabel: "53'" },
] as const;
