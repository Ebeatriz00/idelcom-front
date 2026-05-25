import { cn } from "@/sharedKernel";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type FormSectionTone = "blue" | "slate" | "emerald" | "amber";

export function FormSection({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
  tone = "blue",
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  tone?: FormSectionTone;
}) {
  const toneClass: Record<FormSectionTone, string> = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
  };

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors duration-200",
        "sm:p-6",
        className,
      )}
    >
      <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-4">
        {Icon && (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl ring-1",
              toneClass[tone],
            )}
          >
            <Icon className="size-[18px]" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-bold tracking-tight text-slate-950">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">{children}</div>
    </section>
  );
}

