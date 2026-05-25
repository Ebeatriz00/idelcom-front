import type { OptionItem } from "@/application";
import { SearchSelect, UpperInput } from "@/layouts";
import { cn } from "@/sharedKernel";
import { AlertCircle } from "lucide-react";
import { Controller } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { FieldLabel } from "./enterprise/FieldLabel";
import { FieldMessage } from "./enterprise/FieldMessage";
import type { BaseFieldProps, InputTransformMode } from "./enterprise/fieldTypes";
import { FormHelp } from "./enterprise/FormHelp";
import { FormSection } from "./enterprise/FormSection";
import {
  buildLocalUseOptions,
  pickOption,
  toNumberOptionValue,
} from "./enterprise/selectHelpers";

export { FormHelp, FormSection };

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  disabled,
  required,
  className,
  description,
  mode = "first",
}: BaseFieldProps<T> & {
  mode?: InputTransformMode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <FieldLabel label={label} required={required} />
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <div className="relative">
              <UpperInput
                id={String(name)}
                disabled={disabled}
                mode={mode}
                value={(field.value as string) ?? ""}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={placeholder}
                className={cn(
                  "h-10 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400",
                  "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
                  "hover:border-slate-300",
                  fieldState.error
                    ? "border-rose-300 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-500/10"
                    : "border-slate-200",
                  disabled && "cursor-not-allowed bg-slate-50 text-slate-500",
                )}
              />
              {fieldState.error && (
                <AlertCircle className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-rose-500" />
              )}
            </div>
            <FieldMessage
              error={fieldState.error?.message}
              description={description}
            />
          </>
        )}
      />
    </div>
  );
}

export function FormNumber<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  disabled,
  required,
  className,
  description,
  step = 1,
  min = 0,
}: BaseFieldProps<T> & { step?: number; min?: number }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <FieldLabel label={label} required={required} />
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <input
              type="number"
              step={step}
              min={min}
              value={(field.value as number | undefined) ?? ""}
              onChange={(event) => {
                const raw = event.target.value;
                field.onChange(raw === "" ? undefined : Number(raw));
              }}
              onBlur={field.onBlur}
              disabled={disabled}
              placeholder={placeholder}
              className={cn(
                "h-10 w-full rounded-xl border bg-white px-3.5 text-right text-sm tabular-nums text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400",
                "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
                "hover:border-slate-300",
                fieldState.error
                  ? "border-rose-300 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-500/10"
                  : "border-slate-200",
                disabled && "cursor-not-allowed bg-slate-50 text-slate-500",
              )}
            />
            <FieldMessage
              error={fieldState.error?.message}
              description={description}
            />
          </>
        )}
      />
    </div>
  );
}

export function FormTextarea<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  disabled,
  required,
  className,
  description,
  rows = 3,
  maxLength,
  showCount,
}: BaseFieldProps<T> & {
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <FieldLabel label={label} required={required} />
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <div className="relative">
              <textarea
                name={field.name}
                ref={field.ref}
                value={(field.value as string) ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                rows={rows}
                maxLength={maxLength}
                disabled={disabled}
                placeholder={placeholder}
                className={cn(
                  "w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400",
                  "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
                  "hover:border-slate-300",
                  fieldState.error
                    ? "border-rose-300 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-500/10"
                    : "border-slate-200",
                  disabled && "cursor-not-allowed bg-slate-50 text-slate-500",
                )}
              />
              {showCount && maxLength && (
                <span className="absolute bottom-2 right-3 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                  {String(field.value ?? "").length}/{maxLength}
                </span>
              )}
            </div>
            <FieldMessage
              error={fieldState.error?.message}
              description={description}
            />
          </>
        )}
      />
    </div>
  );
}

export function FormSearchSelect<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Buscar y seleccionar...",
  fallbackLabel,
  required,
  disabled,
  options = [],
  className,
  description,
}: BaseFieldProps<T> & {
  options?: OptionItem[];
  fallbackLabel?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <FieldLabel label={label} required={required} />
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange }, fieldState }) => {
          const selectedValue = value as number | undefined;
          const selected = pickOption(options, selectedValue, fallbackLabel);
          const useOptionsFinal = buildLocalUseOptions(options);

          return (
            <>
              <SearchSelect
                useOptions={useOptionsFinal}
                value={selected}
                onChange={(option) =>
                  onChange(
                    option ? toNumberOptionValue(option.value) : undefined,
                  )
                }
                placeholder={placeholder}
                pageSize={100}
                minSearchChars={1}
                disabled={disabled}
                className="w-full"
                inputClassName={cn(
                  "h-10 rounded-xl border px-3.5 py-0 text-sm shadow-none",
                  "focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10",
                  fieldState.error
                    ? "border-rose-300 bg-rose-50/30"
                    : "border-slate-200 bg-white hover:border-slate-300",
                  disabled && "cursor-not-allowed bg-slate-50 opacity-70",
                )}
                textClassName="font-medium text-slate-800 placeholder:text-slate-400"
              />
              <FieldMessage
                error={fieldState.error?.message}
                description={description}
              />
            </>
          );
        }}
      />
    </div>
  );
}
