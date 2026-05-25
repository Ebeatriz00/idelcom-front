import type { WorkerFormValues } from "./schema";

export function mapToFormValues(
  d?: Partial<WorkerFormValues>
): Partial<WorkerFormValues> {
  if (!d) return {};
  return {
    ...d,
    workerName: d.workerName ?? "",
    workerLastName: d.workerLastName ?? "",
    workerDocument: d.workerDocument ?? "",
    address: d.address ?? "",
    phone: d.phone ?? "",
    email: d.email ?? "",

    birthDate: d.birthDate ? new Date(d.birthDate as any) : undefined,
    dateEntry: d.dateEntry ? new Date(d.dateEntry as any) : undefined,
    dateCes: d.dateCes ? new Date(d.dateCes as any) : undefined,

    numberChildren:
      (d as any).numberChildren === "" || (d as any).numberChildren == null
        ? undefined
        : Number((d as any).numberChildren),

    cciBank: (d as any).cciBank ?? (d as any).ccIbank ?? d.cciBank,
  };
}
