import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useParentModulesById,
  useParentModulesMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useParentModulesFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useParentModulesById(editingId);
  const { createMut, updateMut } = useParentModulesMutations();

  const defaultValues = useMemo(() => {
    if (!editingId)
      return { code: "", title: "", stickyBottom: true, orderNo: 0 };
    return {
      parentModulesId: detail?.parentModulesId ?? editingId,
      code: detail?.code ?? "",
      title: detail?.title ?? "",
      stickyBottom: detail?.stickyBottom ?? true,
      orderNo: detail?.orderNo,
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
  async function submit(dto: {
    parentModulesId?: number;
    code?: string;
    title?: string;
    stickyBottom?: boolean;
    orderNo: number;
  }) {
    try {
      showLoading("Guardando módulo...");
      if (dto.parentModulesId == null) {
        await createMut.mutateAsync({
          code: dto.code,
          title: dto.title ?? "",
          stickyBottom: dto.stickyBottom,
          orderNo: dto.orderNo,
        });
        showSuccess("Módulo creado.");
      } else {
        await updateMut.mutateAsync({
          parentModulesId: dto.parentModulesId,
          code: dto.code,
          title: dto.title ?? "",
          stickyBottom: dto.stickyBottom,
          orderNo: dto.orderNo,
        });
        showSuccess("Módulo actualizado.");
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
