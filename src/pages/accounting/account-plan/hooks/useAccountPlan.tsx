import type { AccountPlanUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useAccountPlanById,
  useAccountPlanMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useAccountPlanFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useAccountPlanById(editingId);
  const { createMut, updateMut } = useAccountPlanMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        accountCode: "",
        accountName: "",
        accountTypeId: 0,
        accountLevelId: 0,
        typeAnalysisId: 0,
        currencyId: 0,
        auxiliaryTypeId: 0,
        difereceChange: "",
        docControl: "",
        accountAmarreDebit: 0,
        accountAmarreCredit:0,
      };
    }
    return {
      accountPlanId: detail?.accountPlanId ?? editingId,
      accountCode: detail?.accountCode ?? "",
      accountName: detail?.accountName ?? "",
      accountTypeId: detail?.accountTypeId ?? 0,
      accountLevelId: detail?.accountLevelId ?? 0,
      typeAnalysisId: detail?.typeAnalysisId ?? 0,
      currencyId: detail?.currencyId ?? 0,
      auxiliaryTypeId: detail?.auxiliaryTypeId ?? 0,
      difereceChange: detail?.difereceChange ?? "",
      docControl: detail?.docControl ?? "",
      accountAmarreDebit: detail?.accountAmarreDebit ?? 0,
      accountAmarreCredit: detail?.accountAmarreCredit ?? 0,
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

  async function submit(dto: AccountPlanUpsertDto) {
    try {
      showLoading("Guardando plan de cuenta...");
      if (dto.accountPlanId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("plan de cuenta creada.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("plan de cuenta actualizada.");
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
