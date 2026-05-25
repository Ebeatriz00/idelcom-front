import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { useResizeObserver } from "../../hooks/useResizeObserver";

type ChartItem = { name: string; value: number; color: string };

type Props = {
  label: string;
  chartData: ChartItem[];
  total: number;
};

export function QuarterPie({ label, chartData, total }: Props) {
  const hasData = total > 0;
  const emptyData: ChartItem[] = [
    { name: "Sin actividad", value: 1, color: "#f3f4f6" },
  ];

  const { ref, width, height } = useResizeObserver<HTMLDivElement>();

  const size = Math.min(width, height);
  const w = Math.round(width);
  const h = Math.round(height);

  return (
    <div className="flex flex-col items-center min-w-0">
      <span className="text-xs font-bold text-slate-500 mb-3 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-100">
        {label}
      </span>

      <div
        ref={ref}
        className="relative w-full aspect-square min-w-0 max-w-40"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span
            className={`text-xl justify-center font-bold translate-y-0.5 ${hasData ? "text-slate-800" : "text-slate-300"}`}
          >
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
                formatter={(value) => [Number(value ?? 0), "Cantidad"]}
              />
            )}
          </PieChart>
        )}
      </div>
    </div>
  );
}
