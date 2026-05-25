import { z } from "zod";

const requiredNullableNumber = (msg = "Requerido") =>
  z
    .number()
    .nullable()
    .refine((v) => v != null, { message: msg });

export const suppliersSchema = z
  .object({
    suppliersId: z.number().optional(),

    supplierName: z
      .string()
      .trim()
      .min(3, "Mínimo 3 caracteres")
      .max(250, "Máximo 250 caracteres"),
    tradeName: z
      .string()
      .trim()
      .max(250, "Máximo 250 caracteres")
      .optional()
      .or(z.literal("")),
    documentNumber: z
      .string()
      .trim()
      .min(1, "Número de documento requerido")
      .length(11, "El RUC debe tener 11 dígitos")
      .max(20, "Máximo 20 caracteres"),
    contactName: z
      .string()
      .trim()
      .min(3, "Mínimo 3 caracteres")
      .max(150, "Máximo 150 caracteres"),
    email: z
      .string()
      .trim()
      .min(1, "Email requerido")
      .email("Email inválido")
      .max(150, "Máximo 150 caracteres"),

    phone: z
      .string()
      .max(20, "Máximo 20 caracteres")
      .optional()
      .or(z.literal("")),
    movil: z
      .string()
      .max(20, "Máximo 20 caracteres")
      .optional()
      .or(z.literal("")),
    address: z
      .string()
      .max(300, "Máximo 300 caracteres")
      .optional()
      .or(z.literal("")),

    sunatStatus: z.string().optional(),
    sunatCondition: z.string().optional(),

    suppliersGroupsId: z.number({ required_error: "Requerido" }),
    supplierTypeId: z.number({ required_error: "Requerido" }),
    paymentConditionId: z.number({ required_error: "Requerido" }),
    paymentMethodId: z.number({ required_error: "Requerido" }),
    documentTypeId: z.number({ required_error: "Requerido" }),

    departmentId: requiredNullableNumber(),
    provinceId: requiredNullableNumber(),
    districtId: requiredNullableNumber(),

    retainerAgent: z.boolean().default(false),
    perceptionAgent: z.boolean().default(false),
    detractionAgent: z.boolean().default(false),
    foreignAgent: z.boolean().default(false),

    departmentLabel: z.string().optional(),
    provinceLabel: z.string().optional(),
    districtLabel: z.string().optional(),
    typeSuppliersLabel: z.string().optional(),
    suppliersGroupsLabel: z.string().optional(),
    documentTypeLabel: z.string().optional(),
    paymentTypeLabel: z.string().optional(),
    paymentMethodLabel: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.foreignAgent) {
      const nationalFlags = [
        values.detractionAgent,
        values.retainerAgent,
        values.perceptionAgent,
      ];

      if (nationalFlags.some(Boolean)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["foreignAgent"],
          message:
            "Un proveedor no domiciliado no debe mezclarse con condiciones tributarias nacionales.",
        });
      }
    }

    if (values.retainerAgent && values.perceptionAgent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["retainerAgent"],
        message:
          "Un proveedor no puede configurarse simultaneamente como agente de retencion y agente de percepcion.",
      });
    }
  });

export type SuppliersFormValues = z.infer<typeof suppliersSchema>;
