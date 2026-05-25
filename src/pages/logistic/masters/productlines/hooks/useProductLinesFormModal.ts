import type { ProductLinesUpsertDto } from "@/application";
import { closeAlert, showApiError } from "@/sharedKernel";
import {
  useProductLinesById,
  useProductLinesMutations,
} from "@/sharedKernel/hooks/logistic/masters/useProductLines";
import { useMemo, useState } from "react";

export function useProductLinesFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useProductLinesById(editingId);
  const { createMut, updateMut } = useProductLinesMutations();

  const defaultValues = useMemo(() => {
    if (!editingId) {
      const base: Partial<ProductLinesUpsertDto> = {
        description: "",
        categoriesId: undefined,
      };
      return base;
    }
    const d = detail ?? ({} as any);

    return {
      productLinesId: d.productLinesId,
      description: d.description ?? "",
      categoriesId: d.categoriesId,
    } as Partial<ProductLinesUpsertDto> & {
      categoriesLabel?: string;
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

  async function submit(dto: ProductLinesUpsertDto) {
    try {
      if (dto.productLinesId == null) {
        await createMut.mutateAsync(dto);
      } else {
        await updateMut.mutateAsync(dto);
      }
      close();
    } catch (err) {
      showApiError(err, "No se pudo guardar la línea de producto.");
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
