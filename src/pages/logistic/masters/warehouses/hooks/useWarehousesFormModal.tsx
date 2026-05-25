import { closeAlert, showApiError } from "@/sharedKernel";
import { useMemo, useState } from "react";

import type { WarehousesUpsertDto } from "@/application";
import {
  useWarehousesById,
  useWarehousesMutations,
} from "@/sharedKernel/hooks/logistic/masters/useWarehouses";

type WarehousesFormDefaults = Partial<WarehousesUpsertDto> & {
  departmentLabel?: string;
  provinceLabel?: string;
  districtLabel?: string;
};

export function useWarehousesFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching, isSuccess } = useWarehousesById(editingId);

  const { createMut, updateMut } = useWarehousesMutations();

  const defaultValues = useMemo<WarehousesFormDefaults>(() => {
    if (!editingId) {
      const base: WarehousesFormDefaults = {
        description: "",
        address: "",
        departmentId: undefined,
        provinceId: undefined,
        districtId: undefined,
        departmentLabel: "",
        provinceLabel: "",
        districtLabel: "",
      };
      return base;
    }
    const d = detail ?? ({} as any);

    return {
      warehousesId: d.warehousesId,
      description: d.description ?? "",
      address: d.address ?? "",
      departmentId: d.departmentId,
      provinceId: d.provinceId,
      districtId: d.districtId,
      departmentLabel: d.departmentDescription ?? "",
      provinceLabel: d.provinceDescription ?? "",
      districtLabel: d.districtDescription ?? "",
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

  async function submit(dto: WarehousesUpsertDto) {
    try {
      if (dto.warehousesId == null) {
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
