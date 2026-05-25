import type { OptionItem } from "@/application";
import { SearchSelect } from "@/layouts";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { idToOption } from "./contacts.schema";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: OptionItem[];
  useOptions: any; // el hook que devuelve makeLocalUseOptions
  placeholder: string;
  fallbackLabel?: string;
  requiredMark?: boolean;
};

export function SearchSelectRHF<T extends FieldValues>({
  control,
  name,
  label,
  options,
  useOptions,
  placeholder,
  fallbackLabel,
  requiredMark,
}: Props<T>) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}{" "}
        {requiredMark && <small className="text-xs text-rose-600">*</small>}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange }, fieldState }) => (
          <>
            <SearchSelect
              useOptions={useOptions}
              value={
                options.find((o) => Number(o.value) === Number(value)) ??
                idToOption(Number(value), fallbackLabel ?? label)
              }
              onChange={(opt) => onChange(opt ? Number(opt.value) : undefined)}
              placeholder={placeholder}
              pageSize={100}
              minSearchChars={1}
              className="w-full min-w-0"
            />

            {fieldState.error && (
              <p className="text-xs text-rose-600">
                {fieldState.error.message}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}
