import { z } from "zod";

const optionalId = z.preprocess(
  (value) => (value === 0 || value === "" || value == null ? undefined : value),
  z.number().optional(),
);

const requiredId = (message: string) =>
  z.preprocess(
    (value) => (value === 0 || value === "" || value == null ? undefined : value),
    z.number({ required_error: message, invalid_type_error: message }),
  );

export const movementTypesUpsertSchema = z
  .object({
    movementTypesId: optionalId,
    code: z
      .string({ required_error: "El codigo es obligatorio." })
      .trim()
      .min(2, "El codigo debe tener al menos 2 caracteres.")
      .max(20, "El codigo no debe superar 20 caracteres."),
    description: z
      .string({ required_error: "La descripcion es obligatoria." })
      .trim()
      .min(3, "La descripcion debe tener al menos 3 caracteres.")
      .max(150, "La descripcion no debe superar 150 caracteres."),
    movClasId: requiredId("Seleccione una clasificacion."),
    movOperId: requiredId("Seleccione una operacion."),
    movPerId: optionalId,
    movSunatId: optionalId,
    affectsStock: z.boolean().default(true),
    requiresDestWare: z.boolean().default(false),
    generatesAccounting: z.boolean().default(false),
    allowNegative: z.boolean().default(false),
    operationLabel: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const operation = normalizeMovementLabel(values.operationLabel);

    if (operation === "TRASLADO" && !values.requiresDestWare) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requiresDestWare"],
        message: "Los traslados deben requerir almacen destino.",
      });
    }

    if (values.requiresDestWare && operation !== "TRASLADO") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["movOperId"],
        message: "Si requiere almacen destino, la operacion debe ser TRASLADO.",
      });
    }

    if (!values.affectsStock && values.allowNegative) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allowNegative"],
        message: "No puede permitir negativo si no afecta stock.",
      });
    }

    if (values.allowNegative && !values.affectsStock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["affectsStock"],
        message: "Para permitir negativo, el tipo debe afectar stock.",
      });
    }
  });

export type MovementTypesFormValues = z.infer<typeof movementTypesUpsertSchema>;

export function normalizeMovementLabel(value?: string | null) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}
