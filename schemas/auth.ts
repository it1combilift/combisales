import { z } from "zod";
import { Role } from "@prisma/client";

// ======== AUTH SCHEMA ======== //

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Por favor ingresa un correo válido."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
  remember: z.boolean().optional(),
});

// Create user schema (Admin only)
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Update user schema (Admin only)
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
  image: z.string().url().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});
