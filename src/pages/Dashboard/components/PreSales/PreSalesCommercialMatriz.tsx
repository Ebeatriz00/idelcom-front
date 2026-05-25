import { useState, useMemo } from "react";
import { Loader2, Table as TableIcon, ArrowRightLeft, CheckCircle2, FileText, Calculator } from "lucide-react";
import { useDashboardMetricsPreSalesMatriz } from "@/sharedKernel/hooks/dashboard/useDashboardPreSales";
import type { DashboardPreSalesMatriz } from "@/application/dtos/dashboard/dashboardPreSales/dashboardPreSales.dto";

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const DashboardPreSalesCommercialMatrix = ({ usersId, quarter, year }: Props) => {
  const [showGeneralAmount, setShowGeneralAmount] = useState(false);
  const [showTotals, setShowTotals] = useState(false);
  
  const { data, isLoading } = useDashboardMetricsPreSalesMatriz(usersId, quarter, year);

  const { matrixRows, monthColumns } = useMemo(() => {
    if (!data || data.length === 0) return { matrixRows: [], monthColumns: ALL_MONTHS };

    const commercialMap = new Map<number, any>();

    data.forEach((item: DashboardPreSalesMatriz) => {
      if (!commercialMap.has(item.workerId)) {
        commercialMap.set(item.workerId, {
          id: item.workerId,
          name: item.workerName,
          months: {}
        });
      }
      
      const commercial = commercialMap.get(item.workerId);
      commercial.months[item.monthNum] = {
        won: item.wonAmount,
        general: item.generalAmount,
        qty: item.totalQuotations
      };
    });

    return { 
      matrixRows: Array.from(commercialMap.values()),
      monthColumns: ALL_MONTHS
    };
  }, [data]);

  const currencyFormatter = (value: number) => {
    if (!value || value === 0) return "-";
    return new Intl.NumberFormat('es-PE', { 
        style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 
    }).format(value);
  };

  const getMonthName = (m: number) => {
    const date = new Date(2026, m - 1, 1);
    return new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(date).toUpperCase();
  };

  const getColumnTotalAmount = (month: number) => {
    return matrixRows.reduce((sum, row) => {
        const cellData = row.months[month];
        const val = cellData ? (showGeneralAmount ? cellData.general : cellData.won) : 0;
        return sum + val;
    }, 0);
  };

  const getColumnTotalDocs = (month: number) => {
    return matrixRows.reduce((sum, row) => {
        const cellData = row.months[month];
        return sum + (cellData ? cellData.qty : 0);
    }, 0);
  };

  const grandTotalAmount = monthColumns.reduce((sum, month) => sum + getColumnTotalAmount(month), 0);
  const grandTotalDocs = monthColumns.reduce((sum, month) => sum + getColumnTotalDocs(month), 0);

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="animate-spin text-emerald-500 size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200 mt-6">
      
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
             <TableIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                Matriz de Efectividad Mensual
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
                Monto Ganado vs Cotizado por Comercial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button
                onClick={() => setShowTotals(!showTotals)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 border w-[150px] shrink-0 ${showTotals ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
                <Calculator className="size-3.5" />
                {showTotals ? "Ocultar Totales" : "Ver Totales"}
            </button>

            <button
                onClick={() => setShowGeneralAmount(!showGeneralAmount)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 border w-[240px] shrink-0 ${showGeneralAmount ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
            >
                <ArrowRightLeft className="size-3.5" />
                {showGeneralAmount ? (
                    <span className="flex items-center gap-1.5"><FileText className="size-3.5"/> Mostrando: Total Cotizado</span>
                ) : (
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5"/> Mostrando: Monto Ganado</span>
                )}
            </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-white p-4">
        {matrixRows.length > 0 ? (
            <table className="table-fixed w-max min-w-full text-xs border-collapse rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                <thead>
                    <tr>
                        <th className="w-[180px] min-w-[180px] max-w-[180px] text-left py-3 px-4 text-slate-500 font-bold border-b border-r border-slate-200 bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            COMERCIAL
                        </th>
                        {monthColumns.map(month => (
                            <th key={month} className="w-[95px] min-w-[95px] max-w-[95px] text-center py-3 px-0 text-slate-500 font-bold border-b border-r border-slate-200 bg-slate-50">
                                {getMonthName(month)}
                            </th>
                        ))}
                        
                        {showTotals && (
                            <th className={`w-[110px] min-w-[110px] max-w-[110px] text-center py-3 px-0 font-bold border-b border-l-2 border-slate-200 bg-slate-100 ${showGeneralAmount ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                TOTAL
                            </th>
                        )}
                    </tr> 
                </thead>
                <tbody className="bg-white">
                    {matrixRows.map((row, index) => {
                        const rowTotalAmount = monthColumns.reduce((sum, month) => {
                            const cellData = row.months[month];
                            const val = cellData ? (showGeneralAmount ? cellData.general : cellData.won) : 0;
                            return sum + val;
                        }, 0);
                        const rowTotalDocs = monthColumns.reduce((sum, month) => {
                            const cellData = row.months[month];
                            return sum + (cellData ? cellData.qty : 0);
                        }, 0);

                        return (
                            <tr key={row.id} className={`transition-colors border-b border-slate-200 last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-100/80`}>
                                
                                <td className={`p-0 border-r border-slate-200 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                    <div className="h-[44px] px-4 flex items-center gap-2 font-bold text-slate-700 w-full overflow-hidden">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${showGeneralAmount ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                                        <span className="uppercase truncate" title={row.name}>{row.name}</span>
                                    </div>
                                </td>
                                
                                {monthColumns.map(month => {
                                    const cellData = row.months[month];
                                    const valueToShow = cellData ? (showGeneralAmount ? cellData.general : cellData.won) : 0;

                                    return (
                                        <td key={month} className="p-0 border-r border-slate-200 align-middle">
                                            <div className="h-[44px] px-2 flex flex-col items-end justify-center w-full overflow-hidden">
                                                {cellData && valueToShow > 0 ? (
                                                    <>
                                                        <span className={`font-mono font-bold truncate w-full text-right leading-tight ${showGeneralAmount ? 'text-indigo-600' : 'text-emerald-600'}`} title={currencyFormatter(valueToShow)}>
                                                            {currencyFormatter(valueToShow)}
                                                        </span>
                                                        <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0 leading-none mt-0.5">
                                                            {cellData.qty} docs
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}

                                {showTotals && (
                                    <td className="p-0 border-l-2 border-slate-200 bg-slate-50/50 align-middle">
                                        <div className="h-[44px] px-2 flex flex-col items-end justify-center w-full overflow-hidden">
                                            {rowTotalAmount > 0 ? (
                                                <>
                                                    <span className={`font-mono font-black truncate w-full text-right leading-tight ${showGeneralAmount ? 'text-indigo-700' : 'text-emerald-700'}`} title={currencyFormatter(rowTotalAmount)}>
                                                        {currencyFormatter(rowTotalAmount)}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-500 bg-slate-200/50 px-1.5 py-0.5 rounded shrink-0 leading-none mt-0.5">
                                                        {rowTotalDocs} docs
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}

                    {showTotals && (
                        <tr className={`font-bold border-t-2 ${showGeneralAmount ? 'bg-indigo-50/50 border-indigo-200' : 'bg-emerald-50/50 border-emerald-200'}`}>
                            <td className={`p-0 sticky left-0 z-10 border-r ${showGeneralAmount ? 'bg-indigo-50 border-indigo-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                <div className={`h-[44px] px-4 flex items-center justify-end w-full ${showGeneralAmount ? 'text-indigo-900' : 'text-emerald-900'}`}>
                                    TOTAL
                                </div>
                            </td>
                            {monthColumns.map(month => {
                                const totalAmount = getColumnTotalAmount(month);
                                const totalDocs = getColumnTotalDocs(month);

                                return (
                                    <td key={month} className={`p-0 border-r align-middle ${showGeneralAmount ? 'border-indigo-200' : 'border-emerald-200'}`}>
                                        <div className="h-[44px] px-2 flex flex-col items-end justify-center w-full overflow-hidden">
                                            {totalAmount > 0 ? (
                                                <>
                                                    <span className={`font-mono font-bold truncate w-full text-right leading-tight ${showGeneralAmount ? 'text-indigo-800' : 'text-emerald-800'}`} title={currencyFormatter(totalAmount)}>
                                                        {currencyFormatter(totalAmount)}
                                                    </span>
                                                    <span className="text-[9px] font-semibold text-slate-500 bg-white/60 px-1.5 py-0.5 rounded shrink-0 leading-none mt-0.5">
                                                        {totalDocs} docs
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-slate-400/50">-</span>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}

                            <td className={`p-0 border-l-2 align-middle ${showGeneralAmount ? 'border-indigo-200 bg-indigo-100/50' : 'border-emerald-200 bg-emerald-100/50'}`}>
                                <div className="h-[44px] px-2 flex flex-col items-end justify-center w-full overflow-hidden">
                                    {grandTotalAmount > 0 ? (
                                        <>
                                            <span className={`font-mono font-black text-[12px] truncate w-full text-right leading-tight ${showGeneralAmount ? 'text-indigo-900' : 'text-emerald-900'}`} title={currencyFormatter(grandTotalAmount)}>
                                                {currencyFormatter(grandTotalAmount)}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-600 bg-white/80 px-1.5 py-0.5 rounded shrink-0 leading-none mt-0.5">
                                                {grandTotalDocs} docs
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-slate-400/50">-</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <TableIcon className="size-10 mb-2 opacity-20" />
                <p className="text-sm font-medium">No hay cotizaciones para mostrar en este periodo.</p>
            </div>
        )}
      </div>

      <div className={`h-1.5 w-full bg-gradient-to-r ${showGeneralAmount ? 'from-indigo-400 to-blue-600' : 'from-emerald-400 to-teal-600'}`}></div>
    </div>
  );
};