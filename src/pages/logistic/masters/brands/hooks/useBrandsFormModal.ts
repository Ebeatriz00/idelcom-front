import type { BrandsUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  useBrandsById,
  useBrandsMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useBrandsFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useBrandsById(editingId);
  const { createMut, updateMut } = useBrandsMutations();

  const defaultValues = useMemo(() => {
    if (!editingId) {
      const base: Partial<BrandsUpsertDto> = {
        brandsId: undefined,
        description: "",
      };
      return base;
    }
    const d = detail ?? ({} as any);
    return {
      brandsId: d.brandsId,
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

  async function submit(dto: BrandsUpsertDto) {
    try {
      if (dto.brandsId == null) {
        await createMut.mutateAsync(dto);
      } else {
        await updateMut.mutateAsync(dto);
      }
      close();
    } catch (err) {
      showApiError(err, "No se pudo guardar la marca.");
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
