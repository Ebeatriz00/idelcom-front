import type { OptionItem } from "@/application";
import { SearchSelect } from "@/layouts";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  useOptions: any; // tu hook type, si quieres lo tipamos fino luego
  value: OptionItem | null;
  onChangeValue: (opt: OptionItem | null) => void;
  placeholder?: string;
  pageSize?: number;
  minSearchChars?: number;
  disabled?: boolean;
};

export function RHFSearchSelect<T extends FieldValues>({
  control,
  name,
  label,
  required,
  useOptions,
  value,
  onChangeValue,
  placeholder,
  pageSize = 100,
  minSearchChars = 1,
  disabled,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ fieldState }) => (
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            {label} {required && <small className="text-xs text-rose-600">*</small>}
          </label>

          <SearchSelect
            useOptions={useOptions}
            value={value}
            onChange={onChangeValue}
            placeholder={placeholder}
            pageSize={pageSize}
            minSearchChars={minSearchChars}
            className="w-full min-w-0"
            disabled={disabled}
          />

          {fieldState.error && <p className="text-xs text-rose-600">{fieldState.error.message}</p>}
        </div>
      )}
    />
  );
}
