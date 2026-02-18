import {
  Car,
  ClipboardCheck,
  Camera,
  MessageSquare,
  PenTool,
} from "lucide-react";

export type StepColor = "primary" | "blue" | "amber" | "violet" | "emerald";

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
};

export interface StepConfig {
  key: string;
  number: number;
  title: string; // i18n key
  shortTitle: string; // i18n key
  description: string; // i18n key
  icon: React.ElementType;
  color: StepColor;
  fields: string[];
}

export const INSPECTION_STEPS: StepConfig[] = [
  {
    key: "vehicleData",
    number: 1,
    title: "inspectionsPage.form.steps.vehicle.title",
    shortTitle: "inspectionsPage.form.steps.vehicle.shortTitle",
    description: "inspectionsPage.form.steps.vehicle.description",
    icon: Car,
    color: "primary",
    fields: ["vehicleId", "mileage"],
  },
  {
    key: "checklist",
    number: 2,
    title: "inspectionsPage.form.steps.checklist.title",
    shortTitle: "inspectionsPage.form.steps.checklist.shortTitle",
    description: "inspectionsPage.form.steps.checklist.description",
    icon: ClipboardCheck,
    color: "blue",
    fields: [
      "oilLevel",
      "coolantLevel",
      "brakeFluidLevel",
      "hydraulicLevel",
      "brakePedal",
      "clutchPedal",
      "gasPedal",
      "headlights",
      "tailLights",
      "brakeLights",
      "turnSignals",
      "hazardLights",
      "reversingLights",
      "dashboardLights",
    ],
  },
  {
    key: "photos",
    number: 3,
    title: "inspectionsPage.form.steps.photos.title",
    shortTitle: "inspectionsPage.form.steps.photos.shortTitle",
    description: "inspectionsPage.form.steps.photos.description",
    icon: Camera,
    color: "amber",
    fields: ["photos"],
  },
  {
    key: "observations",
    number: 4,
    title: "inspectionsPage.form.steps.observations.title",
    shortTitle: "inspectionsPage.form.steps.observations.shortTitle",
    description: "inspectionsPage.form.steps.observations.description",
    icon: MessageSquare,
    color: "violet",
    fields: ["observations"],
  },
  {
    key: "signature",
    number: 5,
    title: "inspectionsPage.form.steps.signature.title",
    shortTitle: "inspectionsPage.form.steps.signature.shortTitle",
    description: "inspectionsPage.form.steps.signature.description",
    icon: PenTool,
    color: "emerald",
    fields: ["signatureUrl", "signatureCloudinaryId"],
  },
];

export function getStepColorClasses(color: string): StepColorClasses {
  return STEP_COLOR_MAP[color as StepColor] || STEP_COLOR_MAP.primary;
}

export function getTotalSteps(): number {
  return INSPECTION_STEPS.length;
}
