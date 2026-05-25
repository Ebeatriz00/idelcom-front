import { useDashboardMetricsCombined } from "@/sharedKernel/hooks/dashboard/useDashboardCommercial";
import { Loader2, TrendingUp } from "lucide-react";
import { QuarterPie } from "./QuarterPie";

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

export const DashboardCombinedChart = ({ usersId, quarter, year }: Props) => {
  const { data, isLoading } = useDashboardMetricsCombined(
    usersId,
    quarter,
    year,
  );

  const quartersConfig = [
    { label: "Q1", value: 1 },
    { label: "Q2", value: 2 },
    { label: "Q3", value: 3 },
    { label: "Q4", value: 4 },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="animate-spin text-slate-400 size-8" />
      </div>
    );
  }

  const getDataForQuarter = (qNum: number) => {
    const items = data?.filter((d) => d.quarterNum === qNum) || [];
    const grouped: Record<
      string,
      { name: string; value: number; color: string }
    > = {};
    let total = 0;

    items.forEach((item) => {
      if (!grouped[item.stateName]) {
        grouped[item.stateName] = {
          name: item.stateName,
          value: 0,
          color: item.stateColor,
        };
      }
      grouped[item.stateName].value += item.quantity;
      total += item.quantity;
    });

    return { chartData: Object.values(grouped), total };
  };

  
  return (
    <div className="flex flex-col h-full rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 bg-white">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
          <TrendingUp className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
            Rendimiento Trimestral
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Evolución comparativa por periodos
          </p>
        </div>
      </div>

      <div className="p-3 flex-1 bg-white ">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quartersConfig.map((q) => {
            const { chartData, total } = getDataForQuarter(q.value);
            return (
              <QuarterPie
                key={q.label}
                label={q.label}
                chartData={chartData}
                total={total}
              />
            );
          })}
        </div>
      </div>

      <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 flex justify-center">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {Array.from(
            new Set(
              data?.map((d) =>
                JSON.stringify({ name: d.stateName, color: d.stateColor }),
              ),
            ),
          ).map((s) => {
            const item = JSON.parse(s as string);
            return (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  {item.name}
                </span>
              </div>
            );
          })}
          {(!data || data.length === 0) && (
            <span className="text-xs text-slate-400 italic">
              Esperando datos...
            </span>
          )}
        </div>
      </div>

      <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
    </div>
  );
};
