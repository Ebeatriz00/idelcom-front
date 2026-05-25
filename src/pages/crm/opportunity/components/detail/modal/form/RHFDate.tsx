import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { fromInputDate, toInputDate } from "./dateHelpers";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  min?: string | Date;
  max?: string | Date;
};

export function RHFDate<T extends FieldValues>({
  name,
  control,
  label,
  required, 
}: Props<T>) {
  return (
    <div className="col-span-full lg:col-span-4 min-w-0">
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
        {required && <span className="ml-1 text-rose-600">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <input
              id={String(name)}
              type="date"
              value={toInputDate(field.value)}
              onChange={(e) => field.onChange(fromInputDate(e.target.value))}
              className={`w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm ${
                fieldState.error ? "border-rose-500" : "border-gray-200"
              }`}
            />
            
            {fieldState.error && (
              <p className="mt-1 text-xs text-rose-600">
                {fieldState.error.message}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}
