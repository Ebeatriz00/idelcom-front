import { BadgeCheck, Box, BriefcaseBusiness, Hammer } from "lucide-react";

type ProductBadgeProps = {
  children: string;
  tone?: "blue" | "emerald" | "slate" | "amber" | "rose";
};

const toneClass = {
  blue: "bg-primary-degrad text-primary ring-primary/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  slate: "bg-muted text-secondary ring-secondary/10",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/15",
};

export function ProductBadge({ children, tone = "slate" }: ProductBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

export function ProductStatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
      <BadgeCheck className="size-3" />
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-500/10">
      Inactivo
    </span>
  );
}

export function ProductTypeBadge({
  label,
  isService,
  isTool,
}: {
  label?: string;
  isService?: boolean;
  isTool?: boolean;
}) {
  if (isService) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-600/15">
        <BriefcaseBusiness className="size-3" />
        Servicio
      </span>
    );
  }

  if (isTool) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-600/15">
        <Hammer className="size-3" />
        Herramienta
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-degrad px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary ring-1 ring-primary/20">
      <Box className="size-3" />
      {label || "Producto"}
    </span>
  );
}

export function ProductAvatar({ label }: { label?: string }) {
  const initial = label?.trim().charAt(0)?.toUpperCase() || "P";

  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-white shadow-sm">
      {initial}
    </div>
  );
}
