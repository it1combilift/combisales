import { z } from "zod";

// ======== AUTH SCHEMA ======== //

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Por favor ingresa un correo válido."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
  remember: z.boolean().optional(),
});
