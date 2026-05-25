import { useState, useMemo } from "react";
import {
  showLoading,
  showSuccess,
  showApiError,
  closeAlert,
} from "@/sharedKernel";
import {
  useUomById,
  useUomMutations,
} from "@/sharedKernel/hooks/general/useUom"; 
import type { UomUpsertDto } from "@/application"; 

export function useUomFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useUomById(editingId);
  const { createMut, updateMut } = useUomMutations();


  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: "",
        codeSunat: "",
        symbol: "",
      };
    }
    return {
      uomId: detail?.uomId ?? editingId,
      description: detail?.description ?? "",
      codeSunat: detail?.codeSunat ?? "",
      symbol: detail?.symbol ?? "",
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

  async function submit(dto: UomUpsertDto) {
    try {
      showLoading("Guardando unidad de medida..."); 
      if (dto.uomId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Unidad de medida creada."); 
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Unidad de medida actualizada."); 
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