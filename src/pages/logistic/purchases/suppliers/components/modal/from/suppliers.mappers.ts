import type { OptionItem, SuppliersUpsertDto } from "@/application";
import type { SuppliersFormValues } from "./suppliers.schema";

export const idToOption = (id?: number, label?: string): OptionItem | null =>
  id != null ? { value: id, label: label ?? `ID ${id}` } : null;

const toFlag = (value: unknown) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  return value === true || normalized === "1" || normalized === "true";
};

export function mapToFormValues(
  d?: Partial<
    SuppliersUpsertDto & {
      supplierTypeId?: number;
      typeSupliersDescription?: string;
      suppliersGroupsDescription?: string;
      documentTypeDescription?: string;
      paymentTypeDescription?: string;
      paymentConditionDesc?: string;
      paymentConditionDescription?: string;
      paymentMethodDescription?: string;
      departmentDescription?: string;
      provinceDescription?: string;
      districtDescription?: string;
    }
  >
): Partial<SuppliersFormValues> {
  if (!d) return {};
  return {
    suppliersId: d.suppliersId,
    supplierName: d.supplierName ?? "",
    tradeName: d.tradeName ?? "",
    documentNumber: d.documentNumber ?? "",
    contactName: d.contactName ?? "",
    email: d.email ?? "",
    phone: d.phone ?? "",
    movil: d.movil ?? "",
    address: d.address ?? "",
    sunatStatus: d.sunatStatus,
    sunatCondition: d.sunatCondition,

    supplierTypeId: d.supplierTypeId,
    suppliersGroupsId: d.suppliersGroupsId,
    paymentConditionId: d.paymentConditionId,
    paymentMethodId: d.paymentMethodId,
    documentTypeId: d.documentTypeId,
    departmentId: d.departamentId ?? d.departmentId ?? undefined,
    provinceId: d.provinceId ?? undefined,
    districtId: d.districtId ?? undefined,

    retainerAgent: toFlag(d.retainerAgent),
    perceptionAgent: toFlag(d.perceptionAgent),
    detractionAgent: toFlag(d.detractionAgent),
    foreignAgent: toFlag(d.foreignAgent),

    suppliersGroupsLabel: d.suppliersGroupsDescription,
    documentTypeLabel: d.documentTypeDescription,
    paymentTypeLabel:
      d.paymentTypeDescription ??
      d.paymentConditionDescription ??
      d.paymentConditionDesc,
    paymentMethodLabel: d.paymentMethodDescription,
    departmentLabel: d.departmentDescription,
    provinceLabel: d.provinceDescription,
    districtLabel: d.districtDescription,
  };
}

export function mapToDto(values: SuppliersFormValues): SuppliersUpsertDto {
  return {
    suppliersId: values.suppliersId,

    supplierName: values.supplierName.trim(),
    tradeName: values.tradeName?.trim() ?? "",
    documentNumber: values.documentNumber.trim(),
    contactName: values.contactName.trim(),
    email: values.email.trim(),
    phone: values.phone ?? "",
    movil: values.movil ?? "",
    address: values.address ?? "",
    sunatStatus: values.sunatStatus,
    sunatCondition: values.sunatCondition,

    supplierTypeId: values.supplierTypeId,
    suppliersGroupsId: values.suppliersGroupsId,
    paymentConditionId: values.paymentConditionId,
    paymentMethodId: values.paymentMethodId,
    documentTypeId: values.documentTypeId,
    departamentId: values.departmentId,
    provinceId: values.provinceId,
    districtId: values.districtId,

    retainerAgent: Boolean(values.retainerAgent),
    perceptionAgent: Boolean(values.perceptionAgent),
    detractionAgent: Boolean(values.detractionAgent),
    foreignAgent: Boolean(values.foreignAgent),
  };
}
