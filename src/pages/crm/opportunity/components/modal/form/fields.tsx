import { UpperInput } from "@/layouts";
import { cn } from "@/sharedKernel";
import { useEffect, useState, type ReactNode } from "react"; // Importación necesaria
import {
  Controller,
  type Control,
  type FieldError,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  fromInputDate,
  toInputDate,
} from "../../detail/modal/form/dateHelpers";

/* ---------------- helpers ---------------- */
const errorText = (e?: FieldError) => {
  if (!e) return undefined;
  if (e.message) {
    const m = String(e.message);
    return m.toLowerCase() === "required" ? "Campo requerido" : m;
  }
  // cuando RHF solo pone el tipo
  if (e.type === "required") return "Campo requerido";
  return undefined;
};

export const probOptions = Array.from({ length: 10 }, (_, i) => {
  const v = (i + 1) * 10;
  return { value: v, label: `${v}%` };
});

/* --------------- tipos base --------------- */
type CommonProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  control: Control<TFieldValues, any, TFieldValues>;
  label: string | ReactNode; // Actualizado para aceptar JSX
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
};

/* --------------- RHFInput + UpperInput --------------- */
export function RHFInput<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  disabled,
  className,
  labelClassName,
  inputClassName,
  ...rest
}: CommonProps<TFieldValues> & {
  placeholder?: string;
  mode?: "first" | "all" | "none";
}) {
  const { placeholder, mode = "first" } = rest as any;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        className={cn("text-[11px] font-medium text-gray-600", labelClassName)}
        htmlFor={String(name)}
      >
        {label}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <UpperInput
              id={String(name)}
              disabled={disabled}
              mode={mode}
              value={(field.value as string) ?? ""}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={placeholder}
              className={cn(
                "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm",
                disabled && "bg-gray-100 text-gray-500 cursor-not-allowed",
                inputClassName,
              )}
            />
            {errorText(fieldState.error) && (
              <p
                id={`${String(name)}-error`}
                className="mt-1 text-xs text-red-600"
              >
                {errorText(fieldState.error)}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}

/* --------------- RHFNumber (sin negativos) --------------- */
type RHFNumberInputProps = {
  value: unknown;
  onChange: (value: number | undefined) => void;
  onBlur: () => void;
  disabled?: boolean;
  step: number;
  min: number;
  className?: string;
};

function RHFNumberInput({
  value,
  onChange,
  onBlur,
  disabled,
  step,
  min,
  className,
}: RHFNumberInputProps) {
  const [draft, setDraft] = useState(value == null ? "" : String(value));

  useEffect(() => {
    setDraft(value == null ? "" : String(value));
  }, [value]);

  return (
    <input
      type="number"
      step={step}
      min={min}
      value={draft}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);

        if (raw === "") {
          onChange(undefined);
          return;
        }

        const num = Number(raw);
        if (Number.isFinite(num) && num >= min) {
          onChange(num);
        }
      }}
      onBlur={() => {
        setDraft(value == null ? "" : String(value));
        onBlur();
      }}
      disabled={disabled}
      className={className}
    />
  );
}

export function RHFNumber<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  disabled,
  className,
  labelClassName,
  inputClassName,
  step = 1,
  min = 0,
}: CommonProps<TFieldValues> & { step?: number; min?: number }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        className={cn("text-[11px] font-medium text-gray-600", labelClassName)}
      >
        {label}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <RHFNumberInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={disabled}
              step={step}
              min={min}
              className={cn(
                "w-full rounded-xl border bg-white px-3 py-2 text-sm text-right focus:outline-none focus:ring-1",
                fieldState?.error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:ring-gray-300",
                disabled && "bg-gray-100 text-gray-500 cursor-not-allowed",
                inputClassName,
              )}
            />
            {errorText(fieldState.error) && (
              <p
                id={`${String(name)}-error`}
                className="mt-1 text-xs text-red-600"
              >
                {errorText(fieldState.error)}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}

/* --------------- RHFDate --------------- */
type RHFDateProps<TFieldValues extends FieldValues> =
  CommonProps<TFieldValues> & {
    onAfterChange?: () => void;
  };

export function RHFDate<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  disabled,
  className,
  labelClassName,
  inputClassName,
  onAfterChange,
}: RHFDateProps<TFieldValues>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        className={cn("text-[11px] font-medium text-gray-600", labelClassName)}
      >
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <input
              type="date"
              value={toInputDate(field.value)}
              onChange={(e) => {
                const v = fromInputDate(e.target.value);
                field.onChange(v);
                onAfterChange?.();
              }}
              onBlur={field.onBlur}
              className={cn(
                "w-full rounded-xl bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors",
                fieldState?.error
                  ? "border border-red-500 focus:ring-red-500"
                  : "border border-gray-200 focus:ring-gray-300",
                disabled && "bg-gray-100 text-gray-500 cursor-not-allowed",
                inputClassName,
              )}
              disabled={disabled}
            />
            {errorText(fieldState.error) && (
              <p
                id={`${String(name)}-error`}
                className="mt-1 text-xs text-red-600"
              >
                {errorText(fieldState.error)}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}

function toDatetimeLocal(v?: string | Date | null) {
  if (!v) return "";
  const d = typeof v === "string" ? new Date(v) : v;
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function RHFDateTime<T extends FieldValues>({
  name,
  control,
  label,
  disabled,
  className,
  labelClassName,
  inputClassName,
}: CommonProps<T>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        className={cn("text-[11px] font-medium text-gray-600", labelClassName)}
      >
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <input
              type="datetime-local"
              value={toDatetimeLocal(field.value)}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              className={cn(
                "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300",
                inputClassName,
              )}
              step={60} // opcional: de minuto en minuto
              disabled={disabled}
            />
            {errorText(fieldState.error) && (
              <p className="mt-1 text-xs text-red-600">
                {errorText(fieldState.error)}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}
/* --------------- RHFTextarea --------------- */
export function RHFTextarea<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  disabled,
  className,
  labelClassName,
  inputClassName,
  placeholder,
  rows = 3,
  maxLength,
  showCount = false,
}: CommonProps<TFieldValues> & {
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        className={cn("text-[11px] font-medium text-gray-600", labelClassName)}
      >
        {label}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const currentLength = field.value?.length ?? 0;
          const showCounter = showCount && maxLength;

          return (
            <div className="relative">
              <textarea
                {...field}
                rows={rows}
                maxLength={maxLength}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-gray-300",
                  disabled && "bg-gray-100 text-gray-500 cursor-not-allowed",
                  inputClassName,
                )}
              />
              {showCounter && (
                <span
                  className={cn(
                    "absolute right-3 bottom-2 text-[11px]",
                    currentLength > (maxLength as number) * 0.9
                      ? "text-red-500"
                      : "text-gray-400",
                  )}
                >
                  {currentLength}/{maxLength}
                </span>
              )}
              {errorText(fieldState.error) && (
                <p
                  id={`${String(name)}-error`}
                  className="mt-1 text-xs text-red-600"
                >
                  {errorText(fieldState.error)}
                </p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}

/* --------------- RHFSelectNumber (10 → 100, etc.) --------------- */
type NumberOption = { value: number; label: string };

export function RHFSelectNumber<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  required,
  disabled,
  className,
  labelClassName,
  selectClassName,
}: CommonProps<TFieldValues> & {
  options: NumberOption[];
  required?: boolean;
  selectClassName?: string;
}) {
  const rules = required ? { required: "Campo requerido" } : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        className={cn("text-[11px] font-medium text-gray-600", labelClassName)}
        htmlFor={String(name)}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            <select
              id={String(name)}
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
              onBlur={field.onBlur}
              disabled={disabled}
              className={cn(
                "w-full rounded-xl bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1",
                fieldState.error
                  ? "border border-red-500 focus:ring-red-500"
                  : "border border-gray-200 focus:ring-gray-300",
                selectClassName,
              )}
              aria-invalid={!!fieldState.error}
            >
              <option value="">Seleccione…</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errorText(fieldState.error) && (
              <p className="mt-1 text-xs text-red-600">
                {errorText(fieldState.error)}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}
