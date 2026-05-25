import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { fromInputDate, toInputDate } from "./dataHelpers";

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
}: Props<T>) {
  return (
    <div className="col-span-full lg:col-span-4 min-w-0">
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            id={String(name)}
            type="date"
            value={toInputDate(field.value)}
            onChange={(e) => field.onChange(fromInputDate(e.target.value))}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />
        )}
      />
    </div>
  );
}
