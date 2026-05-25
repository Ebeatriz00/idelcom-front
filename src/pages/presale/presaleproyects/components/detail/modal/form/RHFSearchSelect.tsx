import type { OptionItem } from "@/application";
import { SearchSelect } from "@/layouts";
import { cn } from "@/sharedKernel"; 
import { useMemo } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

const toNum = (v: unknown) => (v == null || v === "" ? undefined : Number(v));

function pickOption(
  opts: OptionItem[],
  value?: number,
  fallbackLabel?: string
): OptionItem | null {
  if (value == null) return null;
  const found = opts.find((o) => toNum(o.value) === value);
  return found ?? { value, label: fallbackLabel ?? `ID ${value}` };
}

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T, any, T>;
  label: string;
  options: OptionItem[];
  placeholder?: string;
  fallbackLabel?: string;
  className?: string;
  labelClassName?: string;
  required?: boolean;
  disabled?: boolean;
  rules?: Parameters<typeof Controller<T>>[0]["rules"];
  
  onChangeCallback?: (newValue?: number) => void; 
};

export function RHFSearchSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = "Seleccione…",
  fallbackLabel,
  required,
  disabled,
  rules,
  className = "w-full min-w-0",
  labelClassName,
  onChangeCallback, 
}: Props<T>) {
  const finalRules =
    required && !rules
      ? { required: "Campo requerido" }
      : { ...rules, ...(required ? { required: "Campo requerido" } : {}) };

  return (
    <div className="col-span-full lg:col-span-12 min-w-0">
      <label
        className={cn(
          "mb-1 block text-xs font-medium text-gray-600",
          labelClassName
        )}
        htmlFor={String(name)}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        rules={finalRules}
        render={({ field: { value, onChange }, fieldState }) => {
          const selected = useMemo(
            () =>
              pickOption(options, value as number | undefined, fallbackLabel),
            [options, value, fallbackLabel]
          );

          return (
            <>
              <SearchSelect
                useOptions={() => ({ data: { items: options } } as any)}
                value={selected}
                onChange={(opt: OptionItem | null) => {
                  const newVal = opt ? toNum(opt.value) : undefined;
                  onChange(newVal); 
                  if (onChangeCallback) onChangeCallback(newVal);
                }}
                placeholder={placeholder}
                pageSize={10}
                minSearchChars={0}
                className={className}
                disabled={disabled}
                aria-invalid={!!fieldState.error}
                aria-errormessage={
                  fieldState.error ? `${String(name)}-error` : undefined
                }
              />
              {(() => {
                const e = fieldState.error;
                let msg = e?.message as string | undefined;
                if (!msg && e?.type === "required") msg = "Campo requerido";
                if (msg?.toLowerCase() === "required") msg = "Campo requerido";
                return msg ? (
                  <p
                    id={`${String(name)}-error`}
                    className="mt-1 text-xs text-red-600"
                  >
                    {msg}
                  </p>
                ) : null;
              })()}
            </>
          );
        }}
      />
    </div>
  );
}