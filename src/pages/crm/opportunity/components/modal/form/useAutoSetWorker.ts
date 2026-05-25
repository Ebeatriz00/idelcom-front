import { useEffect } from "react";
import type {
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
} from "react-hook-form";

export function useAutoSetWorker<TFormValues extends FieldValues>({
  canUseSellerOption,
  workerId,
  setValue,
  fieldName,
}: {
  canUseSellerOption: boolean;
  workerId?: string | number | null;
  setValue: UseFormSetValue<TFormValues>;
  fieldName?: Path<TFormValues>;
}) {
  useEffect(() => {
    if (!canUseSellerOption && workerId != null) {
      const name = fieldName ?? ("workerId" as Path<TFormValues>);

      setValue(name, Number(workerId) as PathValue<TFormValues, typeof name>, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [canUseSellerOption, workerId, setValue, fieldName]);
}
