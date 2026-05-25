import type { LeadsStatusUpsertDto } from "@/application";
import { closeAlert, showApiError, showLoading, showSuccess, useLeadsStatusById, useLeadsStatusMutations } from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useLeadsStatusFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useLeadsStatusById(editingId);
  const { createMut, updateMut } = useLeadsStatusMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: ""
      };
    }
    return {
      leadsStatusId: detail?.leadsStatusId ?? editingId,
      description: detail?.description ?? ""
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

  async function submit(dto: LeadsStatusUpsertDto) {
    try {
      showLoading("Guardando fuentes...");
      if (dto.leadsStatusId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("fuentes creada.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("fuentes actualizada.");
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