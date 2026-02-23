import { z } from "zod";
import { InspectionPhotoType, VehicleStatus } from "@prisma/client";

// ==================== VEHICLE SCHEMAS ====================
export const createVehicleSchema = (t: (key: string) => string) =>
  z.object({
    model: z
      .string()
      .min(1, t("inspectionsPage.vehicles.validation.modelRequired")),
    plate: z
      .string()
      .min(1, t("inspectionsPage.vehicles.validation.plateRequired")),
    status: z
      .nativeEnum(VehicleStatus)
      .optional()
      .default(VehicleStatus.ACTIVE),
    assignedInspectorId: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
    imageCloudinaryId: z.string().optional(),
  });

export type CreateVehicleSchema = z.infer<
  ReturnType<typeof createVehicleSchema>
>;

export const updateVehicleSchema = (t: (key: string) => string) =>
  z.object({
    model: z
      .string()
      .min(1, t("inspectionsPage.vehicles.validation.modelRequired"))
      .optional(),
    plate: z
      .string()
      .min(1, t("inspectionsPage.vehicles.validation.plateRequired"))
      .optional(),
    status: z.nativeEnum(VehicleStatus).optional(),
    assignedInspectorId: z.string().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    imageCloudinaryId: z.string().nullable().optional(),
  });

export type UpdateVehicleSchema = z.infer<
  ReturnType<typeof updateVehicleSchema>
>;

// ==================== INSPECTION PHOTO SCHEMA ====================
export const inspectionPhotoSchema = z.object({
  photoType: z.nativeEnum(InspectionPhotoType),
  cloudinaryId: z.string(),
  cloudinaryUrl: z.string().url(),
  cloudinaryType: z.string(),
  format: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  size: z.number(),
});

export type InspectionPhotoSchema = z.infer<typeof inspectionPhotoSchema>;

// ==================== INSPECTION FORM SCHEMAS ====================

// Step 1: Vehicle Data
export const vehicleDataSchema = (t: (key: string) => string) =>
  z.object({
    vehicleId: z
      .string()
      .min(1, t("inspectionsPage.form.vehicle.validation.required")),
    mileage: z.coerce
      .number()
      .int()
      .positive(t("inspectionsPage.form.vehicle.validation.mileagePositive")),
  });

// Step 2: Checklist
export const checklistSchema = () =>
  z.object({
    oilLevel: z.boolean().default(false),
    coolantLevel: z.boolean().default(false),
    brakeFluidLevel: z.boolean().default(false),
    hydraulicLevel: z.boolean().default(false),
    brakePedal: z.boolean().default(false),
    clutchPedal: z.boolean().default(false),
    gasPedal: z.boolean().default(false),
    headlights: z.boolean().default(false),
    tailLights: z.boolean().default(false),
    brakeLights: z.boolean().default(false),
    turnSignals: z.boolean().default(false),
    hazardLights: z.boolean().default(false),
    reversingLights: z.boolean().default(false),
    dashboardLights: z.boolean().default(false),
  });

// Step 3: Photos
export const photosSchema = (t: (key: string) => string) =>
  z.object({
    photos: z
      .array(inspectionPhotoSchema)
      .min(6, t("inspectionsPage.form.photos.validation.allRequired")),
  });

// Step 4: Observations
export const observationsSchema = () =>
  z.object({
    observations: z.string().optional().default(""),
  });

// Step 5: Signature
export const signatureSchema = (t: (key: string) => string) =>
  z.object({
    signatureUrl: z
      .string()
      .min(1, t("inspectionsPage.form.signature.validation.required")),
    signatureCloudinaryId: z.string().optional(),
  });

// Combined full inspection schema
export const getInspectionSchema = (t: (key: string) => string) =>
  z.object({
    // Step 1
    vehicleId: z
      .string()
      .min(1, t("inspectionsPage.form.vehicle.validation.required")),
    mileage: z.coerce
      .number()
      .int()
      .positive(t("inspectionsPage.form.vehicle.validation.mileagePositive")),

    // Step 2
    oilLevel: z.boolean().default(false),
    coolantLevel: z.boolean().default(false),
    brakeFluidLevel: z.boolean().default(false),
    hydraulicLevel: z.boolean().default(false),
    brakePedal: z.boolean().default(false),
    clutchPedal: z.boolean().default(false),
    gasPedal: z.boolean().default(false),
    headlights: z.boolean().default(false),
    tailLights: z.boolean().default(false),
    brakeLights: z.boolean().default(false),
    turnSignals: z.boolean().default(false),
    hazardLights: z.boolean().default(false),
    reversingLights: z.boolean().default(false),
    dashboardLights: z.boolean().default(false),

    // Step 3
    photos: z
      .array(inspectionPhotoSchema)
      .min(6, t("inspectionsPage.form.photos.validation.allRequired")),

    // Step 4
    observations: z.string().optional().default(""),

    // Step 5
    signatureUrl: z
      .string()
      .min(1, t("inspectionsPage.form.signature.validation.required")),
    signatureCloudinaryId: z.string().optional(),
  });

export type InspectionFormSchema = z.infer<
  ReturnType<typeof getInspectionSchema>
>;

// ==================== APPROVAL SCHEMA ====================
export const approveInspectionSchema = (t: (key: string) => string) =>
  z
    .object({
      approved: z.boolean(),
      comments: z.string().optional().default(""),
    })
    .refine(
      (data) =>
        data.approved || (data.comments && data.comments.trim().length > 0),
      {
        message: t("inspectionsPage.approval.validation.commentsRequired"),
        path: ["comments"],
      },
    );

export type ApproveInspectionSchema = z.infer<
  ReturnType<typeof approveInspectionSchema>
>;
