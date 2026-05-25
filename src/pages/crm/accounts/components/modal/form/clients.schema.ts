import { z } from "zod";

export const clientsSchema = z.object({
  clientsId: z.number().optional(),
  clientsName: z.string().trim().min(3, "Mínimo 3 caracteres"),
  clientsAddress: z.string().trim().min(3, "Mínimo 3 caracteres"),
  clientsCompany: z.string().optional(),
  documents: z.string().trim().min(8, "Mínimo 8 dígitos").max(11),
  clientsPhone: z.string().optional(),

  documentTypeId: z.number({ invalid_type_error: "Requerido" }),
  documentTypeLabel: z.string().optional(),

  workerId: z.number().nullable().optional(),
  workerLabel: z.string().optional(),

  departmentId: z.number().nullable().optional(),
  provinceId: z.number().nullable().optional(),
  districtId: z.number().nullable().optional(),

  processTypeId: z.number().nullable().optional(),
  processTypeLabel: z.string().optional(),

  sectorId: z.number().nullable().optional(),
  sectorLabel: z.string().optional(),

  leadSourceId: z.number().nullable().optional(),
  leadSourcesLabel: z.string().optional(),

  leadStatusId: z.number().nullable().optional(),
  leadStatusLabel: z.string().optional(),

  leadQualificationId: z.number().nullable().optional(),
  leadQualificationLabel: z.string().optional(),

  website: z.string().optional(),

  departmentLabel: z.string().optional(),
  provinceLabel: z.string().optional(),
  districtLabel: z.string().optional(),
});

export type ClientsFormValues = z.infer<typeof clientsSchema>;

export function mapToFormValues(d?: Partial<ClientsFormValues>): Partial<ClientsFormValues> {
  if (!d) return {};
  return {
    ...d,
    clientsName: d.clientsName ?? "",
    documents: d.documents ?? "",
    clientsCompany: d.clientsCompany ?? "",
    clientsAddress: d.clientsAddress ?? "",
    clientsPhone: d.clientsPhone ?? "",
    website: d.website ?? "",
  };
}

export const idToOption = (id?: number | null, label?: string) =>
  id != null ? { value: id, label: label ?? `ID ${id}` } : null;
