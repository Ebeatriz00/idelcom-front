import { z } from "zod";

export const productLineSchema = z.object({
  productLinesId: z.number().optional(),

  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(50, "La descripción no puede exceder 50 caracteres"),

  categoriesId: z.number({
    required_error: "La categoría es requerida",
    invalid_type_error: "La categoría debe ser un número",
  }),
});

export type ProductLineFormValues = z.infer<typeof productLineSchema>;
