import type { OptionItem } from "@/application";
import { SearchSelect, type UseOptionsHook } from "@/layouts";
import { makeLocalUseOptions } from "@/sharedKernel/hooks/SelectOptions/makeLocalUseOptions";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import type {
  Control,
  FieldErrors,
  FieldPath,
  FieldPathValue,
  FieldValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Controller } from "react-hook-form";

const normalizeId = (value: unknown) => {
  const numberValue = typeof value === "string" ? Number(value) : Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : undefined;
};

function pickOption(
  options: OptionItem[],
  rawValue?: unknown,
  fallbackLabel?: string,
): OptionItem | null {
  const value = normalizeId(rawValue);
  if (!value) return null;

  const found = options.find((option) => Number(option.value) === value);
  return found ?? { value, label: fallbackLabel ?? `ID ${value}` };
}

type Props<T extends FieldValues> = {
  control: Control<T>;
  errors?: FieldErrors<T>;
  name: FieldPath<T>;
  labelName?: FieldPath<T>;
  label: string;
  items: OptionItem[];
  initialLabel?: string;
  placeholder?: string;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  icon?: LucideIcon;
  optional?: boolean;
  pageSize?: number;
  minSearchChars?: number;
  useOptions?: UseOptionsHook;
  onAfterChange?: (option: OptionItem | null) => void;
};

export function SearchSelectRHF<T extends FieldValues>({
  control,
  errors,
  name,
  labelName,
  label,
  items,
  initialLabel,
  placeholder = "Buscar...",
  watch,
  setValue,
  disabled,
  required,
  className = "w-full min-w-0",
  icon: Icon,
  optional,
  pageSize = 100,
  minSearchChars = 1,
  useOptions,
  onAfterChange,
}: Props<T>) {
  const useLocal = useMemo(() => makeLocalUseOptions(items), [items]);
  const currentLabelFromForm = labelName ? String(watch(labelName) ?? "") : undefined;
  const fieldError = errors?.[name];
  const message =
    typeof fieldError?.message === "string"
      ? fieldError.message
      : fieldError?.type === "required"
        ? "Campo requerido"
        : undefined;

  const finalUseOptions = useOptions ?? useLocal;

  return (
    <div className="min-w-0">
      <label className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-gray-700">
        <span>{label}</span>
        {optional ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            Opcional
          </span>
        ) : null}
      </label>

      <Controller
        name={name}
        control={control}
        rules={required ? { required: "Campo requerido" } : undefined}
        render={({ field: { value, onChange } }) => {
          const fallbackLabel = currentLabelFromForm || initialLabel;
          const selected = pickOption(items, value, fallbackLabel);

          return (
            <>
              <div className="relative">
                {Icon ? (
                  <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-gray-400" />
                ) : null}
                <SearchSelect
                  useOptions={finalUseOptions}
                  value={selected}
                  onChange={(option) => {
                    const id = normalizeId(option?.value);
                    onChange(id);

                    if (labelName) {
                      setValue(
                        labelName,
                        (option?.label ?? "") as FieldPathValue<T, typeof labelName>,
                        {
                          shouldDirty: true,
                          shouldValidate: false,
                        },
                      );
                    }

                    onAfterChange?.(option);
                  }}
                  placeholder={placeholder}
                  pageSize={pageSize}
                  minSearchChars={minSearchChars}
                  className={`${className} ${Icon ? "[&_input]:pl-9" : ""}`}
                  disabled={disabled}
                />
              </div>

              {message ? (
                <p className="mt-1 text-xs text-rose-600">{message}</p>
              ) : null}
            </>
          );
        }}
      />
    </div>
  );
}
