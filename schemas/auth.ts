import { z } from "zod";
import { Role } from "@prisma/client";

// ======== AUTH SCHEMA ======== //

// Type for translation function (matches useI18n hook)
type TranslationFn = (
  key: string,
  values?: Record<string, string | number>
) => string;

// Login schema factory
export const createLoginSchema = (t: TranslationFn) =>
  z.object({
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(6, t("validation.passwordMinLength6")),
    remember: z.boolean().optional(),
  });

// Login schema (default - for backward compatibility)
export const loginSchema = z.object({
  email: z.string().email("Por favor ingresa un correo válido."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
  remember: z.boolean().optional(),
});

// Create user schema factory (Admin only)
export const createUserSchemaFactory = (t: TranslationFn) =>
  z
    .object({
      name: z.string().min(2, t("validation.nameMinLength")),
      email: z.string().email(t("validation.invalidEmail")),
      password: z.string().min(8, t("validation.passwordMinLength8")),
      confirmPassword: z.string().min(8, t("validation.passwordMinLength8")),
      role: z.nativeEnum(Role, {
        errorMap: () => ({ message: t("validation.invalidRole") }),
      }),
      country: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => (val === "" ? undefined : val)),
      isActive: z.boolean().default(true),
      // Profile image URL from Cloudinary
      image: z
        .string()
        .url(t("validation.invalidImageUrl"))
        .optional()
        .nullable()
        .or(z.literal(""))
        .transform((val) => (val === "" ? null : val)),
      // Para usuarios DEALER: IDs de sellers asignados
      assignedSellerIds: z.array(z.string().cuid()).optional().default([]),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordMatch"),
      path: ["confirmPassword"],
    });

// Create user schema (default - for backward compatibility)
export const createUserSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Por favor ingresa un correo válido."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    role: z.nativeEnum(Role, {
      errorMap: () => ({ message: "Rol inválido" }),
    }),
    country: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((val) => (val === "" ? undefined : val)),
    isActive: z.boolean().default(true),
    // Profile image URL from Cloudinary
    image: z
      .string()
      .url("URL de imagen inválida")
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((val) => (val === "" ? null : val)),
    // Para usuarios DEALER: IDs de sellers asignados
    assignedSellerIds: z.array(z.string().cuid()).optional().default([]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Update user schema factory (Admin only)
export const createUpdateUserSchemaFactory = (t: TranslationFn) =>
  z.object({
    id: z.string().cuid(t("validation.invalidUserId")),
    name: z.string().min(2, t("validation.nameMinLength")).optional(),
    email: z.string().email(t("validation.invalidEmail")).optional(),
    role: z
      .nativeEnum(Role, {
        errorMap: () => ({ message: t("validation.invalidRole") }),
      })
      .optional(),
    country: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((val) => (val === "" ? undefined : val)),
    isActive: z.boolean().optional(),
    password: z
      .string()
      .min(8, t("validation.passwordMinLength8"))
      .optional()
      .or(z.literal(""))
      .transform((val) => (val === "" ? undefined : val)),
    // Profile image URL from Cloudinary (null to remove)
    image: z
      .string()
      .url(t("validation.invalidImageUrl"))
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((val) => (val === "" ? null : val)),
    // Para usuarios DEALER: IDs de sellers asignados
    assignedSellerIds: z.array(z.string().cuid()).optional(),
  });

// Update user schema (default - for backward compatibility)
export const updateUserSchema = z.object({
  id: z.string().cuid("ID de usuario inválido"),
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .optional(),
  email: z.string().email("Por favor ingresa un correo válido.").optional(),
  role: z
    .nativeEnum(Role, {
      errorMap: () => ({ message: "Rol inválido" }),
    })
    .optional(),
  country: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  isActive: z.boolean().optional(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  // Profile image URL from Cloudinary (null to remove)
  image: z
    .string()
    .url("URL de imagen inválida")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
  // Para usuarios DEALER: IDs de sellers asignados
  assignedSellerIds: z.array(z.string().cuid()).optional(),
});

// Delete user schema
export const deleteUserSchema = z.object({
  id: z.string().cuid("ID de usuario inválido"),
});

// Delete multiple users schema
export const deleteMultipleUsersSchema = z.object({
  ids: z
    .array(z.string().cuid("ID de usuario inválido"))
    .min(1, "Debe proporcionar al menos un ID"),
});

// Update current user schema
export const updateCurrentUserSchema = z.object({
  name: z.string().min(2).optional(),
  image: z
    .string()
    .url()
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});
