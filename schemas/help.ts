import { z } from "zod";

/**
 * Help request categories
 */
export const helpCategories = [
  "bug",
  "technical",
  "feature",
  "question",
  "other",
] as const;

export type HelpCategory = (typeof helpCategories)[number];

/**
 * Image attachment schema
 */
const imageAttachmentSchema = z.object({
  cloudinaryId: z.string(),
  cloudinaryUrl: z.string().url(),
  nombre: z.string(),
  tamanio: z.number().positive(),
});

/**
 * Help request form schema factory
 * Returns a Zod schema with internationalized error messages
 */
export function createHelpFormSchema(t: (key: string) => string) {
  return z.object({
    category: z.enum(helpCategories, {
      required_error: t("help.validation.categoryRequired"),
    }),
    subject: z
      .string()
      .min(5, { message: t("help.validation.subjectMin") })
      .max(100, { message: t("help.validation.subjectMax") }),
    description: z
      .string()
      .min(20, { message: t("help.validation.descriptionMin") })
      .max(2000, { message: t("help.validation.descriptionMax") }),
    images: z.array(imageAttachmentSchema).max(5).optional(),
  });
}

/**
 * Type inference for help form data
 */
export type HelpFormData = z.infer<ReturnType<typeof createHelpFormSchema>>;

/**
 * API request schema (server-side validation)
 */
export const helpRequestSchema = z.object({
  category: z.enum(helpCategories),
  subject: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  images: z.array(imageAttachmentSchema).max(5).optional(),
});

export type HelpRequestData = z.infer<typeof helpRequestSchema>;
