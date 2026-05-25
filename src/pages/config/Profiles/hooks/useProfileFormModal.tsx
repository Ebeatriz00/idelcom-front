//profiles/hooks/useProfileFormModal.ts
import { useState, useMemo } from "react";
import { showLoading, showSuccess, showApiError, closeAlert } from "@/sharedKernel";
import { useProfileById, useProfileMutations } from "@/sharedKernel/hooks/profiles/useProfilesList";

export function useProfileFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useProfileById(editingId);
  const { createMut, updateMut } = useProfileMutations();

  const defaultValues = useMemo(() => {
    if (!editingId) return { name: "", description: "" };
    return {
      profilesId: detail?.profilesId ?? editingId,
      name: detail?.name ?? "",
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

  async function submit(dto: { profilesId?: number; name: string; description?: string }) {
    try {
      showLoading("Guardando perfil...");
      if (dto.profilesId == null) {
        await createMut.mutateAsync({ name: dto.name, description: dto.description ?? "" });
        showSuccess("Perfil creado.");
      } else {
        await updateMut.mutateAsync({
          profilesId: dto.profilesId,
          name: dto.name,
          description: dto.description ?? "",
        });
        showSuccess("Perfil actualizado.");
      }
      close();
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
    }
  }

  const saving = createMut.isPending || updateMut.isPending;

  return { open, isFetching, defaultValues, openCreate, openEdit, close, submit, saving, editingId };
}
