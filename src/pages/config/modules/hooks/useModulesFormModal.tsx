import type { ModulesUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  useModulesById,
  useModulesMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useModulesFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useModulesById(editingId);
  const { createMut, updateMut } = useModulesMutations();

  const defaultValues = useMemo(() => {
    if (!editingId) return { modulesName: "", modulesDescription: "" };
    return {
      modulesId: detail?.modulesId ?? editingId,
      modulesName: detail?.modulesName ?? "",
      modulesDescription: detail?.modulesDescription ?? "",
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

  async function submit(dto: ModulesUpsertDto) {
    try {
      if (dto.modulesId == null) {
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
