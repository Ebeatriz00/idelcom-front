import * as z from "zod";

export const clinicSchema = z.object({
  clinicName: z.string().min(1, "El nombre de la clínica es requerido").max(100, "Máximo 100 caracteres"),
  documentNumber: z.string().nullable().optional(),
});

export type ClinicFormValues = z.infer<typeof clinicSchema>;
