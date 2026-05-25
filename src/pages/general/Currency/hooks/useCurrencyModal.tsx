import { useState, useMemo } from "react";
import {
  showLoading,
  showSuccess,
  showApiError,
  closeAlert,
} from "@/sharedKernel";
import {
  useCurrencyById,
  useCurrencyMutations,
} from "@/sharedKernel/hooks/general/useCurrency";
import type { CurrencyUpsertDto } from "@/application";

export function useCurrencyFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useCurrencyById(editingId);
  const { createMut, updateMut } = useCurrencyMutations();

  // --- INICIO DEL CAMBIO ---
  const defaultValues = useMemo(() => {
    // Para 'Crear Nuevo', usa los nombres genéricos
    if (!editingId || !detail) {
      return {
        description: "",
        code: "",
        codeSunat: "",
        symbol: "",
      };
    }
    // Para 'Editar', lee y asigna los nombres genéricos
    return {
      currencyId: detail?.currencyId ?? editingId,
      description: detail?.description ?? "",
      code: detail?.code ?? "",
      codeSunat: detail?.codeSunat ?? "",
      symbol: detail?.symbol ?? "",
    };
  }, [editingId, detail]);
  // --- FIN DEL CAMBIO ---

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

  async function submit(dto: CurrencyUpsertDto) {
    try {
      showLoading("Guardando moneda...");
      if (dto.currencyId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Moneda creada.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Moneda actualizada.");
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