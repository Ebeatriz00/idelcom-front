import type { TaxAffTypeUpsertDto } from "@/application";
import { closeAlert, showApiError, showLoading, showSuccess, useTaxAffTypeById, useTaxAffTypeMutations } from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useTaxAffTypeFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useTaxAffTypeById(editingId);
  const { createMut, updateMut } = useTaxAffTypeMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: "",
        code: "",
      };
    }
    return {
      taxAffTypeId: detail?.taxAffTypeId ?? editingId,
      description: detail?.description ?? "",
      code: detail?.code ?? "",
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

  async function submit(dto: TaxAffTypeUpsertDto) {
    try {
      showLoading("Guardando moneda...");
      if (dto.taxAffTypeId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Moneda creada.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Moneda actualizada.");
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
