import type { ExchangeRateUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import {
  useExchangeRateById,
  useExchangeRateMutations,
} from "@/sharedKernel/hooks/general/useExchangeRate";
import { useMemo, useState } from "react";

export function useExchangeRateFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useExchangeRateById(editingId);
  const { createMut, updateMut } = useExchangeRateMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        purchaseType: 0,
        saleType: 0,
        dateFxrate: "",
      };
    }
    return {
      exchangeRateId: detail?.exchangeRateId ?? editingId,
      purchaseType: detail?.purchaseType ?? 0,
      saleType: detail?.saleType ?? 0,
      dateFxrate: detail?.dateFxrate ? detail.dateFxrate.split("T")[0] : "",
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

  async function submit(dto: ExchangeRateUpsertDto) {
    try {
      showLoading("Guardando tipo de cambio...");
      if (dto.exchangeRateId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Tipo de cambio creado.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Tipo de cambio actualizado.");
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
    title: editingId ? "Editar Tipo de Cambio" : "Nuevo Tipo de Cambio",
  };
}
