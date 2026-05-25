import type {
  ProductTypesResponseDto,
  ProductTypesUpsertDto,
} from "@/application";
import { closeAlert, showApiError } from "@/sharedKernel";
import {
  useProductTypesById,
  useProductTypesMutations,
} from "@/sharedKernel/hooks/logistic/masters/useProductTypes";
import { useMemo, useState } from "react";

export function useProductTypesFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedProductType, setSelectedProductType] =
    useState<ProductTypesResponseDto | null>(null);

  const { data: detail, isFetching } = useProductTypesById(editingId);
  const { createMut, updateMut } = useProductTypesMutations();

  const defaultValues: Partial<ProductTypesUpsertDto> = useMemo(() => {
    const source = detail || selectedProductType;
    if (editingId != null && source) {
      return {
        productTypesId: source.productTypesId,
        description: source.description ?? "",
        isConsumable: source.isConsumable,
        isReturnable: source.isReturnable,
        requiresSerial: source.requiresSerial,
      };
    }
    return { description: "" };
  }, [editingId, detail, selectedProductType]);

  function openCreate() {
    setEditingId(null);
    setSelectedProductType(null);
    setOpen(true);
  }

  function openEdit(productType: ProductTypesResponseDto) {
    setEditingId(productType.productTypesId);
    setSelectedProductType(productType);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
    setSelectedProductType(null);
  }

  async function submit(dto: ProductTypesUpsertDto) {
    try {
      if (dto.productTypesId == null) {
        await createMut.mutateAsync(dto);
      } else {
        await updateMut.mutateAsync(dto);
      }
      close();
    } catch (err) {
      showApiError(err, "No se pudo guardar el tipo de producto.");
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
