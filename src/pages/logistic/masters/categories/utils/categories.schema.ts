import { z } from "zod";
export const categoriesSchema = z.object({
  categoriesId: z.number().optional(),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(60, "La descripción no puede exceder 60 caracteres"),
});

export type CategoriesFormValues = z.infer<typeof categoriesSchema>;
