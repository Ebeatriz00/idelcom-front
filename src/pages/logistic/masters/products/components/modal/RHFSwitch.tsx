import { Controller } from "react-hook-form";
import { cn } from "@/sharedKernel";
import { Check, Info } from "lucide-react";
import type { RHFSwitchProps } from "./RHFSwitch.types";

export function RHFSwitch({
  name,
  control,
  label,
  description,
  disabledReason,
  disabled,
  icon,
}: RHFSwitchProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <label
          className={cn(
            "group relative flex min-h-[116px] cursor-pointer flex-col justify-between gap-3 overflow-hidden rounded-xl border p-4 transition-all duration-200",
            field.value
              ? "border-blue-200 bg-blue-50/60 ring-1 ring-blue-100"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60",
            disabled &&
              "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70 grayscale hover:bg-slate-50",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              {icon && (
                <div className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                  field.value
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
                )}>
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <span
                  className={cn(
                    "block text-sm font-semibold leading-5 transition-colors",
                    field.value ? "text-blue-950" : "text-slate-800",
                  )}
                >
                  {label}
                </span>
                {field.value && !disabled && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                    <Check className="size-3" />
                    Activo
                  </span>
                )}
              </div>
            </div>
            
            <div className="relative mt-0.5 inline-flex items-center">
              <input
                type="checkbox"
                checked={!!field.value}
                disabled={disabled}
                onChange={(e) => field.onChange(e.target.checked)}
                className="peer sr-only"
              />
              <div
                className={cn(
                  "h-5 w-10 rounded-full bg-slate-200 transition-all duration-300 after:absolute after:left-[3px] after:top-[3px] after:h-3.5 after:w-3.5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-5 peer-focus:ring-2 peer-focus:ring-blue-200",
                  disabled && "bg-slate-200 peer-checked:bg-slate-400",
                )}
              />
            </div>
          </div>

          {description && (
            <p className={cn(
              "text-xs leading-relaxed transition-colors",
              field.value ? "text-blue-800/80" : "text-slate-500",
            )}>
              {description}
            </p>
          )}

          {disabled && disabledReason && (
            <div className="mt-1 flex items-start gap-1.5 rounded-lg bg-slate-200/60 px-2 py-1.5 text-[10px] font-medium leading-tight text-slate-600">
              <Info className="mt-0.5 size-3 shrink-0" />
              <span>{disabledReason}</span>
            </div>
          )}

          {field.value && !disabled && (
            <div className="pointer-events-none absolute -right-6 -top-6 size-14 rounded-full bg-blue-100/70 blur-2xl" />
          )}
        </label>
      )}
    />
  );
}
