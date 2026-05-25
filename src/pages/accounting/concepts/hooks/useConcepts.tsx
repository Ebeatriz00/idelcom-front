import type { ConceptsUpsertDto } from "@/application";

import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useConceptsById,
  useConceptsMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useConceptsFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useConceptsById(editingId);
  const { createMut, updateMut } = useConceptsMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: "",
        conceptGroupsId: 0,
        accountPlanId: 0,
      };
    }
    return {
      conceptsId: detail?.conceptsId ?? editingId,
      description: detail?.description ?? "",
      conceptGroupsId: detail?.conceptGroupsId,
      accountPlanId: detail?.accountPlanId,
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

  async function submit(dto: ConceptsUpsertDto) {
    try {
      showLoading("Guardando concepto...");
      if (dto.conceptsId == null) {
        await createMut.mutateAsync(dto);

        showSuccess("Concepto creado.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Concepto actualizado.");
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