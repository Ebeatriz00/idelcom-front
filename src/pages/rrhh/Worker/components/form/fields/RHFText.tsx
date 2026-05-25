import { UpperInput } from "@/layouts/presentation/inputs/input";
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
  placeholder?: string;
  className?: string;
  error?: string;
};

export function RHFText<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  className,
}: Props<T>) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <UpperInput
              id={String(name)}
              value={field.value ?? ""}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={placeholder}
              className={
                className ??
                "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              }
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
