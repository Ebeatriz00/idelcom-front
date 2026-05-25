import type { AssignmentTypeUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  useAssignmentTypeById,
  useAssignmentTypeMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useAssignmentTypeFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useAssignmentTypeById(editingId);
  const { createMut, updateMut } = useAssignmentTypeMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return { ssomaDocumentTypeDesc: "" };
    }
    return {
      ssomaAssignamentTypeId: detail?.ssomaAssignamentTypeId ?? editingId,
      ssomaAssignamentName: detail?.ssomaAssignamentName ?? "",
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

  async function submit(dto: AssignmentTypeUpsertDto) {
    try {
      showLoading("Guardando tipo de documento...");
      if (dto.ssomaAssignamentTypeId == null) {
        await createMut.mutateAsync(dto);
      } else {
        await updateMut.mutateAsync(dto);
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
