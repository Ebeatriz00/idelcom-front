import type { BoxesUpsertDto } from "@/application";

import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useBoxesById,
  useBoxesMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useBoxesFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useBoxesById(editingId);
  const { createMut, updateMut } = useBoxesMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: "",
        currencyId: 0,
      };
    }
    return {
      boxesId: detail?.boxesId ?? editingId,
      description: detail?.description ?? "",
      currencyId: detail?.currencyId??0,
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

  async function submit(dto: BoxesUpsertDto) {
    try {
      showLoading("Guardando caja...");
      if (dto.boxesId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Caja creada.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Caja actualizada.");
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
    detail,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  };
}