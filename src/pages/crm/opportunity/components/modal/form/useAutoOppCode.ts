// form/useAutoOppCode.ts
import { useEffect, useMemo } from "react";
import {
  useWatch,
  type Control,
  type FieldValues,
  type Path,
  type UseFormSetValue,
} from "react-hook-form";

function fmt(n?: number | null) {
  return n == null ? "" : `ID${n}`;
}

export function useAutoOppCode<TFieldValues extends FieldValues>({
  isEdit,
  nextCode,
  control,
  setValue,
}: {
  isEdit: boolean;
  nextCode?: string | number | null;
  control: Control<TFieldValues, any, TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
}) {
  const internal = useWatch<TFieldValues>({
    control,
    name: "opporNumInternal" as Path<TFieldValues>,
  }) as unknown as number | undefined;

  const number = useWatch<TFieldValues>({
    control,
    name: "opporNumber" as Path<TFieldValues>,
  }) as unknown as string | undefined;

  const nextCodeNum = useMemo(
    () => (nextCode == null ? undefined : Number(nextCode)),
    [nextCode]
  );
  useEffect(() => {
    if (isEdit) return;
    if (!nextCodeNum || Number.isNaN(nextCodeNum)) return;

    const internalIsEmpty = internal == null || internal === 0;
    const numberIsEmpty = !number || number.trim() === "";

    if (!(internalIsEmpty && numberIsEmpty)) return;

    setValue("opporNumInternal" as Path<TFieldValues>, nextCodeNum as any, {
      shouldValidate: true,
    });
    setValue("opporNumber" as Path<TFieldValues>, fmt(nextCodeNum) as any, {
      shouldValidate: true,
    });
  }, [isEdit, nextCodeNum, internal, number, setValue]);

  useEffect(() => {
    if (internal == null || internal === 0) return;

    const desired = fmt(internal);
    if (number === desired) return;

    setValue("opporNumber" as Path<TFieldValues>, desired as any, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [internal, number, setValue]);
}
