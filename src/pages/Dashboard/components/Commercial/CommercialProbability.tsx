import { useExerciesOptions } from "@/sharedKernel/hooks/accounting/useExerPer";
import { useDashboardMetricsProbability } from "@/sharedKernel/hooks/dashboard/useDashboardCommercial";
import { FilterX, Loader2, Table as TableIcon, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useResizeObserver } from "../../hooks/useResizeObserver";

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

const PROBABILITY_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const STATE_BACKUP_CONFIG: Record<number, string> = {
  1: "EN PROCESO",
  2: "OPORTUNIDAD",
  3: "ENVIADA",
  4: "PERDIDA",
  5: "GANADA",
  6: "STANDBY",
};

const STATE_COLORS: Record<number, string> = {
  1: "#60a5fa",
  2: "#eab308",
  3: "#f97316",
  4: "#94a3b8",
  5: "#10b981",
  6: "#84cc16",
};

export const DashboardProbabilityChart = ({
  usersId,
  quarter,
  year,
}: Props) => {
  const { data: yearsData } = useExerciesOptions(1, "", 2000);
  const years = yearsData?.items ?? [];

  const CURRENT_YEAR = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<number>(
    year || CURRENT_YEAR,
  );
  const [activeProbability, setActiveProbability] = useState<
    number | undefined
  >(undefined);

  const { data, isLoading } = useDashboardMetricsProbability(
    usersId,
    quarter,
    activeProbability,
    selectedYear,
  );

  const { ref, width, height } = useResizeObserver<HTMLDivElement>();

  const { chartData, tableRows, columns, uniqueStateIds, stateMeta } =
    useMemo(() => {
      if (!data)
        return {
          chartData: [],
          tableRows: [],
          columns: [],
          uniqueStateIds: [],
          stateMeta: {},
        };

      const stateMeta: Record<number, { label: string; color: string }> = {};

      data.forEach((item: any) => {
        const id = item.stateOpportunityId;
        if (!stateMeta[id]) {
          const nameFromBack = item.stateDesc;
          const nameFromConfig = STATE_BACKUP_CONFIG[id];
          stateMeta[id] = {
            label: nameFromBack || nameFromConfig || `Estado ${id}`,
            color: item.stateColor || STATE_COLORS[id] || "#94a3b8",
          };
        }
      });

      const uniqueStates = Object.keys(stateMeta).map(Number);
      const uniqueProbs = Array.from(
        new Set(data.map((d: any) => d.porcentProgressPro)),
      ).sort((a: any, b: any) => a - b);

      const chartData = uniqueProbs.map((prob) => {
        const entry: any = { name: `${prob}%`, probValue: prob };
        uniqueStates.forEach((stateId) => {
          const item = data.find(
            (d: any) =>
              d.porcentProgressPro === prob && d.stateOpportunityId === stateId,
          );
          entry[`state_${stateId}`] = item ? item.totalAmount : 0;
        });
        return entry;
      });

      const tableRows = uniqueStates.map((stateId) => {
        const meta = stateMeta[stateId];
        const rowData: any = {
          id: stateId,
          label: meta.label,
          color: meta.color,
        };
        uniqueProbs.forEach((prob) => {
          const item = data.find(
            (d: any) =>
              d.stateOpportunityId === stateId && d.porcentProgressPro === prob,
          );
          rowData[prob] = item ? item.totalAmount : 0;
        });
        return rowData;
      });

      return {
        chartData,
        tableRows,
        columns: uniqueProbs,
        uniqueStateIds: uniqueStates,
        stateMeta,
      };
    }, [data]);

  const toggleFilter = (prob: number) => {
    setActiveProbability((prev) => (prev === prob ? undefined : prob));
  };

  const axisFormatter = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  const currencyFormatter = (value?: number) => {
    if (!value || value === 0) return "";
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    if (!years.length) return;
    const exists = years.some((y) => Number(y.value) === CURRENT_YEAR);

    if (!exists) {
      setSelectedYear(Number(years[0].value));
    }
  }, [years]);

  if (isLoading) {
    return (
      <div className="flex h-[550px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="animate-spin text-slate-400 size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
              PROBABILIDADES
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Volumen de oportunidades por estado y probabilidad
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all cursor-pointer"
          >
            {years.map((y) => (
              <option key={y.value} value={Number(y.value)}>
                {y.label}
              </option>
            ))}
          </select>

          {activeProbability && (
            <button
              onClick={() => setActiveProbability(undefined)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
            >
              <FilterX className="size-3" />
              Limpiar ({activeProbability}%)
            </button>
          )}
        </div>
      </div>

      <div ref={ref} className="w-full h-[400px] p-4 bg-white shrink-0 min-w-0">
        {chartData.length > 0 ? (
          width > 0 && height > 0 ? (
            <BarChart
              width={width}
              height={height}
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              barGap={2}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tickFormatter={axisFormatter}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs z-50">
                        <p className="font-bold text-slate-800 mb-2 border-b pb-1">
                          Probabilidad: {label}
                        </p>
                        {payload.map(
                          (entry: any) =>
                            entry.value > 0 && (
                              <div
                                key={entry.name}
                                className="flex items-center gap-2 mb-1"
                              >
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-slate-500 capitalize">
                                  {entry.name}:
                                </span>
                                <span className="font-mono font-semibold text-slate-700">
                                  {currencyFormatter(entry.value as number)}
                                </span>
                              </div>
                            ),
                        )}
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
                    onClick={(d: any) => toggleFilter(d.probValue)}
                    cursor="pointer"
                  />
                );
              })}
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              />
            </BarChart>
          ) : null
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
            Sin datos disponibles
          </div>
        )}
      </div>

      <div className="bg-white px-4 py-3 border-t border-slate-100 shrink-0">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Seleccionar Probabilidad:
          </span>
          <div className="flex flex-wrap gap-2">
            {PROBABILITY_OPTIONS.map((prob) => {
              const isActive = activeProbability === prob;
              return (
                <button
                  key={prob}
                  onClick={() => toggleFilter(prob)}
                  className={`
                                px-3 py-1 rounded text-[10px] font-bold border transition-all duration-200
                                ${
                                  isActive
                                    ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                }
                            `}
                >
                  {prob}%
                </button>
              );
            })}
            <button
              onClick={() => setActiveProbability(undefined)}
              className={`
                        px-3 py-1 rounded text-[10px] font-bold border transition-all duration-200
                        ${
                          !activeProbability
                            ? "bg-slate-800 text-white border-slate-900 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
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
              Matriz de Datos
            </h4>
          </div>

          <table className="w-full text-xs border-collapse rounded-lg overflow-hidden border border-slate-300 shadow-sm">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 text-slate-500 font-bold border-b border-r border-slate-300 bg-slate-50 sticky left-0 z-10">
                  ESTADO
                </th>
                {columns.map((prob) => (
                  <th
                    key={prob}
                    className="text-center py-3 px-4 text-slate-500 font-bold border-b border-r border-slate-300 bg-slate-50"
                  >
                    {prob}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {tableRows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`
                                transition-colors border-b border-slate-300 last:border-0
                                ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"} 
                                hover:bg-blue-50/50
                            `}
                >
                  <td
                    className={`py-3 px-4 font-semibold text-slate-700 border-r border-slate-300 sticky left-0 z-10 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="uppercase">{row.label}</span>
                    </div>
                  </td>
                  {columns.map((prob) => (
                    <td
                      key={prob}
                      className="text-right py-3 px-4 text-slate-600 font-mono border-r border-slate-300"
                    >
                      {currencyFormatter(row[prob])}
                    </td>
                  ))}
                </tr>
              ))}

              <tr className="bg-orange-50/50 font-bold border-t-2 border-orange-200">
                <td className="py-3 px-4 text-orange-800 text-right sticky left-0 bg-orange-50 z-10 border-r border-orange-200">
                  TOTAL GENERAL
                </td>
                {columns.map((prob) => {
                  const totalCol = tableRows.reduce(
                    (acc: number, row: any) => acc + (row[prob] || 0),
                    0,
                  );
                  return (
                    <td
                      key={prob}
                      className="text-right py-3 px-4 text-orange-700 font-mono border-r border-orange-200"
                    >
                      {currencyFormatter(totalCol)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500"></div>
    </div>
  );
};
