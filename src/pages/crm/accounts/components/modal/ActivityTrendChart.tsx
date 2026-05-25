import { useState, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer, 
} from "recharts";
import type { ClientActivityResponseDto } from "@/application";

interface Props {
  activities: ClientActivityResponseDto[];
}

type FilterType = "3m" | "6m" | "1y";

export function ActivityTrendChart({ activities }: Props) {
  const [filter, setFilter] = useState<FilterType>("6m");

  const chartData = useMemo(() => {
    const monthsToGoBack = filter === "3m" ? 3 : filter === "6m" ? 6 : 12;
    const dataPoints = [];
    const today = new Date();

    for (let i = monthsToGoBack - 1; i >= 0; i--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      const activitiesInMonth = activities.filter((act) => {
        const actDate = new Date(act.finishDate.replace('Z', ''));
        return (
          actDate.getMonth() === targetDate.getMonth() &&
          actDate.getFullYear() === targetDate.getFullYear()
        );
      });

      const breakdown: Record<string, number> = {};
      activitiesInMonth.forEach((act) => {
        const typeName = act.activity || "Otros";
        breakdown[typeName] = (breakdown[typeName] || 0) + 1;
      });

      dataPoints.push({
        monthName: targetDate.toLocaleDateString("es-PE", { month: "short" }).toUpperCase().replace(".", ""),
        total: activitiesInMonth.length,
        breakdown: breakdown,
      });
    }

    return dataPoints;
  }, [activities, filter]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Volumen de Actividad
          </h3>
          <p className="text-sm text-slate-500">
            Interacciones realizadas en el tiempo
          </p>
        </div>

        <div className="flex rounded-lg bg-slate-100 p-1">
          {(["3m", "6m", "1y"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f === "3m" ? "3 Meses" : f === "6m" ? "6 Meses" : "1 Año"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="monthName" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              dy={10}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            
            <Area
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorActivity)"
              name="Actividades"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const breakdown = data.breakdown || {};
    const hasData = data.total > 0;

    return (
      <div className="pointer-events-none rounded-lg border border-slate-100 bg-white p-3 shadow-lg ring-1 ring-black/5 min-w-[140px] z-50">
        <p className="mb-2 border-b border-slate-50 pb-2 text-xs font-bold text-slate-700 uppercase">
          {label}
        </p>
        
        <div className="mb-2 flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-700">Total:</span>
          <span className="text-sm font-bold text-blue-600">{data.total}</span>
        </div>

        {hasData ? (
          <div className="space-y-1.5">
            {Object.entries(breakdown).map(([type, count]) => {
              let icon = "•";
              const t = (type as string).toLowerCase();
              if (t.includes("correo") || t.includes("email")) icon = "📧";
              else if (t.includes("llamada") || t.includes("tel")) icon = "📞";
              else if (t.includes("reunión") || t.includes("cita")) icon = "📅";
              else if (t.includes("whatsapp")) icon = "💬";

              return (
                <div key={type} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600 truncate">
                    <span className="opacity-80 text-[10px]">{icon}</span> {type}
                  </span>
                  <span className="font-bold text-slate-800">
                    {count as number}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 italic">Sin actividad</p>
        )}
      </div>
    );
  }
  return null;
};