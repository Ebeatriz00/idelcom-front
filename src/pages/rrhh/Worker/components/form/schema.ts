import { z } from "zod";

export const workerSchema = z.object({
  workerId: z.number().optional(),
  workerName: z.string().trim().min(3, "Mínimo 3 caracteres"),
  workerLastName: z.string().trim().min(3, "Mínimo 3 caracteres"),
  documentTypeId: z.number({ invalid_type_error: "Requerido" }),
  workerDocument: z.string().trim().min(8, "Mínimo 8 dígitos"),
  jobTitleId: z.number({ invalid_type_error: "El cargo es obligatorio" }),
  areaId: z.number({ invalid_type_error: "El área es obligatoria" }),

  departmentId: z.number().nullable().optional(),
  provinceId: z.number().nullable().optional(),
  districtId: z.number().nullable().optional(),

  address: z.string().trim().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  email: z.string().email("Correo inválido").nullable().optional().or(z.literal("")),

  birthDate: z.coerce.date().nullable().optional(),
  dateEntry: z.coerce.date().nullable().optional(),
  dateCes: z.coerce.date().nullable().optional(),

  bankId: z.number().nullable().optional(),
  ccBank: z.string().trim().nullable().optional(),
  cciBank: z.string().trim().nullable().optional(),

  salary: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().nonnegative().optional()
  ),
  numberChildren: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().nonnegative().optional()
  ),
  prevJob: z.string().trim().nullable().optional(),

  departmentLabel: z.string().optional(),
  provinceLabel: z.string().optional(),
  districtLabel: z.string().optional(),
});

export type WorkerFormValues = z.infer<typeof workerSchema>;
