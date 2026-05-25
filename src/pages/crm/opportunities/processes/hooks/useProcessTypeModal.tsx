import type { ProcessTypeUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useProcessTypeById,
  useProcessTypeMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useProcessTypeFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useProcessTypeById(editingId);
  const { createMut, updateMut } = useProcessTypeMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        descType: "",
      };
    }
    return {
      processTypeId: detail?.processTypeId ?? editingId,
      descType: detail?.descType,
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

  async function submit(dto: ProcessTypeUpsertDto) {
    try {
      showLoading("Guardando tipos de proceso...");
      if (dto.processTypeId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("tipos de proceso creada.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("tipos de proceso actualizada.");
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
