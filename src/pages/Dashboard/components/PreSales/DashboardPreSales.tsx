import { useState, useEffect } from "react";
import { 
  Users, 
  CalendarDays, 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Table as TableIcon, 
  Share2, 
  Target 
} from "lucide-react"; 
import { useAuth } from "@/stores/auth";
import { UseDashCommercial } from "@/pages/Dashboard/hooks/commercial.perms";
import { useWorkerProyectOptions } from "@/sharedKernel"; 
import { useExerciesOptions } from "@/sharedKernel/hooks/accounting/useExerPer";

import { DashboardPreSalesQuotationsMetrics } from "./PreSalesQuotationTotals";
import { DashboardPreSalesStatesMetrics } from "./PreSalesStatesMetricsState";
import { DashboardPreSalesQuarterMetrics } from "./PreSalesQuarterMetrics";
import { DashboardPreSalesByEngineerPieChart } from "./PreSalesByEngineer";
import { DashboardPreSalesByIntegratorChart } from "./PreSalesByIntegrator"; 
import { DashboardPreSalesByCollaboratorChart } from "./PreSalesByCollaborator"; 
import { DashboardPreSalesCommercialMatrix } from "./PreSalesCommercialMatriz";
import { DashboardPreSalesByCategoryChart } from "./PreSalesByCategory";


export const PreSalesDashboard = () => {
  const { data: yearsData } = useExerciesOptions(1, "", 2000);
  const years = yearsData?.items ?? [];
  const CURRENT_YEAR = new Date().getFullYear();

  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);

  const [chartView, setChartView] = useState<'engineer' | 'integrators' | 'collaborators' | 'matrix' | 'category'>('engineer');

  const { workerId } = useAuth();
  const { isPreSalesManager } = UseDashCommercial();
  const { data: usersData } = useWorkerProyectOptions();

  const effectiveUserId = isPreSalesManager 
      ? selectedUserId 
      : (workerId ? Number(workerId) : undefined);

  useEffect(() => {
    if (!years.length) return;
    const exists = years.some((y) => Number(y.value) === CURRENT_YEAR);
    if (!exists) {
      setSelectedYear(Number(years[0].value));
    }
  }, [years]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="size-5 text-emerald-500" />
            Panel de Control
          </h1>
          <p className="text-xs text-slate-500 font-medium ml-7">
             {isPreSalesManager ? "Vista Gerencial Global" : "Mi Resumen de Actividades"}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {isPreSalesManager && (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <div className="pl-2 text-slate-400"><Users className="size-4" /></div>
              <select
                className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer py-1 pr-2 min-w-[150px]"
                value={selectedUserId ?? ""}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Vista Global (Todos)</option>
                {usersData?.items?.map((user: any) => (
                  <option key={user.value} value={user.value}>{user.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <div className="pl-2 text-slate-400"><Calendar className="size-4" /></div>
            <select
              className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer py-1 pr-2 min-w-[60px]"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y.value} value={Number(y.value)}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <div className="pl-2 text-slate-400"><CalendarDays className="size-4" /></div>
            <select
              className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer py-1 pr-2 min-w-[140px]"
              value={selectedQuarter ?? ""}
              onChange={(e) => setSelectedQuarter(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Todo el Año</option>
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-3 xl:col-span-2 h-full">
              <DashboardPreSalesQuotationsMetrics 
                usersId={effectiveUserId} 
                quarter={selectedQuarter} 
                year={selectedYear} 
              />
          </div>
          
          <div className="lg:col-span-9 xl:col-span-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-stretch">
                  <div className="h-full">
                      <DashboardPreSalesStatesMetrics 
                        usersId={effectiveUserId} 
                        quarter={selectedQuarter} 
                        year={selectedYear} 
                      />
                  </div>
                  <div className="h-full">
                      <DashboardPreSalesQuarterMetrics 
                        usersId={effectiveUserId} 
                        quarter={selectedQuarter} 
                        year={selectedYear} 
                      />
                  </div>
              </div>
          </div>
      </div>

      <div className="flex flex-col gap-4 pt-4 border-t border-slate-200 mt-2">
         <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Análisis de Rendimiento</h2>
            
            <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
                <button 
                  onClick={() => setChartView('engineer')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap 
                    ${chartView === 'engineer' ? 'bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                  <BarChart3 className="size-3.5" />
                  Por Responsable
                </button>

                <div className="w-px h-4 bg-slate-200 mx-1"></div>

                <button 
                  onClick={() => setChartView('integrators')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap 
                    ${chartView === 'integrators' ? 'bg-purple-50 text-purple-600 shadow-sm ring-1 ring-purple-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                  <Users className="size-3.5" />
                  Por Integrador
                </button>

                <div className="w-px h-4 bg-slate-200 mx-1"></div>

                <button 
                  onClick={() => setChartView('collaborators')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap 
                    ${chartView === 'collaborators' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                  <Share2 className="size-3.5" />
                  Participación
                </button>

                <div className="w-px h-4 bg-slate-200 mx-1"></div>

                <button 
                  onClick={() => setChartView('matrix')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap 
                    ${chartView === 'matrix' ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                  <TableIcon className="size-3.5" />
                  Matriz Comercial
                </button>

                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <button 
                  onClick={() => setChartView('category')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap 
                    ${chartView === 'category' ? 'bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                  <Target className="size-3.5" />
                  Por Categoría
                </button>
             </div>
         </div>

         <div className="w-full min-h-[500px] transition-all duration-300 ease-in-out">
            {chartView === 'engineer' && (
               <DashboardPreSalesByEngineerPieChart usersId={effectiveUserId} quarter={selectedQuarter} year={selectedYear} />
            )}
            {chartView === 'integrators' && (
               <DashboardPreSalesByIntegratorChart usersId={effectiveUserId} quarter={selectedQuarter} year={selectedYear} />
            )}
            {chartView === 'collaborators' && (
               <DashboardPreSalesByCollaboratorChart usersId={effectiveUserId} quarter={selectedQuarter} year={selectedYear} />
            )}
            {chartView === 'matrix' && (
               <DashboardPreSalesCommercialMatrix usersId={effectiveUserId} quarter={selectedQuarter} year={selectedYear} />
            )}
            
            {chartView === 'category' && (
               <DashboardPreSalesByCategoryChart 
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