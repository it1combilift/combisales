import {
  InspectionStatus,
  InspectionPhotoType,
  Role,
  VehicleStatus,
} from "@prisma/client";

// Re-export enums for easier import
export { InspectionStatus, InspectionPhotoType, VehicleStatus };

// ==================== VEHICLE INTERFACES ====================
export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  status: VehicleStatus;
  imageUrl: string | null;
  imageCloudinaryId: string | null;
  assignedInspectorId: string | null;
  assignedInspector?: VehicleInspector | null;
  inspections?: InspectionSummary[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    inspections: number;
  };
}

export interface VehicleInspector {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
}

export interface CreateVehiclePayload {
  model: string;
  plate: string;
  status?: VehicleStatus;
  assignedInspectorId?: string;
  imageUrl?: string;
  imageCloudinaryId?: string;
}

export interface UpdateVehiclePayload {
  model?: string;
  plate?: string;
  status?: VehicleStatus;
  assignedInspectorId?: string | null;
  imageUrl?: string | null;
  imageCloudinaryId?: string | null;
}

// ==================== INSPECTION INTERFACES ====================
export interface InspectionPhoto {
  id: string;
  inspectionId: string;
  photoType: InspectionPhotoType;
  cloudinaryId: string;
  cloudinaryUrl: string;
  cloudinaryType: string;
  format: string;
  width: number | null;
  height: number | null;
  size: number;
  createdAt: string;
}

export interface InspectionApproval {
  id: string;
  inspectionId: string;
  userId: string;
  approved: boolean;
  comments: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Inspection {
  id: string;
  vehicleId: string;
  userId: string;
  mileage: number;

  // Checklist - Levels
  oilLevel: boolean;
  coolantLevel: boolean;
  brakeFluidLevel: boolean;
  hydraulicLevel: boolean;

  // Checklist - Pedals
  brakePedal: boolean;
  clutchPedal: boolean;
  gasPedal: boolean;

  // Checklist - Lights
  headlights: boolean;
  tailLights: boolean;
  brakeLights: boolean;
  turnSignals: boolean;
  hazardLights: boolean;
  reversingLights: boolean;
  dashboardLights: boolean;

  observations: string | null;
  status: InspectionStatus;
  signatureUrl: string | null;
  signatureCloudinaryId: string | null;
  zohoRecordId: string | null;
  pdfUrl: string | null;

  // Relations
  vehicle: Vehicle;
  user: {
    id: string;
    name: string | null;
    email: string;
    roles: Role[];
  };
  photos: InspectionPhoto[];
  approval: InspectionApproval | null;

  createdAt: string;
  updatedAt: string;
}

export interface InspectionSummary {
  id: string;
  mileage: number;
  status: InspectionStatus;
  createdAt: string;
}

export interface CreateInspectionPayload {
  vehicleId: string;
  mileage: number;

  // Checklist
  oilLevel: boolean;
  coolantLevel: boolean;
  brakeFluidLevel: boolean;
  hydraulicLevel: boolean;
  brakePedal: boolean;
  clutchPedal: boolean;
  gasPedal: boolean;
  headlights: boolean;
  tailLights: boolean;
  brakeLights: boolean;
  turnSignals: boolean;
  hazardLights: boolean;
  reversingLights: boolean;
  dashboardLights: boolean;

  observations?: string;
  signatureUrl?: string;
  signatureCloudinaryId?: string;

  photos: {
    photoType: InspectionPhotoType;
    cloudinaryId: string;
    cloudinaryUrl: string;
    cloudinaryType: string;
    format: string;
    width?: number;
    height?: number;
    size: number;
  }[];
}

export interface ApproveInspectionPayload {
  approved: boolean;
  comments?: string;
}

// ==================== CHECKLIST CONFIGURATION ====================
export interface ChecklistItem {
  key: string;
  labelKey: string; // i18n key
}

export interface ChecklistGroup {
  titleKey: string; // i18n key
  items: ChecklistItem[];
}

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    titleKey: "inspectionsPage.form.checklist.levels.title",
    items: [
      {
        key: "oilLevel",
        labelKey: "inspectionsPage.form.checklist.levels.oil",
      },
      {
        key: "coolantLevel",
        labelKey: "inspectionsPage.form.checklist.levels.coolant",
      },
      {
        key: "brakeFluidLevel",
        labelKey: "inspectionsPage.form.checklist.levels.brakeFluid",
      },
      {
        key: "hydraulicLevel",
        labelKey: "inspectionsPage.form.checklist.levels.hydraulic",
      },
    ],
  },
  {
    titleKey: "inspectionsPage.form.checklist.pedals.title",
    items: [
      {
        key: "brakePedal",
        labelKey: "inspectionsPage.form.checklist.pedals.brake",
      },
      {
        key: "clutchPedal",
        labelKey: "inspectionsPage.form.checklist.pedals.clutch",
      },
      {
        key: "gasPedal",
        labelKey: "inspectionsPage.form.checklist.pedals.gas",
      },
    ],
  },
  {
    titleKey: "inspectionsPage.form.checklist.lights.title",
    items: [
      {
        key: "headlights",
        labelKey: "inspectionsPage.form.checklist.lights.headlights",
      },
      {
        key: "tailLights",
        labelKey: "inspectionsPage.form.checklist.lights.tailLights",
      },
      {
        key: "brakeLights",
        labelKey: "inspectionsPage.form.checklist.lights.brakeLights",
      },
      {
        key: "turnSignals",
        labelKey: "inspectionsPage.form.checklist.lights.turnSignals",
      },
      {
        key: "hazardLights",
        labelKey: "inspectionsPage.form.checklist.lights.hazardLights",
      },
      {
        key: "reversingLights",
        labelKey: "inspectionsPage.form.checklist.lights.reversingLights",
      },
      {
        key: "dashboardLights",
        labelKey: "inspectionsPage.form.checklist.lights.dashboardLights",
      },
    ],
  },
];

// Photo types for the inspection form
export const INSPECTION_PHOTO_TYPES: {
  type: InspectionPhotoType;
  labelKey: string;
}[] = [
  { type: "FRONT", labelKey: "inspectionsPage.form.photos.front" },
  { type: "REAR", labelKey: "inspectionsPage.form.photos.rear" },
  { type: "DRIVER_SIDE", labelKey: "inspectionsPage.form.photos.driverSide" },
  {
    type: "PASSENGER_SIDE",
    labelKey: "inspectionsPage.form.photos.passengerSide",
  },
  { type: "INTERIOR", labelKey: "inspectionsPage.form.photos.interior" },
  {
    type: "SAFETY_DEVICES",
    labelKey: "inspectionsPage.form.photos.safetyDevices",
  },
];
