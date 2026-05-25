import { useDashboardMetricsQuotationTotal } from "@/sharedKernel/hooks/dashboard/useDashboardPreSales";
import { FileText, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

export const DashboardPreSalesQuotationsMetrics = ({ usersId, quarter, year }: Props) => {
  const { data, isLoading } = useDashboardMetricsQuotationTotal(usersId, quarter, year);
  const navigate = useNavigate();

  const STYLE = {
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "group-hover:border-emerald-200",
    gradientLine: "from-emerald-500 to-emerald-600",
    route: "/pre-sale/quotation/quotes"
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[140px] w-full items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
        <Loader2 className="animate-spin text-emerald-500 size-6" />
      </div>
    );
  }

  const quantity = data?.[0]?.quantity ?? 0;

  return (
    <div className="h-full w-full">
      <div
        onClick={() => navigate(STYLE.route)}
        className={`
            group relative flex h-full flex-col justify-between 
            overflow-hidden rounded-xl bg-white border border-gray-100 
            shadow-sm transition-all duration-300 
            hover:shadow-md hover:-translate-y-0.5 cursor-pointer 
            ${STYLE.borderColor}
        `}
      >
        <div className="p-5 flex flex-col h-full justify-between">
            <div className="flex items-start justify-between">
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Cotizaciones Realizadas
                    </h3>
                    <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                        Volumen de Preventas
                    </span>
                </div>
                <div className={`p-2.5 rounded-lg ${STYLE.bgColor} ${STYLE.iconColor} transition-transform group-hover:scale-110 duration-300`}>
                    <FileText className="size-6" strokeWidth={2} />
                </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
                <span className="text-4xl font-bold text-gray-800 tracking-tight font-mono">
                    {new Intl.NumberFormat('es-PE').format(quantity)}
                </span>
                <div className="flex items-center gap-1 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <span className="text-xs font-medium text-emerald-600">Ver detalles</span>
                    <ArrowRight className="size-3 text-emerald-600" />
                </div>
            </div>

            <div className="mt-2 flex items-center gap-1.5 pt-3 border-t border-gray-50">
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                    Total de Cotizaciones
                </span>
            </div>
        </div>

        <div className={`h-1 w-full bg-gradient-to-r ${STYLE.gradientLine} opacity-80`} />
      </div>
    </div>
  );
};