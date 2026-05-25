import { cn } from "@/sharedKernel";
import { tones, type Tone } from "./BadgeQt";
import { useMemo } from "react";

const fmtMoney = (n: number) =>
  (n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function MonthStrip({
  title,
  values,
  accent,
  value,
  onSelect,
}: {
  title: string;
  values: Map<number, number>;
  accent?: Tone;
  value?: number | null;
  onSelect?: (monthNo: number) => void;
}) {
  const months = useMemo(() => {
  const ks = Array.from(values.keys());
  ks.sort((a, b) => a - b);
  return ks;
}, [values]);

const rangeLabel =
  months.length > 0
    ? `MES ${String(months[0]).padStart(2, "0")} → MES ${String(
        months[months.length - 1]
      ).padStart(2, "0")}`
    : "Sin egresos";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
        <div className="text-xs text-zinc-500">{rangeLabel}</div>
      </div>

      {/* Scroll horizontal */}
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {months.map((m) => {
            const active = value === m;
            const clickable = !!onSelect;
            const Comp: any = clickable ? "button" : "div";

            return (
              <Comp
                key={m}
                type={clickable ? "button" : undefined}
                onClick={clickable ? () => onSelect?.(m) : undefined}
                className={cn(
                  "shrink-0 rounded-xl border border-zinc-200 p-2 text-left transition",
                  "w-[132px]", // 👈 ancho fijo para que nunca corte
                  accent && tones[accent],
                  clickable && "hover:bg-white hover:shadow-sm",
                  active && "border-zinc-400 bg-white shadow-sm ring-1 ring-zinc-200",
                  clickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <div className="text-[11px] font-medium">
                  MES {String(m).padStart(2, "0")}
                </div>
                <div className="mt-1 text-sm font-semibold whitespace-nowrap tabular-nums">
                  {fmtMoney(values.get(m) ?? 0)}
                </div>
              </Comp>
            );
          })}
        </div>
      </div>
    </div>
  );
}
