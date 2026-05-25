import { useDashboardMetricsQuotation } from "@/sharedKernel/hooks/dashboard/useDashboardCommercial";
import { Loader2, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,

  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export const CommercialQuotations = ({ usersId, quarter, year }: Props) => {
  const [selectedYear, setSelectedYear] = useState<number>(year || CURRENT_YEAR);
  
  const { data, isLoading } = useDashboardMetricsQuotation(usersId, quarter, selectedYear);

  const { chartData, metrics } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], metrics: null };

    const item = data[0];

    const chartData = [
      { 
        name: "TOTAL", 
        quantity: item.totalQty, 
        amount: item.totalAmount,
        color: "#6366f1" 
      },
      { 
        name: "GANADAS", 
        quantity: item.wonQty, 
        amount: item.wonAmount,
        color: "#10b981" 
      }
    ];

    return { chartData, metrics: item };
  }, [data]);

  const currencyFormatter = (value: number) => {
    if (!value) return "$0";
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex h-[550px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="animate-spin text-slate-400 size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white shrink-0">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <FileText className="size-5" />
            </div>
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                    Volumen de Cotizaciones
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                    Efectividad de cierre (Ganadas vs Totales)
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
                {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row w-full h-[400px]">
        
        <div className="w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/30 flex flex-col justify-center gap-6">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">

                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tasa de Efectividad</h4>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-800 tracking-tight">
                        {metrics?.conversionRate ?? 0}%
                    </span>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Conversion
                    </span>
                </div>
                <div className="mt-3 text-[11px] text-slate-500 leading-tight">
                    <strong>Eficiencia Operativa:</strong> De cada 10 cotizaciones presentadas, 
                    logras concretar exitosamente <strong>{Math.round((metrics?.conversionRate ?? 0) / 10)}</strong> negocio(s) cerrado(s).
                </div>
            </div>

            <div className="flex flex-col gap-1 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Monto Total Oportunidad</span>
                <span className="text-2xl font-mono font-bold text-slate-700">
                    {currencyFormatter(metrics?.totalAmount ?? 0)}
                </span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

             <div className="flex flex-col gap-1 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Monto Cerrado (Ganado)</span>
                <span className="text-2xl font-mono font-bold text-emerald-600">
                    {currencyFormatter(metrics?.wonAmount ?? 0)}
                </span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${metrics?.conversionRate ?? 0}%` }}
                    />
                </div>
            </div>

        </div>

        <div className="flex-1 p-4 bg-white relative">
            {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barSize={60}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                        axisLine={false} 
                        tickLine={false} 
                        dy={10}
                    />
                    <YAxis 
                        hide 
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs z-50 min-w-[150px]">
                                        <p className="font-bold text-slate-800 mb-2 border-b pb-1 flex items-center gap-2">
                                            <span className="size-2 rounded-full" style={{background: data.color}}/>
                                            {data.name}
                                        </p>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-slate-500">Cantidad:</span>
                                            <span className="font-bold text-slate-700">{data.quantity}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Monto:</span>
                                            <span className="font-mono font-bold text-slate-700">{currencyFormatter(data.amount)}</span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="quantity" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            ) : (
             <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
                Sin datos de cotizaciones para mostrar.
             </div>
            )}
            
            <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 italic">
                * Comparativa por cantidad de documentos
            </div>
        </div>
      </div>

      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
    </div>
  );
};