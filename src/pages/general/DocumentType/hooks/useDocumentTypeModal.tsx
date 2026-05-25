import { useState, useMemo } from "react";
import {
  showLoading,
  showSuccess,
  showApiError,
  closeAlert,
} from "@/sharedKernel";
import { useDocumentTypeById, useDocumentTypeMutations } from "@/sharedKernel/hooks/general/useDocumentType";

export function useDocumentTypeFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useDocumentTypeById(editingId);
  const { createMut, updateMut } = useDocumentTypeMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return { description: "", codeSunat: "" };
    }
    return {
      documentTypeId: detail?.documentTypeId ?? editingId,
      description: detail?.description ?? "",
      codeSunat: detail?.codeSunat ?? "",
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
    documentTypeId?: number;
    description: string;
    codeSunat: string;
  }) {


    try {
      showLoading("Guardando tipo de documento..."); 
      if (dto.documentTypeId == null) {
        await createMut.mutateAsync({ description: dto.description, codeSunat: dto.codeSunat });
        showSuccess("Tipo de documento creado."); 
      } else {
        await updateMut.mutateAsync({
          documentTypeId: dto.documentTypeId,
          description: dto.description,
          codeSunat: dto.codeSunat,
        });
        showSuccess("Tipo de documento actualizado.");
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