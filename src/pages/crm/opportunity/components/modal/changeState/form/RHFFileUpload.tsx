import { cn } from "@/sharedKernel";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { useRef } from "react";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  accept?: string;
  disabled?: boolean;
  helperText?: string;
  error?: string;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function RHFFileUpload<T extends FieldValues>({
  name,
  control,
  label = "Archivo Excel",
  accept = ".xlsx,.xls",
  disabled,
  helperText = "Sube el Excel de cotización (formato .xlsx).",
  error,
}: Props<T>) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const resetNativeInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const file = field.value as File | undefined;

        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-600">
                {label}
              </span>

              {file && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    field.onChange(undefined);
                    resetNativeInput(); 
                  }}
                  className={cn(
                    "text-[11px] font-semibold text-rose-600 hover:text-rose-700",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Quitar
                </button>
              )}
            </div>

            <div
              className={cn(
                "rounded-2xl border bg-white p-3 shadow-sm",
                error ? "border-rose-300" : "border-slate-200",
                disabled && "opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                  <span className="text-xs font-bold">XLS</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {file ? file.name : "Ningún archivo seleccionado"}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    {file
                      ? `${formatBytes(file.size)} • ${file.type || "Excel"}`
                      : helperText}
                  </p>

                  {error && (
                    <p className="mt-1 text-[11px] font-medium text-rose-600">
                      {error}
                    </p>
                  )}
                </div>

                <label
                  className={cn(
                    "shrink-0 cursor-pointer rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white",
                    "hover:bg-slate-800 active:scale-[0.98] transition",
                    disabled &&
                      "cursor-not-allowed bg-slate-400 hover:bg-slate-400"
                  )}
                >
                  {file ? "Cambiar" : "Seleccionar"}
                  <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    disabled={disabled}
                    className="hidden"
                    onChange={(e) => {
                      let f = e.target.files?.[0];
                        if (f) {
                        f = new File([f], f.name.normalize("NFC"), {
                          type: f.type,
                          lastModified: f.lastModified,
                        });
                      }
                      field.onChange(f);
                      resetNativeInput(); 
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
