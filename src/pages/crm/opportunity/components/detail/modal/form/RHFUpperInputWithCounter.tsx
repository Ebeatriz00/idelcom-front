import { UpperInput } from "@/layouts";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

const clamp = (
  next: string | ((prev: string) => string),
  current: string,
  max: number
) => {
  const val = typeof next === "function" ? next(current) : next ?? "";
  return val.slice(0, max);
};

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder: string;
  max: number;
  required?: boolean;
};

export function RHFUpperInputWithCounter<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  max,
  required = false,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="col-span-full lg:col-span-12 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            {label} {required && <span className="text-rose-600">*</span>}
          </label>

          <UpperInput
            id={String(name)}
            mode="first"
            value={(field.value as string) ?? ""}
            onValueChange={(v) =>
              field.onChange(clamp(v, (field.value as string) ?? "", max))
            }
            placeholder={placeholder}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />

          <div className="mt-1 flex justify-between text-[11px] leading-tight">
            {fieldState.error ? (
              <p className="text-rose-600">{fieldState.error.message}</p>
            ) : (
              <span className="text-gray-400">
                {(field.value as string)?.length ?? 0}/{max}
              </span>
            )}
          </div>
        </div>
      )}
    />
  );
}
