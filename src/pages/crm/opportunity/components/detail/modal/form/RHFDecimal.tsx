import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder: string;
  max: number;
  decimals?: number;
  required?: boolean;
  disabled?: boolean;
};

function clampDecimal(
  next: string | ((prev: string) => string),
  current: string,
  max: number,
  decimals: number
) {
  let val = typeof next === "function" ? next(current) : next ?? "";

  val = val.replace(/[^0-9.]/g, "");

  const parts = val.split(".");
  if (parts.length > 2) {
    val = parts[0] + "." + parts.slice(1).join("");
  }

  if (parts[1]?.length > decimals) {
    parts[1] = parts[1].slice(0, decimals);
    val = parts.join(".");
  }

  return val.slice(0, max);
}

export function RHFDecimal<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  max,
  decimals = 2,
  required = false,
  disabled = false,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const value =
          field.value !== undefined && field.value !== null
            ? String(field.value)
            : "";

        return (
          <div className="col-span-6 lg:col-span-6 min-w-0">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              {label} {required && <span className="text-rose-600">*</span>}
            </label>

            <input
              id={String(name)}
              name={field.name}
              type="text"
              value={value}
              onChange={(e) =>
                !disabled &&
                field.onChange(
                  clampDecimal(e.target.value, value, max, decimals)
                )
              }
              disabled={disabled}
              placeholder={placeholder}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className={`w-full rounded-xl border px-3 py-2 text-sm ${
                disabled
                  ? "border-gray-200 bg-gray-100 text-gray-400"
                  : "border-gray-200 bg-gray-50"
              }`}
            />

            {fieldState.error && (
              <p className="mt-1 text-[11px] leading-tight text-rose-600">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}