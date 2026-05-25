import type { LeadsSourcesUpsertDto } from "@/application";
import { closeAlert, showApiError, showLoading, showSuccess, useLeadsSourcesById, useLeadsSourcesMutations } from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useLeadsSourcesFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useLeadsSourcesById(editingId);
  const { createMut, updateMut } = useLeadsSourcesMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: ""
      };
    }
    return {
      leadsSourcesId: detail?.leadsSourcesId ?? editingId,
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

  async function submit(dto: LeadsSourcesUpsertDto) {
    try {
      showLoading("Guardando fuentes...");
      if (dto.leadsSourcesId == null) {
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