import type { CategoriesUpsertDto } from "@/application";
import { closeAlert, showApiError } from "@/sharedKernel";
import {
  useCategoriesById,
  useCategoriesMutations,
} from "@/sharedKernel/hooks/logistic/masters/useCategories";
import { useMemo, useState } from "react";

export function useCategoriesFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useCategoriesById(editingId);
  const { createMut, updateMut } = useCategoriesMutations();

  const defaultValues = useMemo(() => {
    if (!editingId) {
      const base: Partial<CategoriesUpsertDto> = {
        categoriesId: undefined,
        description: "",
      };
      return base;
    }
    const d = detail ?? ({} as any);
    return {
      categoriesId: d.categoriesId,
      description: d.description ?? "",
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

  async function submit(dto: CategoriesUpsertDto) {
    try {
      if (dto.categoriesId == null) {
        await createMut.mutateAsync(dto);
      } else {
        await updateMut.mutateAsync(dto);
      }
      close();
    } catch (err) {
      showApiError(err, "No se pudo guardar la categoría.");
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
