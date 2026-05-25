import { useEffect, useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";
import type { ProductsUpsertFormValues } from "./products.schema";

type ProductCatalogRulesArgs = {
  control: Control<ProductsUpsertFormValues>;
  setValue: UseFormSetValue<ProductsUpsertFormValues>;
};

export function useProductCatalogRules({
  control,
  setValue,
}: ProductCatalogRulesArgs) {
  const isServices = useWatch({ control, name: "isServices" });
  const isTool = useWatch({ control, name: "isTool" });
  const isStockable = useWatch({ control, name: "isStockable" });
  const manageLots = useWatch({ control, name: "manageLots" });

  useEffect(() => {
    if (!isServices) return;

    setValue("isStockable", false, { shouldValidate: true });
    setValue("manageLots", false, { shouldValidate: true });
    setValue("manegesSerials", false, { shouldValidate: true });
    setValue("expirationControl", false, { shouldValidate: true });
    setValue("stockMin", undefined, { shouldValidate: true });
    setValue("stockMax", undefined, { shouldValidate: true });
    setValue("weight", undefined, { shouldValidate: true });
    setValue("volume", undefined, { shouldValidate: true });
  }, [isServices, setValue]);

  useEffect(() => {
    if (!isTool) return;

    setValue("isServices", false, { shouldValidate: true });
    setValue("isStockable", true, { shouldValidate: true });
    setValue("isReturnable", true, { shouldValidate: true });
    setValue("canSell", false, { shouldValidate: true });
  }, [isTool, setValue]);

  useEffect(() => {
    if (isStockable) return;

    setValue("stockMin", undefined, { shouldValidate: true });
    setValue("stockMax", undefined, { shouldValidate: true });
  }, [isStockable, setValue]);

  useEffect(() => {
    if (manageLots) return;

    setValue("expirationControl", false, { shouldValidate: true });
  }, [manageLots, setValue]);

  return useMemo(
    () => ({
      isServices,
      isTool,
      isStockable,
      manageLots,
      disabled: {
        isStockable: isServices || isTool,
        manageLots: isServices,
        manegesSerials: isServices,
        expirationControl: isServices || !manageLots,
        isReturnable: isTool,
        canSell: isTool,
        stockRange: !isStockable,
        logisticsSize: isServices,
      },
    }),
    [isServices, isTool, isStockable, manageLots],
  );
}
