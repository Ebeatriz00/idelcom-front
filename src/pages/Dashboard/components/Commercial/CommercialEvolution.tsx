import { useDashboardMetricsEvolution } from "@/sharedKernel/hooks/dashboard/useDashboardCommercial";
import { Loader2, CalendarRange, Table as TableIcon, FilterX } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from "recharts";

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export const DashboardEvolutionChart = ({ usersId, quarter, year }: Props) => {
  const [selectedYear, setSelectedYear] = useState<number>(year || CURRENT_YEAR);
  const [activeMonth, setActiveMonth] = useState<number | undefined>(undefined);

  const { data, isLoading } = useDashboardMetricsEvolution(usersId, quarter, selectedYear);

  const { chartData, tableRows, columns, uniqueStateIds, stateMeta } = useMemo(() => {
    if (!data) return { chartData: [], tableRows: [], columns: [], uniqueStateIds: [], stateMeta: {} };

    const stateMeta: Record<number, { label: string; color: string }> = {};
    
    data.forEach((item: any) => {
      const id = item.stateOpportunityId;
      if (!stateMeta[id]) {
        stateMeta[id] = {
            label: item.stateName || `Estado ${id}`, 
            color: item.stateColor || "#94a3b8"
        };
      }
    });

    let uniqueMonths = Array.from(new Set(data.map((d: any) => d.month))).sort((a: any, b: any) => a - b);
    if (activeMonth) {
        uniqueMonths = uniqueMonths.filter(m => m === activeMonth);
    }

    let allStates = Object.keys(stateMeta).map(Number);
    const visibleStateIds = allStates.filter(stateId => {
        return uniqueMonths.some(month => {
             const matches = data.filter((d: any) => d.stateOpportunityId === stateId && d.month === month);
             const total = matches.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);
             return total > 0;
        });
    });

    const getMonthLabel = (m: number) => {
        const date = new Date(selectedYear, m - 1, 1);
        const label = new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(date);
        return label.charAt(0).toUpperCase() + label.slice(1);
    };

    const chartData = uniqueMonths.map((month: any) => {
      const entry: any = { name: getMonthLabel(month), monthValue: month };
      visibleStateIds.forEach((stateId) => {
        const matches = data.filter((d: any) => d.month === month && d.stateOpportunityId === stateId);
        const total = matches.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);
        entry[`state_${stateId}`] = total;
      });
      return entry;
    });

    const tableRows = visibleStateIds.map((stateId) => {
      const meta = stateMeta[stateId];
      const rowData: any = { 
        id: stateId, 
        label: meta.label, 
        color: meta.color 
      };
      uniqueMonths.forEach((month: any) => {
        const matches = data.filter((d: any) => d.stateOpportunityId === stateId && d.month === month);
        const total = matches.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);
        rowData[month] = total > 0 ? total : 0;
      });
      return rowData;
    });

    return { chartData, tableRows, columns: uniqueMonths, uniqueStateIds: visibleStateIds, stateMeta };
  }, [data, activeMonth, selectedYear]);

  const toggleFilter = (month: number) => {
    setActiveMonth((prev) => (prev === month ? undefined : month));
  };

  const currencyFormatter = (value: number) => 
    value > 0 
      ? new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
      : ""; 
      
  const axisFormatter = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  const getMonthNameFull = (m: number) => {
    const date = new Date(selectedYear, m - 1, 1);
    return new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(date).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex h-[550px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="animate-spin text-slate-400 size-8" />
      </div>
    );
  }

  const stateColumnClass = activeMonth 
    ? "w-1/2 text-left py-3 px-4 font-bold border-b border-r border-slate-300 bg-slate-50"
    : "w-[200px] min-w-[200px] max-w-[200px] text-left py-3 px-4 font-bold border-b border-r border-slate-300 bg-slate-50 sticky left-0 z-10";
    
  const stateCellClass = (index: number) => activeMonth
    ? `w-1/2 py-3 px-4 font-semibold text-slate-700 border-r border-slate-300 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`
    : `w-[200px] min-w-[200px] max-w-[200px] py-3 px-4 font-semibold text-slate-700 border-r border-slate-300 sticky left-0 z-10 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;

  const footerStateClass = activeMonth
    ? "w-1/2 py-3 px-4 text-blue-800 text-right bg-blue-50 border-r border-blue-200"
    : "w-[200px] min-w-[200px] max-w-[200px] py-3 px-4 text-blue-800 text-right sticky left-0 bg-blue-50 z-10 border-r border-blue-200";

  return (
    <div className="flex flex-col w-full rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white shrink-0">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
             <CalendarRange className="size-5" />
            </div>
            <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                EVOLUCIÓN MENSUAL
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
                Comparativa de estados por mes ({selectedYear})
            </p>
            </div>
        </div>

        <div className="flex items-center gap-2">
             <select 
                value={selectedYear}
                onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setActiveMonth(undefined);
                }}
                className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none mr-2"
            >
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            {activeMonth && (
            <button
                onClick={() => setActiveMonth(undefined)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
            >
                <FilterX className="size-3" />
                Limpiar ({getMonthNameFull(activeMonth)})
            </button>
            )}
        </div>
      </div>

      <div className="w-full h-[400px] p-4 bg-white shrink-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              barGap={2} 
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false} 
                dy={10}
              />

              <YAxis 
                tickFormatter={axisFormatter}
                tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} 
                axisLine={false} 
                tickLine={false} 
              />
              
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs z-50">
                        <p className="font-bold text-slate-800 mb-2 border-b pb-1">{label} {selectedYear}</p>
                        {payload.map((entry: any) => (
                           entry.value > 0 && (
                            <div key={entry.name} className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-slate-500 capitalize">{entry.name}:</span>
                                <span className="font-mono font-semibold text-slate-700">{currencyFormatter(entry.value as number)}</span>
                            </div>
                           )
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {uniqueStateIds.map((stateId) => {
                  const meta = stateMeta[stateId];
                  return (
                    <Bar
                        key={stateId}
                        dataKey={`state_${stateId}`}
                        name={meta.label}
                        fill={meta.color}
                        radius={[4, 4, 0, 0]} 
                        barSize={uniqueStateIds.length > 3 ? 12 : 30}
                        onClick={(data: any) => toggleFilter(data.monthValue)} 
                        cursor="pointer"
                    >
                         {chartData.map((_entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={meta.color} />
                        ))}
                    </Bar>
                  );
              })}
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
            Sin datos disponibles en {selectedYear}
          </div>
        )}
      </div>

      <div className="bg-white px-4 py-3 border-t border-slate-100 shrink-0">
         <div className="flex flex-col gap-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Seleccionar Mes:
             </span>
             <div className="flex flex-wrap gap-2">
                {ALL_MONTHS.map((month) => {
                    const isActive = activeMonth === month;
                    const date = new Date(selectedYear, month - 1, 1);
                    const monthName = new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(date).toUpperCase();
                    
                    return (
                        <button
                            key={month}
                            onClick={() => toggleFilter(month)}
                            className={`
                                px-3 py-1 rounded text-[10px] font-bold border transition-all duration-200 uppercase
                                ${isActive 
                                    ? 'bg-blue-500 text-white border-blue-600 shadow-sm' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }
                            `}
                        >
                            {monthName}
                        </button>
                    )
                })}
                <button
                    onClick={() => setActiveMonth(undefined)}
                    className={`
                        px-3 py-1 rounded text-[10px] font-bold border transition-all duration-200
                        ${!activeMonth 
                            ? 'bg-slate-800 text-white border-slate-900 shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }
                    `}
                >
                    TODOS
                </button>
             </div>
         </div>
      </div>

      <div className="border-t border-slate-200 bg-white overflow-x-auto">
        <div className="min-w-[600px] p-5">
            <div className="flex items-center gap-2 mb-4 px-1">
                <div className="p-1 rounded bg-slate-100 text-slate-500">
                    <TableIcon className="size-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Matriz Mensual
                </h4>
            </div>
            
            <table className="w-full text-xs border-collapse rounded-lg overflow-hidden border border-slate-300 shadow-sm">
                <thead>
                    <tr>
                        <th className={`${stateColumnClass} text-slate-500`}>
                            ESTADO
                        </th>
                        {columns.map((month: any) => (
                            <th key={month} className={`${activeMonth ? 'w-1/2' : ''} text-center py-3 px-4 text-slate-500 font-bold border-b border-r border-slate-300 bg-slate-50`}>
                                {getMonthNameFull(month)}
                            </th>
                        ))}
                        {columns.length === 0 && <th className="py-3 px-4 bg-slate-50 border-b border-slate-300 w-auto"></th>}
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {tableRows.map((row, index) => (
                        <tr key={row.id} className={`transition-colors border-b border-slate-300 last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} hover:bg-blue-50/50`}>
                            <td className={stateCellClass(index)}>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: row.color }} />
                                    <span className="uppercase truncate">{row.label}</span>
                                </div>
                            </td>
                            {columns.map((month: any) => (
                                <td key={month} className={`${activeMonth ? 'w-1/2' : ''} text-right py-3 px-4 text-slate-600 font-mono border-r border-slate-300`}>
                                    {currencyFormatter(row[month])}
                                </td>
                            ))}
                            {columns.length === 0 && <td className="py-3 px-4 border-r border-slate-300"></td>}
                        </tr>
                    ))}
                    
                    <tr className="bg-blue-50/50 font-bold border-t-2 border-blue-200">
                        <td className={footerStateClass}>
                            TOTAL GENERAL
                        </td>
                        {columns.map((month: any) => {
                            const totalCol = tableRows.reduce((acc, row) => acc + (row[month] || 0), 0);
                            return (
                                <td key={month} className={`${activeMonth ? 'w-1/2' : ''} text-right py-3 px-4 text-blue-700 font-mono border-r border-blue-200`}>
                                    {currencyFormatter(totalCol)}
                                </td>
                            );
                        })}
                        {columns.length === 0 && <td className="py-3 px-4 border-r border-blue-200"></td>}
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
    </div>
  );
};