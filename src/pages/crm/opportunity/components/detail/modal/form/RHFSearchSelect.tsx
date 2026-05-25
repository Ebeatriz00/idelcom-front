import type { OptionItem } from "@/application";
import { SearchSelect } from "@/layouts";
import { cn } from "@/sharedKernel";
import { useMemo, type ReactNode } from "react";
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
  fallbackLabel?: string,
): OptionItem | null {
  if (value == null) return null;
  const found = opts.find((o) => toNum(o.value) === value);
  return found ?? { value, label: fallbackLabel ?? `ID ${value}` };
}

type UseOptionsPositional = (
  page?: number,
  search?: string,
  pageSize?: number,
  opts?: { enabled?: boolean },
) => any;

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T, any, T>;
  label: string | ReactNode;
  placeholder?: string;
  fallbackLabel?: string;
  className?: string;
  labelClassName?: string;
  required?: boolean;
  disabled?: boolean;
  rules?: Parameters<typeof Controller<T>>[0]["rules"];

  // ✅ usa esto cuando quieres backend
  useOptions?: UseOptionsPositional;

  // ✅ opcional: para casos locales (si quieres)
  options?: OptionItem[];
};

type AnyOpt = OptionItem & { __ghost?: boolean; disabled?: boolean };

function withGhostSelected(
  listOptions: AnyOpt[],
  selectedValue: number | undefined,
  fallbackLabel?: string,
) {
  if (!selectedValue) return { listOptions, labelOptions: listOptions };

  const existsInList = listOptions.some(
    (o) => Number(o.value) === Number(selectedValue),
  );
  if (existsInList) return { listOptions, labelOptions: listOptions };

  // si no existe, creamos uno fantasma SOLO para mostrar
  const ghost: AnyOpt = {
    value: selectedValue,
    label: fallbackLabel ?? '',
    __ghost: true,
    disabled: true,
  };

  return {
    listOptions,
    labelOptions: [ghost, ...listOptions], // para pickOption
  };
}

export function RHFSearchSelect<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Buscar...",
  fallbackLabel,
  required,
  disabled,
  rules,
  className = "w-full min-w-0",
  labelClassName,
  useOptions,
  options = [],
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
          labelClassName,
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
          const selectedValue = value as number | undefined;
          const { listOptions, labelOptions } = useMemo(() => {
            return withGhostSelected(
              options as any,
              selectedValue,
              fallbackLabel,
            );
          }, [options, selectedValue, fallbackLabel]);

          const selected = useMemo(
            () => pickOption(labelOptions as any, selectedValue, fallbackLabel),
            [labelOptions, selectedValue, fallbackLabel],
          );
          const useOptionsFinal = useOptions
            ? useOptions
            : (((page = 1, search = "", pageSize = 10) => {
                const term = (search ?? "").trim().toLowerCase();
                const filtered = !term
                  ? (listOptions as any)
                  : (listOptions as any).filter((o: any) =>
                      String(o.label ?? "")
                        .toLowerCase()
                        .includes(term),
                    );

                const start = Math.max(0, (page - 1) * pageSize);
                const items = filtered.slice(start, start + pageSize);
                const hasMore = start + pageSize < filtered.length;

                return {
                  data: { items },
                  isLoading: false,
                  isFetching: false,
                  hasMore,
                };
              }) as any);
          return (
            <>
              <SearchSelect
                useOptions={useOptionsFinal as any}
                value={selected}
                onChange={(opt) => onChange(opt ? toNum(opt.value) : undefined)}
                placeholder={placeholder}
                pageSize={100}
                minSearchChars={1}
                className={cn(
                  className,
                  fieldState.error &&
                    "border border-red-500 rounded-md focus:ring-1 focus:ring-red-500",
                )}
                disabled={disabled}
                aria-invalid={!!fieldState.error}
                aria-errormessage={
                  fieldState.error ? `${String(name)}-error` : undefined
                }
              />
              {fieldState.error?.message && (
                <p
                  id={`${String(name)}-error`}
                  className="mt-1 text-xs text-red-500"
                >
                  {fieldState.error.message}
                </p>
              )}
            </>
          );
        }}
      />
    </div>
  );
}
