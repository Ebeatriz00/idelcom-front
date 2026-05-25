import { closeAlert, showApiError } from "@/sharedKernel";
import { useMemo, useState } from "react";

import type { SuppliersUpsertDto } from "@/application";
import {
  useSuppliersById,
  useSuppliersMutations,
} from "@/sharedKernel/hooks/logistic/purchases/useSuppliers";

type DefaultValuesType = Partial<SuppliersUpsertDto> & {
  departmentLabel?: string;
  provinceLabel?: string;
  districtLabel?: string;
  typeSuppliersLabel?: string;
  suppliersGroupsLabel?: string;
  documentTypeLabel?: string;
  paymentTypeLabel?: string;
  paymentMethodLabel?: string;
};

const toBooleanFlag = (value: unknown) => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return value === true || normalized === "1" || normalized === "true";
};

export function useSuppliersFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching, isSuccess } = useSuppliersById(editingId);

  const { createMut, updateMut } = useSuppliersMutations();

  const defaultValues = useMemo((): DefaultValuesType => {
    if (!editingId) {
      const base: DefaultValuesType = {
        supplierName: "",
        tradeName: "",
        documentNumber: "",
        contactName: "",
        email: "",
        phone: "",
        movil: "",
        address: "",

        departmentLabel: undefined,
        provinceLabel: undefined,
        districtLabel: undefined,
        typeSuppliersLabel: undefined,
        suppliersGroupsLabel: undefined,
        documentTypeLabel: undefined,
        paymentTypeLabel: undefined,
        paymentMethodLabel: undefined,
      };
      return base;
    }

    const d = detail;

    return {
      suppliersId: d?.suppliersId ?? editingId,
      // Textos
      supplierName: d?.supplierName ?? "",
      tradeName: d?.tradeName ?? "",
      documentNumber: d?.documentNumber ?? "",
      contactName: d?.contactName ?? "",
      email: d?.email ?? "",
      phone: d?.phone ?? "",
      movil: d?.movil ?? d?.mobile ?? "",
      address: d?.address ?? "",
      supplierTypeId: d?.supplierTypeId,
      suppliersGroupsId: d?.suppliersGroupsId ?? d?.supplierGroupsId,
      paymentConditionId: d?.paymentConditionId,
      paymentMethodId: d?.paymentMethodId,
      documentTypeId: d?.documentTypeId,
      departamentId: d?.departamentId ?? d?.departmentId,
      provinceId: d?.provinceId,
      districtId: d?.districtId,
      retainerAgent: toBooleanFlag(d?.retainerAgent),
      perceptionAgent: toBooleanFlag(d?.perceptionAgent),
      detractionAgent: toBooleanFlag(d?.detractionAgent),
      foreignAgent: toBooleanFlag(d?.foreignAgent),
      departmentLabel: d?.departamentDescription ?? d?.departmentDescription,
      provinceLabel: d?.provinceDescription,
      districtLabel: d?.districtDescription,
      suppliersGroupsLabel:
        d?.suppliersGroupsDescription ?? d?.suppliersGroupDesc,
      typeSuppliersLabel: d?.typeSuppliersLabel ?? d?.typeSuppliersDesc,
      documentTypeLabel: d?.documentTypeDescription,
      paymentTypeLabel:
        d?.paymentTypeDescription ??
        d?.paymentConditionDescription ??
        d?.paymentConditionDesc,
      paymentMethodLabel: d?.paymentMethodDescription ?? d?.paymentMethodDesc,
    };
  }, [editingId, detail]);

  function openCreate() {
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(id: number) {
    setEditingId(id);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
  }

  async function submit(dto: SuppliersUpsertDto) {
    try {
      if (dto.suppliersId == null) {
        await createMut.mutateAsync(dto);
      } else {
        await updateMut.mutateAsync(dto);
      }
      close();
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
    }
  }

  const saving = createMut.isPending || updateMut.isPending;

  return {
    open,
    isFetching,
    isSuccess,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  };
}
