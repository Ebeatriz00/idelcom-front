import { UpperInput } from "@/layouts";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  autoFocus?: boolean;
  requiredMark?: boolean;
};

export function TextFieldRHF<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  autoFocus,
  requiredMark,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            {label}{" "}
            {requiredMark && <small className="text-xs text-rose-600">*</small>}
          </label>

          <UpperInput
            id={String(name)}
            value={(field.value ?? "") as string}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            autoFocus={autoFocus}
            placeholder={placeholder}
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
