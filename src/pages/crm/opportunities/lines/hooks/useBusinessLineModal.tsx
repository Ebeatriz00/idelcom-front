import type { BusinessLineUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useBusinessLineById,
  useBusinessLineMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useBusinessLineFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useBusinessLineById(editingId);
  const { createMut, updateMut } = useBusinessLineMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        descLine: "",
      };
    }
    return {
      businessLineId: detail?.businessLineId ?? editingId,
      descLine: detail?.descLine,
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

  async function submit(dto: BusinessLineUpsertDto) {
    try {
      showLoading("Guardando Linea de negocios...");
      if (dto.businessLineId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Linea de negocios creada.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Linea de negocios actualizada.");
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
