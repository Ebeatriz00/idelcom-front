import type { CommercialParametersUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  useCommercialParametersById,
  useCommercialParametersMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useCommercialParametersFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useCommercialParametersById(editingId);
  const { createMut, updateMut } = useCommercialParametersMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        parametersName: "",
        parametersValue: 0,
        minValue: undefined,
      };
    }
    return {
      commercialParametersId: detail?.commercialParametersId ?? editingId,
      parametersName: detail?.parametersName ?? "",
      parametersValue: detail?.parametersValue,
      minValue: detail?.minValue,
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

  async function submit(dto: CommercialParametersUpsertDto) {
    try {
      if (dto.commercialParametersId == null) {
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
