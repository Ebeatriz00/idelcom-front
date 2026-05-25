import type { StateOpportunityUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useStateOpportunityById,
  useStateOpportunityMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useStateOpportunityFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useStateOpportunityById(editingId);
  const { createMut, updateMut } = useStateOpportunityMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: "",
      };
    }
    return {
      stateOpportunityId: detail?.stateOpportunityId ?? editingId,
      stateColor: detail?.stateColor,
      stateDesc: detail?.stateDesc,
      numPercPro: detail?.numPercPro,
      numOrder: detail?.numOrder,
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

  async function submit(dto: StateOpportunityUpsertDto) {
    try {
      showLoading("Guardando Estados de oportunidades...");
      if (dto.stateOpportunityId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Estados de oportunidades creada.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Estados de oportunidades actualizada.");
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
