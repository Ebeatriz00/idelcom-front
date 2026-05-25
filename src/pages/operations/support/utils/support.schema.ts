import { z } from "zod";

export const supportSchema = z.object({
  supportId: z.number().optional(),
  provider: z.string().min(1, "El proveedor es requerido"),
  service: z.string().min(1, "El servicio es requerido"),
  url: z.string().nullable().optional(),
  access: z.string().nullable().optional(),
  email: z.string().email("Debe ser un correo válido").or(z.literal("")).nullable().optional(),
  username: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  supportState: z.number().nullable().optional(),
  startDate: z.string().nullable().optional(),
  expirationDate: z.string().nullable().optional(),
  comments: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
});

export type SupportFormValues = z.infer<typeof supportSchema>;
