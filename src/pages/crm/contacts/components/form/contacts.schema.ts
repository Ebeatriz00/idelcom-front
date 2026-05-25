import { z } from "zod";

export const contactsSchema = z.object({
  contactsCrmId: z.number().optional(),
  contactName: z.string().trim().min(3, "Mínimo 3 caracteres"),
  jobTitle: z.string().trim().min(3, "Mínimo 3 caracteres"),
  phone: z.string().trim().optional(),
  movil: z.string().trim().optional(),
  email: z.string().trim().email("Email inválido").min(1, "Requerido"),
  workerId: z.number({ invalid_type_error: "Requerido" }),
  clientsId: z.number().optional(),
  leadsSourcesId: z.number({ invalid_type_error: "Requerido" }),
  contactTypeId: z.number({ invalid_type_error: "Requerido" }),
});

export type ContactsFormValues = z.infer<typeof contactsSchema>;

export function mapToFormValues(
  d?: Partial<ContactsFormValues>
): Partial<ContactsFormValues> {
  if (!d) return {};
  return {
    ...d,
    contactName: d.contactName ?? "",
    jobTitle: d.jobTitle ?? "",
    phone: d.phone ?? "",
    movil: d.movil ?? "",
    email: d.email ?? "",
  };
}

export const normalizeId = (id: unknown) => {
  const n = typeof id === "string" ? Number(id) : (id as number);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export const idToOption = (id?: number | null, label?: string) => {
  const n = normalizeId(id);
  return n ? { value: n, label: label ?? `ID ${n}` } : null;
};
