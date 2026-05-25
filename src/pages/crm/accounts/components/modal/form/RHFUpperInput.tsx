import { UpperInput } from "@/layouts";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  transform?: (v: string) => string;
};

export function RHFUpperInput<T extends FieldValues>({
  control,
  name,
  label,
  required,
  placeholder,
  autoFocus,
  inputMode,
  transform,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            {label}{" "}
            {required && <small className="text-xs text-rose-600">*</small>}
          </label>

          <UpperInput
            id={String(name)}
            autoFocus={autoFocus}
            value={(field.value as string) ?? ""}
            onValueChange={(v: string) =>
              field.onChange(transform ? transform(v) : v)
            }
            onBlur={field.onBlur}
            placeholder={placeholder}
            inputMode={inputMode}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            autoComplete="off"
          />

          {fieldState.error && (
            <p className="text-xs text-rose-600">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
