import type { PersonnelOperationsItem } from "@/application";
import { formatValue, getInitials } from "../../../utils/helper";
import { MetricCard } from "./MetricCard";

function getComplianceMeta(percentage: number) {
  if (percentage >= 80) {
    return {
      subtitle: "Homologacion completa",
      tone: "success" as const,
    };
  }

  if (percentage >= 50) {
    return {
      subtitle: "Homologacion en proceso",
      tone: "warning" as const,
    };
  }

  return {
    subtitle: "Homologacion incompleta",
    tone: "danger" as const,
  };
}

export function HeaderCard({
  data,
  onCreate,
}: {
  data: PersonnelOperationsItem;
  onCreate?: () => void;
}) {
  const summary = data.personnelHomologationSummaryItem?.[0];

  const activeProject = summary?.activeProject ?? 0;
  const currentDocuments = summary?.currentDocuments ?? 0;
  const observations = summary?.observations ?? 0;
  const summaryCurrentDocuments = summary?.summaryCurrentDocuments ?? "0/0";
  const toExpired = summary?.toExpired ?? 0;
  const generalPercentage = summary?.generalPercentage ?? 0;
  const shortages = summary?.shortages ?? 0;

  const compliance = getComplianceMeta(generalPercentage);

  return (
    <header className="grid gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)] xl:items-stretch">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex h-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-amber-500 text-xl font-bold text-white shadow-sm sm:h-20 sm:w-20 sm:text-2xl">
              {getInitials(data.personnelFullName)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {formatValue(data.personnelFullName)}
                </h1>

                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {formatValue(data.status)}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                DNI: {formatValue(data.personnelDocument)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Cargo: {formatValue(data.personnelPosittion)}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">
                Cumplimiento documental: {generalPercentage}%
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">
                {shortages} requisito
                {shortages === 1 ? "" : "s"} pendiente
                {shortages === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <button
              type="button"
              onClick={onCreate}
              className="w-full rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 sm:w-auto"
            >
              Nueva homologacion
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:h-full xl:grid-cols-3">
        <MetricCard
          title="Proyectos activos"
          value={activeProject}
          subtitle={`${currentDocuments} vigente${currentDocuments === 1 ? "" : "s"}\n${observations} observado${observations === 1 ? "" : "s"}`}
          tone="default"
        />

        <MetricCard
          title="Documentos vigentes"
          value={summaryCurrentDocuments}
          subtitle={`${toExpired} por vencer`}
          tone={toExpired > 0 ? "warning" : "success"}
        />

        <MetricCard
          title="Estado general"
          value={`${generalPercentage}%`}
          subtitle={compliance.subtitle}
          tone={compliance.tone}
          highlight
        />
      </div>
    </header>
  );
}
