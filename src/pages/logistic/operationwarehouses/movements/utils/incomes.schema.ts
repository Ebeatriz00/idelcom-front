import { z } from "zod";

const optionalText = z.string().trim().max(250).optional();

function emptyNumberToUndefined(value: unknown) {
  if (value === "") return undefined;
  if (typeof value === "number" && Number.isNaN(value)) return undefined;
  return value;
}

const requiredQuantity = z.preprocess(
  emptyNumberToUndefined,
  z
    .number({
      required_error: "Ingrese la cantidad.",
      invalid_type_error: "Ingrese una cantidad valida.",
    })
    .positive("La cantidad debe ser mayor a 0."),
);

const requiredUnitCost = z.preprocess(
  emptyNumberToUndefined,
  z
    .number({
      required_error: "Ingrese el costo unitario.",
      invalid_type_error: "Ingrese un costo unitario valido.",
    })
    .min(0, "El costo unitario no puede ser negativo."),
);

export const incomeDetailSchema = z.object({
  productsId: z.coerce.number().positive("Seleccione un producto."),
  productLabel: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  partNum: z.string().optional(),
  brand: z.string().optional(),
  productType: z.string().optional(),
  currentStock: z.coerce.number().optional(),
  averageCost: z.coerce.number().optional(),
  lastCost: z.coerce.number().optional(),
  manageLots: z.boolean().optional(),
  manageSerials: z.boolean().optional(),
  expirationControl: z.boolean().optional(),
  quantity: requiredQuantity,
  unitCost: requiredUnitCost,
  lotNumber: optionalText,
  serialNumber: optionalText,
  expirationDate: z.string().optional(),
  observation: optionalText,
});

export const incomeFormSchema = z.object({
  movementTypeId: z.coerce
    .number()
    .positive("Seleccione el tipo de ingreso."),
  requiresSupplier: z.boolean().optional(),
  warehouseId: z.coerce.number().positive("Seleccione el almacen."),
  suppliersId: z.coerce.number().optional(),
  taxesId: z.coerce.number().optional(),
  movementDate: z.string().min(1, "La fecha de movimiento es obligatoria."),
  series: z.string().trim().max(20, "Maximo 20 caracteres.").optional(),
  numberDocument: z
    .string()
    .trim()
    .max(50, "Maximo 50 caracteres.")
    .optional(),
  referenceDocument: z
    .string()
    .trim()
    .max(80, "Maximo 80 caracteres.")
    .optional(),
  observation: optionalText,
  details: z.array(incomeDetailSchema).min(1, "Agregue al menos un producto."),
}).superRefine((data, ctx) => {
  if (data.requiresSupplier && (!data.suppliersId || data.suppliersId <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["suppliersId"],
      message: "Seleccione el proveedor para este tipo de ingreso.",
    });
  }

  const seen = new Map<number, number>();

  data.details.forEach((detail, index) => {
    if (detail.productsId <= 0) return;

    const previous = seen.get(detail.productsId);
    if (previous != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["details", index, "productsId"],
        message: "Este producto ya fue agregado.",
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["details", previous, "productsId"],
        message: "Producto duplicado.",
      });
    }
    seen.set(detail.productsId, index);

    if (detail.manageLots && !detail.lotNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["details", index, "lotNumber"],
        message: "El lote es obligatorio para este producto.",
      });
    }

    if (detail.manageSerials && !detail.serialNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["details", index, "serialNumber"],
        message: "La serie es obligatoria para este producto.",
      });
    }

    if (detail.expirationControl && !detail.expirationDate?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["details", index, "expirationDate"],
        message: "El vencimiento es obligatorio para este producto.",
      });
    }
  });
});

export type IncomeFormValues = z.infer<typeof incomeFormSchema>;

export function buildDefaultIncomeValues(): IncomeFormValues {
  return {
    movementTypeId: 0,
    requiresSupplier: false,
    warehouseId: 0,
    suppliersId: undefined,
    taxesId: undefined,
    movementDate: new Date().toISOString().slice(0, 10),
    series: "",
    numberDocument: "",
    referenceDocument: "",
    observation: "",
    details: [
      {
        productsId: 0,
        productLabel: "",
        sku: "",
        barcode: "",
        partNum: "",
        brand: "",
        productType: "",
        currentStock: 0,
        averageCost: 0,
        lastCost: 0,
        manageLots: false,
        manageSerials: false,
        expirationControl: false,
        quantity: 1,
        unitCost: 0,
        lotNumber: "",
        serialNumber: "",
        expirationDate: "",
        observation: "",
      },
    ],
  };
}
