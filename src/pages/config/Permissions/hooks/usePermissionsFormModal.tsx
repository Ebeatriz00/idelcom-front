import type { PermissionsUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import {
  usePermissionsById,
  usePermissionsMutations,
} from "@/sharedKernel/hooks/permissions/usePermissions";
import { useMemo, useState } from "react";

export function usePermissionsFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = usePermissionsById(editingId);
  const { createMut, updateMut } = usePermissionsMutations();

  const defaultValues = useMemo(() => {
    if (!editingId)
      return {
        permissionsCode: "",
        permissionsName: "",
        permissionsDescription: "",
      };
    return {
      permissionsId: detail?.permissionsId ?? editingId,
      permissionsCode: detail?.permissionsCode,
      permissionsName: detail?.permissionsName ?? "",
      permissionsDescription: detail?.permissionsDescription ?? "",
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

  async function submit(dto: PermissionsUpsertDto) {
    try {
      showLoading("Guardando permiso...");
      if (dto.permissionsId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Permiso creado.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Permiso actualizado.");
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
