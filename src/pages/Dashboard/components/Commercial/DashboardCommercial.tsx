import { UseDashCommercial } from "@/pages/Dashboard/hooks/commercial.perms";
import { useSalesWorkerOptions } from "@/sharedKernel";
import { useExerciesOptions } from "@/sharedKernel/hooks/accounting/useExerPer";
import { useAuth } from "@/stores/auth";
import {
  BarChart2,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CommercialClientOpportunity } from "./CommercialClientOpportunity";
import { DashboardClientMetrics } from "./CommercialClients";
import { DashboardClosingChart } from "./CommercialClosing";
import { DashboardEvolutionChart } from "./CommercialEvolution";
import { DashboardCombinedChart } from "./CommercialGraphics";
import { DashboardProbabilityChart } from "./CommercialProbability";
import { DashboardQuarterMetrics } from "./CommercialQuarters";
import { CommercialQuotations } from "./CommercialQuotations";
import { DashboardStateMetrics } from "./CommercialStates";

export const CommercialDashboard = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    undefined,
  );
  const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>(
    undefined,
  );

  const { data: yearsData } = useExerciesOptions(1, "", 2000);
  const years = yearsData?.items ?? [];

  const CURRENT_YEAR = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);

  const [chartView, setChartView] = useState<
    "prob" | "evol" | "closing" | "clients" | "quotations"
  >("prob");

  const { workerId } = useAuth();
  const { isManager } = UseDashCommercial();
  const { data: usersData } = useSalesWorkerOptions();

  const effectiveUserId = isManager
    ? selectedUserId
    : workerId
      ? Number(workerId)
      : undefined;

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUserId(val ? Number(val) : undefined);
  };

  const handleQuarterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedQuarter(val ? Number(val) : undefined);
  };

  useEffect(() => {
    if (!years.length) return;
    const exists = years.some((y) => Number(y.value) === CURRENT_YEAR);

    if (!exists) {
      setSelectedYear(Number(years[0].value));
    }
  }, [years]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="size-5 text-orange-500" />
            Panel de Control
          </h1>
          <p className="text-xs text-slate-500 font-medium ml-7">
            {isManager ? "Vista Gerencial Global" : "Mi Resumen Comercial"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isManager && (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <div className="pl-2 text-slate-400">
                <Users className="size-4" />
              </div>
              <select
                className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer py-1 pr-2 min-w-[150px]"
                value={selectedUserId ?? ""}
                onChange={handleUserChange}
              >
                <option value="">Vista Global (Todos)</option>
                {usersData?.items?.map((user: any) => (
                  <option key={user.value} value={user.value}>
                    {user.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <div className="pl-2 text-slate-400">
              <CalendarDays className="size-4" />
            </div>
            <select
              className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer py-1 pr-2 min-w-[140px]"
              value={selectedQuarter ?? ""}
              onChange={handleQuarterChange}
            >
              <option value="">Todo el Año</option>
              <option value="1">Q1 (Ene - Mar)</option>
              <option value="2">Q2 (Abr - Jun)</option>
              <option value="3">Q3 (Jul - Sep)</option>
              <option value="4">Q4 (Oct - Dic)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <div className="pl-2 text-slate-400">
              <Calendar className="size-4" />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer py-1 pr-2 min-w-[50px]"
            >
              {years.map((y) => (
                <option key={y.value} value={Number(y.value)}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-3 xl:col-span-2 h-full">
          <DashboardClientMetrics
            usersId={effectiveUserId}
            quarter={selectedQuarter}
            year={selectedYear}
          />
        </div>

        <div className="lg:col-span-9 xl:col-span-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="h-full">
              <DashboardStateMetrics
                usersId={effectiveUserId}
                quarter={selectedQuarter}
                year={selectedYear}
              />
            </div>
            <div className="h-full">
              <DashboardCombinedChart
                usersId={effectiveUserId}
                quarter={selectedQuarter}
                year={selectedYear}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <DashboardQuarterMetrics
          usersId={effectiveUserId}
          quarter={selectedQuarter}
          year={selectedYear}
        />
      </div>

      <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            Análisis Comercial
          </h2>

          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
            <button
              onClick={() => setChartView("prob")}
              className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap
                    ${
                      chartView === "prob"
                        ? "bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }
                  `}
            >
              <TrendingUp className="size-3.5" />
              Probabilidades
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button
              onClick={() => setChartView("evol")}
              className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap
                    ${
                      chartView === "evol"
                        ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }
                  `}
            >
              <BarChart2 className="size-3.5" />
              Evolución
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>

            <button
              onClick={() => setChartView("quotations")}
              className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap
                    ${
                      chartView === "quotations"
                        ? "bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }
                  `}
            >
              <FileText className="size-3.5" />
              Cotizaciones
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>

            <button
              onClick={() => setChartView("closing")}
              className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap
                    ${
                      chartView === "closing"
                        ? "bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }
                  `}
            >
              <CheckCircle2 className="size-3.5" />
              Cierre
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button
              onClick={() => setChartView("clients")}
              className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap
                    ${
                      chartView === "clients"
                        ? "bg-purple-50 text-purple-600 shadow-sm ring-1 ring-purple-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }
                  `}
            >
              <Briefcase className="size-3.5" />
              Cliente
            </button>
          </div>
        </div>

        <div className="w-full min-h-[500px] transition-all duration-300 ease-in-out">
          {chartView === "prob" && (
            <DashboardProbabilityChart
              usersId={effectiveUserId}
              quarter={selectedQuarter}
              year={selectedYear}
            />
          )}
          {chartView === "evol" && (
            <DashboardEvolutionChart
              usersId={effectiveUserId}
              quarter={selectedQuarter}
              year={selectedYear}
            />
          )}
          {chartView === "quotations" && (
            <CommercialQuotations
              usersId={effectiveUserId}
              quarter={selectedQuarter}
              year={selectedYear}
            />
          )}
          {chartView === "closing" && (
            <DashboardClosingChart
              usersId={effectiveUserId}
              quarter={selectedQuarter}
              year={selectedYear}
            />
          )}
          {chartView === "clients" && (
            <CommercialClientOpportunity
              usersId={effectiveUserId}
              quarter={selectedQuarter}
              year={selectedYear}
            />
          )}
        </div>
      </div>
    </div>
  );
};
