import type { OptionItem } from "@/application";
import { SearchSelect } from "@/layouts";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  useOptions: (...args: any[]) => any;
  items?: OptionItem[];
  valueId?: number;
  valueLabel?: string;
  disabled?: boolean;
  onChangeId?: (id?: number) => void;
  placeholder?: string;
};

export function RHFSearchSelect<T extends FieldValues>({
  name,
  control,
  label,
  useOptions,
  items = [],
  valueLabel,
  disabled,
  onChangeId,
  placeholder,
}: Props<T>) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
       <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange }, fieldState }) => (
          <>
            <SearchSelect
              useOptions={useOptions}
              value={
                items.find((o) => Number(o.value) === value) ??
                (value != null
                  ? { value, label: valueLabel ?? `ID ${value}` }
                  : null)
              }
              onChange={(opt) => {
                const newVal = opt ? Number(opt.value) : undefined;
                onChange(newVal);
                onChangeId?.(newVal);
              }}
              placeholder={placeholder}
              pageSize={10}
              minSearchChars={0}
              className="w-full min-w-0"
              disabled={disabled}
            />
            {fieldState.error && (
              <p className="text-xs text-rose-600 mt-1">
                {fieldState.error.message}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}
