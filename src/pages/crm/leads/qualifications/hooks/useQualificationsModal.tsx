import type { QualificationsUpsertDto } from "@/application";
import { closeAlert, showApiError, showLoading, showSuccess, useQualificationsById, useQualificationsMutations } from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useQualificationsFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useQualificationsById(editingId);
  const { createMut, updateMut } = useQualificationsMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: ""
      };
    }
    return {
      leadsQualificationsId: detail?.leadsQualificationsId ?? editingId,
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

  async function submit(dto: QualificationsUpsertDto) {
    try {
      showLoading("Guardando leads de calificación...");
      if (dto.leadsQualificationsId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("leads de calificación creada.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("leads de calificación actualizada.");
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