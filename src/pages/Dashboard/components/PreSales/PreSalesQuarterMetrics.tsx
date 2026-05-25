import { useDashboardMetricsPreSalesCombined } from "@/sharedKernel/hooks/dashboard/useDashboardPreSales";
import { Loader2, TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { useResizeObserver } from "../../hooks/useResizeObserver";

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

const PreSalesQuarterPie = ({ label, chartData, total }: { label: string; chartData: any[]; total: number }) => {
    const { ref, width, height } = useResizeObserver<HTMLDivElement>();
    const hasData = total > 0;
    const emptyData = [{ name: "Sin actividad", value: 1, color: "#f3f4f6" }];
    
    const size = Math.min(width, height);
    const w = Math.round(width);
    const h = Math.round(height);

    return (
        <div className="flex flex-col items-center min-w-0 h-full">
            <span className="text-xs font-bold text-slate-500 mb-3 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-100">
                {label}
            </span>

            <div ref={ref} className="relative w-full aspect-square min-w-0 max-w-[160px]">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className={`text-xl font-bold translate-y-[2px] ${hasData ? "text-slate-800" : "text-slate-300"}`}>
                        {total}
                    </span>
                </div>

                {width > 0 && height > 0 && (
                    <PieChart width={w} height={h}>
                        <Pie
                            data={hasData ? chartData : emptyData}
                            cx={w / 2}
                            cy={h / 2}
                            innerRadius={Math.round(size * 0.26)}
                            outerRadius={Math.round(size * 0.38)}
                            paddingAngle={hasData ? 4 : 0}
                            dataKey="value"
                            cornerRadius={3}
                            stroke="none"
                            isAnimationActive
                        >
                            {hasData ? (
                                chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))
                            ) : (
                                <Cell key="empty" fill="#f3f4f6" />
                            )}
                        </Pie>
                        {hasData && (
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "none",
                                    fontSize: "12px",
                                    boxShadow: "0 4px 10px -1px rgb(0 0 0 / 0.1)",
                                }}
                            />
                        )}
                    </PieChart>
                )}
            </div>
        </div>
    );
};

export const DashboardPreSalesQuarterMetrics = ({ usersId, quarter, year }: Props) => {
  const { data, isLoading } = useDashboardMetricsPreSalesCombined(usersId, quarter, year);

  const quartersConfig = [
    { label: "Q1", value: 1 },
    { label: "Q2", value: 2 },
    { label: "Q3", value: 3 },
    { label: "Q4", value: 4 },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="animate-spin text-emerald-500 size-8" />
      </div>
    );
  }

  const getDataForQuarter = (qNum: number) => {
    const items = data?.filter((d: any) => d.quarterNum === qNum) || [];
    let total = 0;
    const chartData = items.map((item: any) => {
      const qty = Number(item.quantity || item.QUANTITY || 0);
      total += qty;
      return { name: item.stateName, value: qty, color: item.stateColor };
    });
    return { chartData, total };
  };

  return (
    <div className="flex flex-col w-full h-full rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 bg-white shrink-0">
        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
             <TrendingUp className="size-5" />
        </div>
        <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">Rendimiento Trimestral</h3>
            <p className="text-[11px] text-slate-400 font-medium">Evolución comparativa por periodos</p>
        </div>
      </div>

      <div className="flex-1 bg-white p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quartersConfig.map((q) => {
            const { chartData, total } = getDataForQuarter(q.value);
            return (
              <PreSalesQuarterPie
                key={q.label}
                label={q.label}
                chartData={chartData}
                total={total}
              />
            );
          })}
        </div>
      </div>

      <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 flex justify-center shrink-0">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {Array.from(new Set(data?.map(d => JSON.stringify({name: d.stateName, color: d.stateColor})))).map((s: any) => {
               const item = JSON.parse(s);
               return (
                 <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">{item.name}</span>
                 </div>
               )
            })}
          </div>
      </div>
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>
    </div>
  );
};