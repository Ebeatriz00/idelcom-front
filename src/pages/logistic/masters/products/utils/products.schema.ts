import { z } from "zod";

export type ProductImageFormValue = {
  fileUrl: string;
  fileTitle?: string;
  relativePath?: string;
};

const productImageSchema = z
  .array(
    z.object({
      fileUrl: z.string().trim().min(1).max(350),
      fileTitle: z.string().trim().max(250).optional(),
      relativePath: z.string().trim().max(350).optional(),
    }),
  )
  .optional();

export const productsUpsertSchema = z
  .object({
    productsId: z.number().optional(),

    sku: z.string().trim().max(50, "El SKU no debe exceder los 50 caracteres.").optional(),
    barcode: z.string().trim().max(100, "El codigo de barras no debe exceder los 100 caracteres.").optional(),
    partNum: z.string().trim().max(100, "El numero de parte no debe exceder los 100 caracteres.").optional(),

    description: z
      .string()
      .trim()
      .min(1, "La descripcion es obligatoria.")
      .max(200, "La descripcion no debe exceder los 200 caracteres."),

    shortDescription: z
      .string()
      .trim()
      .max(100, "La descripcion corta no debe exceder los 100 caracteres.")
      .optional(),

    productTypeId: z
      .number({
        required_error: "Seleccione un tipo de producto",
        invalid_type_error: "Seleccione un tipo de producto",
      })
      .positive("Seleccione un tipo de producto")
      .optional()
      .refine((val) => val !== undefined && val !== 0, {
        message: "Seleccione un tipo de producto",
      }),

    productLinesId: z
      .number({
        required_error: "Seleccione una linea",
        invalid_type_error: "Seleccione una linea",
      })
      .positive("Seleccione una linea")
      .optional()
      .refine((val) => val !== undefined && val !== 0, {
        message: "Seleccione una linea",
      }),

    categoriesId: z
      .number({
        required_error: "Seleccione una categoria",
        invalid_type_error: "Seleccione una categoria",
      })
      .positive("Seleccione una categoria")
      .optional()
      .refine((val) => val !== undefined && val !== 0, {
        message: "Seleccione una categoria",
      }),

    brandsId: z
      .number({
        required_error: "Seleccione una marca",
        invalid_type_error: "Seleccione una marca",
      })
      .positive("Seleccione una marca")
      .optional()
      .refine((val) => val !== undefined && val !== 0, {
        message: "Seleccione una marca",
      }),

    uomId: z
      .number({
        required_error: "Seleccione una unidad",
        invalid_type_error: "Seleccione una unidad",
      })
      .positive("Seleccione una unidad")
      .optional()
      .refine((val) => val !== undefined && val !== 0, {
        message: "Seleccione una unidad",
      }),

    stockMin: z.number().min(0, "El stock minimo no puede ser negativo.").optional(),
    stockMax: z.number().min(0, "El stock maximo no puede ser negativo.").optional(),
    conversionFactor: z.number().min(0, "El factor de conversion no puede ser negativo.").optional(),

    isActive: z.boolean().default(true),
    isStockable: z.boolean().default(false),
    isServices: z.boolean().default(false),
    isReturnable: z.boolean().default(false),
    isTool: z.boolean().default(false),
    canBuy: z.boolean().default(false),
    canSell: z.boolean().default(false),
    manageLots: z.boolean().default(false),
    manegesSerials: z.boolean().default(false),
    expirationControl: z.boolean().default(false),

    weight: z.number().min(0, "El peso no puede ser negativo.").optional(),
    volume: z.number().min(0, "El volumen no puede ser negativo.").optional(),

    files: productImageSchema,
  })
  .superRefine((data, ctx) => {
    if (data.manageLots && data.manegesSerials) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["manegesSerials"],
        message: "No se puede manejar lotes y series simultaneamente",
      });
    }

    if (data.expirationControl && !data.manageLots) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expirationControl"],
        message: "El control de vencimiento requiere manejo de lotes",
      });
    }

    if (data.isServices) {
      if (data.isStockable) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["isStockable"],
          message: "Los servicios no manejan stock",
        });
      }
      if (data.manageLots || data.manegesSerials || data.expirationControl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["manageLots"],
          message: "Los servicios no manejan lotes/series/vencimiento",
        });
      }
    }

    if (data.isTool) {
      if (!data.isReturnable) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["isReturnable"],
          message: "Las herramientas deben ser retornables",
        });
      }
      if (data.canSell) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["canSell"],
          message: "Las herramientas no estan destinadas a la venta",
        });
      }
      if (!data.isStockable) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["isStockable"],
          message: "Las herramientas deben ser inventariables",
        });
      }
    }
  });

export type ProductsUpsertSchemaValues = z.infer<typeof productsUpsertSchema>;

export type ProductsUpsertFormValues = Omit<
  ProductsUpsertSchemaValues,
  "productTypeId" | "productLinesId" | "categoriesId" | "brandsId" | "uomId"
> & {
  productTypeId?: number;
  productLinesId?: number;
  categoriesId?: number;
  brandsId?: number;
  uomId?: number;
  files?: ProductImageFormValue[];
};
