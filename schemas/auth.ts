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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Update schema
export const updateSchema = z.object({
  name: z.string().min(2).optional(),
  image: z.string().url().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});
