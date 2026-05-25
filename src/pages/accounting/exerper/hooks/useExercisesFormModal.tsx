import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { useMemo, useState } from "react";
import { useExercisesMutations } from "../mutations/useExerPer";
import type { ExercisesUpsertDto } from "@/application/dtos/accounting/exerper/ExerPer.dto";
import { useExercisesById } from "@/sharedKernel/hooks/accounting/useExerPer";

export function useExercisesFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data: detail, isFetching } = useExercisesById(editingId);
  const { createMut, updateMut } = useExercisesMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        description: "",
        endDate: "", 
      };
    }
    return {
      exercisesId: detail?.exercisesId ?? editingId,
      description: detail?.description ?? "",
      endDate: detail?.endDate ?? "", 
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

  async function submit(dto: ExercisesUpsertDto) {
    try {
      showLoading("Guardando Ejercicio...");
      if (dto.exercisesId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Ejercicio creado.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Ejercicio actualizado.");
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