import { useDashboardMetricsState } from "@/sharedKernel/hooks/dashboard/useDashboardCommercial";
import { Loader2, ChevronRight, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

export const DashboardStateMetrics = ({ usersId, quarter, year }: Props) => {
  const { data, isLoading } = useDashboardMetricsState(usersId, quarter, year);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="animate-spin text-slate-400 size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200">
      
      <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4 bg-white">
        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
             <BarChart3 className="size-5" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
          Oportunidades por Estado
        </h3>
      </div>

      <div className="p-0 flex-1">
        <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-y-0 lg:divide-x">
          {data?.map((item, index) => (
            <div
              key={item.stateOpportunityId}
              role="button"
              onClick={() => navigate(`/crm/opportunity?stateId=${item.stateOpportunityId}&year=${year}`)}
              className={`
                group flex items-center justify-between py-4 px-6 cursor-pointer transition-all duration-200
                hover:bg-slate-50
                ${index % 2 === 0 ? 'lg:border-b lg:border-slate-100' : 'lg:border-b lg:border-slate-100'} 
              `}
            >
              <div className="flex items-center gap-3">
                <span className="block h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: item.stateColor }}/>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{item.stateName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{item.quantity}</span>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-500" />
              </div>
            </div>
          ))}
             {(!data || data.length === 0) && (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm">Sin datos disponibles</div>
          )}
        </div>
      </div>
      
      <div className="bg-slate-50 px-6 py-2 border-t border-slate-100 flex justify-between items-center">
         <span className="text-[10px] text-slate-400 font-medium">TOTAL: {data?.length || 0} ESTADOS</span>
      </div>


      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

    </div>
  );
};