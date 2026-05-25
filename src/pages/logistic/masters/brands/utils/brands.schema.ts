import { z } from "zod";
export const BrandsSchema = z.object({
  brandsId: z.number().optional(),
  description: z
    .string()
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .max(50, "La descripción no puede exceder 50 caracteres"),
});

export type BrandsFormValues = z.infer<typeof BrandsSchema>;
