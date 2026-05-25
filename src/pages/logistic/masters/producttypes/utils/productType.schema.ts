import { z } from "zod";

export const productTypeSchema = z
  .object({
    productTypeId: z.number().optional(),

    description: z
      .string()
      .min(10, "La descripción debe tener al menos 10 caracteres")
      .max(50, "La descripción no puede exceder 50 caracteres"),

    // ¿Se consume?
    isConsumable: z.boolean().default(false),

    // ¿Debe regresar?
    isReturnable: z.boolean().default(false),

    // ¿Se controla por serie?
    requiresSerial: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // Regla 1:
    // Un consumible normalmente NO retorna
    if (data.isConsumable && data.isReturnable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isReturnable"],
        message: "Un producto consumible no puede ser retornable.",
      });
    }

    // Regla 2:
    // Si es serializado, no debería ser consumible
    if (data.requiresSerial && data.isConsumable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requiresSerial"],
        message: "Un consumible no debería requerir serie.",
      });
    }
  });

export type ProductTypeFormValues = z.infer<typeof productTypeSchema>;
