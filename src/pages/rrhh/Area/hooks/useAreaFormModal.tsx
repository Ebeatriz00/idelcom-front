import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useAreaById,
  useAreaMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useAreaFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useAreaById(editingId);
  const { createMut, updateMut } = useAreaMutations();

  const defaultValues = useMemo(() => {
    if (!editingId) return { businessId: undefined, description: "" };
    return {
      areaId: detail?.areaId ?? editingId,
      businessId: detail?.businessId,
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

  async function submit(dto: { areaId?: number; description?: string }) {
    try {
      showLoading("Guardando área...");
      if (dto.areaId == null) {
        await createMut.mutateAsync({
          description: dto.description ?? "",
        });
        showSuccess("Área creada.");
      } else {
        await updateMut.mutateAsync({
          areaId: dto.areaId,
          description: dto.description ?? "",
        });
        showSuccess("Área actualizada.");
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
