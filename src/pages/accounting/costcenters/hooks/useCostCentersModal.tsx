import type { CostCentersUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useCostCentersById,
  useCostCentersMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";


export function useCostCentersFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useCostCentersById(editingId);
  const { createMut, updateMut } = useCostCentersMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: "",
      };
    }
    return {
      costCentersId: detail?.costCentersId ?? editingId,
      description: detail?.description ?? "",
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

  async function submit(dto: CostCentersUpsertDto) {
    try {
      showLoading("Guardando centro de costo...");
      if (dto.costCentersId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Centro de costo creado.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Centro de costo actualizado.");
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
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  };
}