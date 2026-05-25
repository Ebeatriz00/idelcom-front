import type { SsomaDocumentTypeUpsertDto } from "@/application";
import { closeAlert, showApiError, showLoading } from "@/sharedKernel";
import { useSsomaDocumentTypeById, useSsomaDocumentTypeMutations } from "@/sharedKernel/hooks/operations/documentType/useSsomaDocumentType";
import { useMemo, useState } from "react";

export function useSsomaDocumentTypeFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useSsomaDocumentTypeById(editingId);
  const { createMut, updateMut } = useSsomaDocumentTypeMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return { ssomaDocumentTypeDesc: "" };
    }
    return {
      ssomaDocumentTypeId: detail?.ssomaDocumentTypeId ?? editingId,
      ssomaDocumentTypeDesc: detail?.ssomaDocumentTypeDesc ?? "",
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

  async function submit(dto: SsomaDocumentTypeUpsertDto) {
    try {
      showLoading("Guardando tipo de documento...");
      if (dto.ssomaDocumentTypeId == null) {
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