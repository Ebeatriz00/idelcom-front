import type { AccountUpsertDto } from "@/application";

import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useAccountById,
  useAccountMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useAccountFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useAccountById(editingId);
  const { createMut, updateMut } = useAccountMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: "",
        currencyId: 0,
        bankId: 0,
        accountPlanId: 0,
      };
    }
    return {
      accountId: detail?.accountId ?? editingId,
      description: detail?.description ?? "",
      currencyId: detail?.currencyId ?? 0,
      bankId: detail?.bankId ?? 0,
      accountPlanId: detail?.accountPlanId ?? 0,
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

  async function submit(dto: AccountUpsertDto) {
    try {
      showLoading("Guardando cuenta...");
      if (dto.accountId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Cuenta creada.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Cuenta actualizada.");
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
    detail,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  };
}