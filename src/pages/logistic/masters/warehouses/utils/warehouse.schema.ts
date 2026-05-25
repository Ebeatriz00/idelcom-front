import { z } from "zod";

export const warehouseSchema = z.object({
  warehousesId: z.number().optional(),

  description: z
    .string()
    .min(10, "La descripcion debe tener al menos 10 caracteres")
    .max(50, "La descripcion no puede exceder 50 caracteres"),

  address: z
    .string()
    .min(10, "La direccion debe tener al menos 10 caracteres")
    .max(100, "La direccion no puede exceder 100 caracteres"),

  departmentId: z
    .number({
      invalid_type_error: "El departamento debe ser un numero",
    })
    .optional()
    .refine((value) => value != null, "El departamento es requerido"),

  provinceId: z
    .number({
      invalid_type_error: "La provincia debe ser un numero",
    })
    .optional()
    .refine((value) => value != null, "La provincia es requerida"),

  districtId: z
    .number({
      invalid_type_error: "El distrito debe ser un numero",
    })
    .optional()
    .refine((value) => value != null, "El distrito es requerido"),

  departmentLabel: z.string().optional(),
  provinceLabel: z.string().optional(),
  districtLabel: z.string().optional(),
});

export const idToOption = (id?: number | null, label?: string) =>
  id != null ? { value: id, label: label ?? `ID ${id}` } : null;

export type WarehouseFormValues = {
  warehousesId?: number;
  description: string;
  address: string;
  departmentId?: number;
  provinceId?: number;
  districtId?: number;
  departmentLabel?: string;
  provinceLabel?: string;
  districtLabel?: string;
};
