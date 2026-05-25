import React, { useRef } from "react";
import { toast } from "sonner";

type ProgressToast = {
  setPct: (pct: number) => void;
  setLabel: (label: string) => void;
  close: () => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
};

export function showProgressToast(initialLabel: string): ProgressToast {
  let rootEl: HTMLDivElement | null = null;

  const id = toast.custom(
    () => {
      const RefBinder = () => {
        const ref = useRef<HTMLDivElement | null>(null);

        // cuando React monta, guardamos el elemento real
        React.useEffect(() => {
          rootEl = ref.current;
        }, []);

        return (
          <div
            ref={ref}
            className="w-[320px] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg"
          >
            <div className="flex items-center justify-between gap-3">
              <div
                data-toast-label
                className="truncate text-[13px] font-semibold text-slate-900"
              >
                {initialLabel}
              </div>

              <div
                data-toast-pct
                className="text-[12px] font-semibold text-slate-600 tabular-nums"
              >
                0%
              </div>
            </div>

            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                data-toast-bar
                className="h-full rounded-full bg-blue-600 transition-[width] duration-200 ease-out"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        );
      };

      return <RefBinder />;
    },
    { duration: Infinity },
  );

  const setLabel = (label: string) => {
    const el = rootEl?.querySelector("[data-toast-label]") as HTMLElement | null;
    if (el) el.textContent = label;
  };

  const setPct = (pct: number) => {
    const p = Math.max(0, Math.min(100, Math.round(pct)));
    const pctEl = rootEl?.querySelector("[data-toast-pct]") as HTMLElement | null;
    const barEl = rootEl?.querySelector("[data-toast-bar]") as HTMLElement | null;

    if (pctEl) pctEl.textContent = `${p}%`;
    if (barEl) barEl.style.width = `${p}%`;
  };

  return {
    setLabel,
    setPct,
    close: () => toast.dismiss(id),
    success: (msg: string) => {
      toast.dismiss(id);
      toast.success(msg, { position: "bottom-right" });
    },
    error: (msg: string) => {
      toast.dismiss(id);
      toast.error(msg, { position: "bottom-right" });
    },
  };
}
