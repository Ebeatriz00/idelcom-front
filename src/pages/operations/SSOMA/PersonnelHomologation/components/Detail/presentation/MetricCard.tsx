import { cn } from "@/sharedKernel/lib/cn";
import type { ReactNode } from "react";

type MetricTone = "default" | "success" | "warning" | "danger";

interface MetricCardProps {
  title: string;
  value: ReactNode;
  subtitle: string;
  icon?: ReactNode;
  tone?: MetricTone;
  highlight?: boolean;
  className?: string;
}

const toneStyles: Record<
  MetricTone,
  {
    container: string;
    value: string;
    badge: string;
    icon: string;
  }
> = {
  default: {
    container: "border-slate-200 bg-white",
    value: "text-slate-900",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    icon: "bg-slate-100 text-slate-600",
  },
  success: {
    container: "border-emerald-100 bg-white",
    value: "text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "bg-emerald-50 text-emerald-600",
  },
  warning: {
    container: "border-amber-100 bg-white",
    value: "text-amber-700",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "bg-amber-50 text-amber-600",
  },
  danger: {
    container: "border-rose-100 bg-white",
    value: "text-rose-700",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    icon: "bg-rose-50 text-rose-600",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  tone = "default",
  highlight = false,
  className,
}: MetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md",
        styles.container,
        highlight && "ring-1 ring-slate-200",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 space-y-5">
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {title}
          </p>
          <div
            className={cn("break-words text-2xl font-bold tracking-tight", styles.value)}
          >
            {value}
          </div>
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              styles.icon,
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4">
        <span
          className={cn(
            "inline-flex max-w-full whitespace-pre-line break-words items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            styles.badge,
          )}
        >
          {subtitle}
        </span>
      </div>

      {highlight && (
        <div className="absolute top-0 right-0 -mr-1 -mt-1 h-12 w-12 bg-slate-50 opacity-10 [mask-image:linear-gradient(to_bottom_left,white,transparent)]" />
      )}
    </article>
  );
}
