import type { ProductsUpsertDto } from "@/application";
import { closeAlert, showApiError } from "@/sharedKernel";
import {
  useProductsById,
  useProductsMutations,
} from "@/sharedKernel/hooks/logistic/masters/useProducts";
import { useMemo, useState } from "react";
import type { ProductsUpsertFormValues } from "../utils/products.schema";

function requiredNumber(value: number | undefined): number {
  if (value === undefined) {
    throw new Error("Falta completar un campo obligatorio del producto.");
  }
  return value;
}

function toProductsUpsertDto(values: ProductsUpsertFormValues): ProductsUpsertDto {
  const { files, ...rest } = values;

  return {
    ...rest,
    productTypeId: requiredNumber(values.productTypeId),
    productLinesId: requiredNumber(values.productLinesId),
    categoriesId: requiredNumber(values.categoriesId),
    brandsId: requiredNumber(values.brandsId),
    uomId: requiredNumber(values.uomId),
    files: values.productsId ? "" : (files ?? []),
  };
}

export function useProductsFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useProductsById(editingId);
  const { createMut, updateMut } = useProductsMutations();

  const defaultValues = useMemo(() => {
    if (!editingId) {
      const base: Partial<ProductsUpsertFormValues> = {
        sku: "",
        barcode: "",
        partNum: "",
        description: "",
        shortDescription: "",
        productTypeId: undefined,
        productLinesId: undefined,
        categoriesId: undefined,
        brandsId: undefined,
        uomId: undefined,
        stockMin: undefined,
        stockMax: undefined,
        conversionFactor: undefined,
        isActive: true,
        isStockable: true,
        isServices: false,
        isReturnable: false,
        isTool: false,
        canBuy: true,
        canSell: true,
        manageLots: false,
        manegesSerials: false,
        expirationControl: false,
        weight: undefined,
        volume: undefined,
        files: [],
      };
      return base;
    }
    if (!detail) return undefined;

    const productDetail = detail as Partial<ProductsUpsertFormValues>;

    return {
      productsId: productDetail.productsId,
      sku: productDetail.sku ?? "",
      barcode: productDetail.barcode ?? "",
      partNum: productDetail.partNum ?? "",
      description: productDetail.description ?? "",
      shortDescription: productDetail.shortDescription ?? "",
      productTypeId: productDetail.productTypeId,
      productLinesId: productDetail.productLinesId,
      categoriesId: productDetail.categoriesId,
      brandsId: productDetail.brandsId,
      uomId: productDetail.uomId,
      stockMin: productDetail.stockMin,
      stockMax: productDetail.stockMax,
      conversionFactor: productDetail.conversionFactor,
      isActive: productDetail.isActive ?? true,
      isStockable: productDetail.isStockable ?? true,
      isServices: productDetail.isServices ?? false,
      isReturnable: productDetail.isReturnable ?? false,
      isTool: productDetail.isTool ?? false,
      canBuy: productDetail.canBuy ?? true,
      canSell: productDetail.canSell ?? true,
      manageLots: productDetail.manageLots ?? false,
      manegesSerials: productDetail.manegesSerials ?? false,
      expirationControl: productDetail.expirationControl ?? false,
      weight: productDetail.weight,
      volume: productDetail.volume,
      files: undefined,
    } satisfies Partial<ProductsUpsertFormValues>;
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

  async function submit(values: ProductsUpsertFormValues) {
    try {
      const dto = toProductsUpsertDto(values);
      if (dto.productsId == null) {
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
