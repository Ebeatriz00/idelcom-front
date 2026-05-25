import { Loader2, ChevronRight, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardMetricsPreSalesStates } from "@/sharedKernel/hooks/dashboard/useDashboardPreSales"; 

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

export const DashboardPreSalesStatesMetrics = ({ usersId, quarter, year }: Props) => {
  const { data, isLoading } = useDashboardMetricsPreSalesStates(usersId, quarter, year);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="animate-spin text-emerald-500 size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200">
      
      <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4 bg-white">
        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
             <BarChart3 className="size-5" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
          Proyectos por Estado 
        </h3>
      </div>

      <div className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-y-0 lg:divide-x">
          {data?.map((item: any, index: number) => (
            <div
              key={item.statePreSaleId}
              role="button"
              onClick={() => {
              let url = `/presale/presaleproyects/presaleproyects?stateId=${item.statePreSaleId}`;
              
              if (year) {
                url += `&startDate=${year}-01-01&endDate=${year}-12-31`;
              }

              navigate(url);
            }}
              className={`
                group flex items-center justify-between py-4 px-6 cursor-pointer transition-all duration-200
                
                hover:bg-slate-50
                
                ${index % 2 === 0 ? 'lg:border-b lg:border-slate-100' : 'lg:border-b lg:border-slate-100'} 
              `}
            >
              <div className="flex items-center gap-3">
                <span 
                    className="block h-3 w-3 rounded-full ring-2 ring-white shadow-sm" 
                    style={{ backgroundColor: item.stateColor || '#cbd5e1' }}
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                    {item.stateName}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full min-w-[30px] text-center group-hover:bg-slate-200 transition-colors">
                    {item.quantity ?? item.QUANTITY ?? 0}
                </span>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-500 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}

          {(!data || data.length === 0) && (
            <div className="col-span-full py-16 text-center">
                <p className="text-slate-400 text-sm italic">No se encontraron oportunidades en este periodo.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 flex justify-between items-center">
         <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            Total: {data?.length || 0} Estados 
         </span>
      </div>

      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-600"></div>

    </div>
  );
};