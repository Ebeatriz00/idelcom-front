import { CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/sharedKernel/lib/cn";

export type DocumentStatus = "Vigente" | "Pendiente" | "Vencido" | "Por vencer" | "Reemplazado";

type StatusConfig = {
  label: string;
  className: string;
  icon: React.ReactNode;
};

const STATUS_MAP: Record<string, StatusConfig> = {
  vigente: {
    label: "Vigente",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <CheckCircle2 className="size-3" />,
  },
  pendiente: {
    label: "Pendiente",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: <Clock className="size-3" />,
  },
  vencido: {
    label: "Vencido",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: <XCircle className="size-3" />,
  },
  "por vencer": {
    label: "Por vencer",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    icon: <Clock className="size-3" />,
  },
  reemplazado: {
    label: "Reemplazado",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: <RefreshCw className="size-3" />,
  },
};

export function DocumentStatusBadge({ status }: { status?: string }) {
  const normalized = (status ?? "").trim().toLowerCase();
  const config = STATUS_MAP[normalized] || {
    label: status || "Desconocido",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: <AlertCircle className="size-3" />,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-tight shadow-sm transition-all",
        config.className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
