import type { ContactTypeUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  useContactTypeById,
  useContactTypeMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useContactTypeFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useContactTypeById(editingId);
  const { createMut, updateMut } = useContactTypeMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: "",
      };
    }
    return {
      contactTypeId: detail?.contactTypeId ?? editingId,
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

  async function submit(dto: ContactTypeUpsertDto) {
    try {
      if (dto.contactTypeId == null) {
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
