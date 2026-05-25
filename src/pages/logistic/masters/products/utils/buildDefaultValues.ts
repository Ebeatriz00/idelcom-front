import type { ProductsUpsertFormValues } from "./products.schema";

export const buildDefaultValues = (
  defaultValues?: Partial<ProductsUpsertFormValues>,
): ProductsUpsertFormValues => ({
  productsId: defaultValues?.productsId ?? undefined,

  sku: defaultValues?.sku ?? "",
  barcode: defaultValues?.barcode ?? "",
  partNum: defaultValues?.partNum ?? "",

  description: defaultValues?.description ?? "",
  shortDescription: defaultValues?.shortDescription ?? "",

  productTypeId: defaultValues?.productTypeId ?? undefined,
  productLinesId: defaultValues?.productLinesId ?? undefined,
  categoriesId: defaultValues?.categoriesId ?? undefined,
  brandsId: defaultValues?.brandsId ?? undefined,
  uomId: defaultValues?.uomId ?? undefined,

  stockMin: defaultValues?.stockMin ?? 0,
  stockMax: defaultValues?.stockMax ?? 0,
  conversionFactor: defaultValues?.conversionFactor ?? 0,

  isActive: defaultValues?.isActive ?? true,
  isStockable: defaultValues?.isStockable ?? true,
  isServices: defaultValues?.isServices ?? false,
  isReturnable: defaultValues?.isReturnable ?? false,
  isTool: defaultValues?.isTool ?? false,

  canBuy: defaultValues?.canBuy ?? true,
  canSell: defaultValues?.canSell ?? false,

  manageLots: defaultValues?.manageLots ?? false,
  manegesSerials: defaultValues?.manegesSerials ?? false,
  expirationControl: defaultValues?.expirationControl ?? false,

  weight: defaultValues?.weight ?? 0,
  volume: defaultValues?.volume ?? 0,

  files: defaultValues?.files ?? [],
});
