import type { PaymentTypeUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  usePaymentTypeById,
  usePaymentTypeMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function usePaymentTypeFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = usePaymentTypeById(editingId);
  const { createMut, updateMut } = usePaymentTypeMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: "",
        code: "",
      };
    }
    return {
      paymentTypeId: detail?.paymentTypeId ?? editingId,
      description: detail?.description ?? "",
      code: detail?.code ?? "",
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

  async function submit(dto: PaymentTypeUpsertDto) {
    try {
      showLoading("Guardando tipo pago...");
      if (dto.paymentTypeId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("tipo pago creada.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("tipo pago actualizada.");
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
