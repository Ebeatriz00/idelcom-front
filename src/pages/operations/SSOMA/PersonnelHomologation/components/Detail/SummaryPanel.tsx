import type { PersonnelOperationsItem } from "@/application";
import { Panel } from "./presentation/Panel";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Briefcase,
  ChevronRight
} from "lucide-react";
import { cn } from "@/sharedKernel/lib/cn";
import type { ReactNode } from "react";

function SummaryStat({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneStyles = {
    default: "text-slate-600 bg-slate-50/50 border-slate-100 group-hover:bg-slate-50 group-hover:border-slate-200",
    success: "text-emerald-700 bg-emerald-50/50 border-emerald-100 group-hover:bg-emerald-50 group-hover:border-emerald-200",
    warning: "text-amber-700 bg-amber-50/50 border-amber-100 group-hover:bg-amber-50 group-hover:border-amber-200",
    danger: "text-rose-700 bg-rose-50/50 border-rose-100 group-hover:bg-rose-50 group-hover:border-rose-200",
  }[tone];

  const iconStyles = {
    default: "text-slate-400 bg-white shadow-sm",
    success: "text-emerald-500 bg-white shadow-sm",
    warning: "text-amber-500 bg-white shadow-sm",
    danger: "text-rose-500 bg-white shadow-sm",
  }[tone];

  return (
    <div className={cn(
      "group flex items-center justify-between rounded-xl border p-3 transition-all duration-200",
      toneStyles
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100", iconStyles)}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("text-base font-bold tabular-nums", 
          tone === "default" ? "text-slate-900" : ""
        )}>{value}</span>
        <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
      </div>
    </div>
  );
}

export function SummaryPanel({
  summaryItems,
}: {
  summaryItems: PersonnelOperationsItem["personnelHomologationSummaryItem"];
}) {
  const summary = summaryItems?.[0];

  const {
    totalDocuments = 0,
    currentDocuments = 0,
    pendings = 0,
    toExpired = 0,
    generalShortages = 0,
    operationsShortages = 0,
  } = summary ?? {};

  return (
    <Panel title="Resumen de Homologación">
      <div className="grid gap-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Estado Global</h4>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Consolidado de cumplimiento
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
              <ShieldAlert className="h-5 w-5 text-slate-400" />
            </div>
          </div>

          <div className="grid gap-2.5">
            <SummaryStat 
              label="Total archivos" 
              value={String(totalDocuments)} 
              icon={<FileText className="h-4 w-4" />}
            />
            <SummaryStat 
              label="Vigentes" 
              value={String(currentDocuments)} 
              tone="success" 
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <SummaryStat 
              label="Pendientes" 
              value={String(pendings)} 
              tone="warning" 
              icon={<Clock className="h-4 w-4" />}
            />
            <SummaryStat 
              label="Por vencer" 
              value={String(toExpired)} 
              tone={toExpired > 0 ? "warning" : "default"} 
              icon={<AlertTriangle className="h-4 w-4" />}
            />
          </div>
        </section>

        <section className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Brechas Detectadas</h4>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Faltantes por nivel de alcance
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 border border-rose-100">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
          </div>

          <div className="grid gap-2.5">
            <SummaryStat
              label="Faltantes generales"
              value={String(generalShortages)}
              tone={generalShortages > 0 ? "danger" : "success"}
              icon={<FileText className="h-4 w-4" />}
            />
            <SummaryStat
              label="Faltantes por operación"
              value={String(operationsShortages)}
              tone={operationsShortages > 0 ? "danger" : "success"}
              icon={<Briefcase className="h-4 w-4" />}
            />
          </div>
        </section>
      </div>
    </Panel>
  );
}