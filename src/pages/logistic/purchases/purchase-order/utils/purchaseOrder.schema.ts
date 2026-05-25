import { z } from "zod";

export const purchaseOrderDetailSchema = z.object({
  purchaseOrderDetailId: z.number().optional(),
  productsId: z
    .number({
      required_error: "Seleccione un producto",
      invalid_type_error: "Seleccione un producto",
    })
    .min(1, "Seleccione un producto"),
  uomId: z.number().nullish(),
  quantity: z
    .number({
      required_error: "La cantidad es requerida",
      invalid_type_error: "La cantidad es requerida",
    })
    .min(0.01, "La cantidad debe ser mayor a 0"),
  unitPrice: z
    .number({
      required_error: "El precio es requerido",
      invalid_type_error: "El precio es requerido",
    })
    .min(0, "El precio no puede ser negativo"),
  discountPercent: z
    .number({ invalid_type_error: "Ingrese un descuento válido" })
    .min(0, "El descuento no puede ser menor a 0")
    .max(100, "El descuento no puede ser mayor a 100")
    .default(0),
  taxesId: z
    .number({
      required_error: "Seleccione el impuesto",
      invalid_type_error: "Seleccione el impuesto",
    })
    .min(1, "Seleccione el impuesto"),
  priceIncludesTax: z.boolean().default(false),
  observation: z.string().optional(),
  productLabel: z.string().optional(),
});

export const purchaseOrderSchema = z.object({
  suppliersId: z
    .number({
      required_error: "Seleccione un proveedor",
      invalid_type_error: "Seleccione un proveedor",
    })
    .min(1, "Seleccione un proveedor"),
  purchaseOrderDate: z.string().min(1, "La fecha es requerida"),
  currencyId: z
    .number({
      required_error: "Seleccione la moneda",
      invalid_type_error: "Seleccione la moneda",
    })
    .min(1, "Seleccione la moneda"),
  exchangeRate: z
    .number({ invalid_type_error: "Ingrese un tipo de cambio válido" })
    .min(0, "El tipo de cambio no puede ser negativo")
    .default(1),
  pmConditionId: z
    .number({ invalid_type_error: "Seleccione una condición válida" })
    .min(0, "Seleccione una condición válida")
    .default(0),
  expectedDeliveryDate: z.string().optional(),
  warehouseId: z.number().optional(),
  supplierQuotationReferenceNumber: z.string().optional(),
  references: z.string().optional(),
  observation: z.string().optional(),
  details: z.array(purchaseOrderDetailSchema).min(1, "Debe agregar al menos un producto"),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderDetailFormValues = z.infer<typeof purchaseOrderDetailSchema>;
