import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { useMemo, useState } from "react";
import { usePeriodsMutations } from "../mutations/useExerPer";
import type { PeriodsUpsertDto } from "@/application/dtos/accounting/exerper/ExerPer.dto";
import { usePeriodById } from "@/sharedKernel/hooks/accounting/useExerPer";


export function usePeriodsFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = usePeriodById(editingId);
  const { createMut, updateMut } = usePeriodsMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: "",
      };
    }
    return {
      periodsId: detail?.periodsId ?? editingId,
      description: detail?.description ?? "",
      endDate: detail?.endDate??"",
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

  async function submit(dto: PeriodsUpsertDto) {
    try {
      showLoading("Guardando Periodo...");
      if (dto.periodsId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Periodo creado.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Periodo actualizado.");
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