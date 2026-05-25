import { UpperInput } from "@/layouts/presentation/inputs/input";
import type { LucideIcon } from "lucide-react";
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
  className?: string;
  icon?: LucideIcon;
  optional?: boolean;
};

export function TextFieldRHF<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
  icon: Icon,
  optional,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={className}>
          <label className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-gray-700">
            <span>{label}</span>
            {optional ? (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                Opcional
              </span>
            ) : null}
          </label>

          <div className="relative">
            {Icon ? (
              <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            ) : null}
            <UpperInput
              value={(field.value ?? "") as string}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={placeholder}
              className={`w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-gray-100 ${
                Icon ? "pl-9 pr-3" : "px-3"
              } ${fieldState.error ? "border-rose-300 focus:border-rose-300 focus:ring-rose-100" : ""}`}
            />
          </div>

          {fieldState.error && (
            <p className="mt-1 text-xs font-medium text-rose-600">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
