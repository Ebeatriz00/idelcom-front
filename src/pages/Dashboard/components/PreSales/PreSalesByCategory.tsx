import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Loader2, Target, Info } from "lucide-react";
import { useDashboardMetricsPreSalesCategory } from '@/sharedKernel/hooks/dashboard/useDashboardPreSales';
import { useNavigate } from "react-router-dom";

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

export const DashboardPreSalesByCategoryChart = ({ usersId, quarter, year }: Props) => {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboardMetricsPreSalesCategory(usersId, quarter, year);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item) => {
      const value = Number(item.totalAmount) || 0;
      const won = Number(item.wonAmount) || 0;
      const qty = Number(item.projectQuantity) || 0;
      const originalName = item.categoryName || '';

      const normalizedName = originalName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      let fill = '#64748b';
      let categoryId: number | undefined = undefined;

      if (normalizedName.includes('estrat')) {
        fill = '#059669';
        categoryId = 1;
      } else if (normalizedName.includes('complemen')) {
        fill = '#7c3aed';
        categoryId = 2;
      }

      return { name: originalName, value, won, qty, fill, categoryId };
    });
  }, [data]);

  const totalAmount = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const currencyFormatter = (value: number) => {
    if (!value || value === 0) return "$0.00";
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCategoryClick = (categoryId?: number) => {
    if (categoryId) {
      navigate(`/presale/presaleproyects/presaleproyects?category=${categoryId}&f_opportunityStateDesc=GANADO`);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[480px] flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
        <Loader2 className="animate-spin text-emerald-500 size-8" />
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const sliceColor = payload[0].payload.fill;

      return (
        <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-xl min-w-[240px]">
          <p className="text-[11px] font-black text-slate-500 uppercase mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Target className="size-3" style={{ color: sliceColor }} />
            {item.name}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs gap-4">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sliceColor }}></span>
                Monto Cotizado:
              </span>
              <span className="font-bold text-slate-800 whitespace-nowrap">
                {currencyFormatter(item.value)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs gap-4">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0ea5e9' }}></span>
                Monto Ganado:
              </span>
              <span className="font-bold text-sky-600 whitespace-nowrap">
                {currencyFormatter(item.won)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2 gap-4">
              <span className="text-[11px] text-slate-500 font-medium">Proyectos:</span>
              <span className="text-xs font-black text-amber-600 whitespace-nowrap">{item.qty} proyectos</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 mt-3 text-center italic">Clic para ver detalle</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={chartData[index]?.fill}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-[12px] font-black tracking-wide cursor-pointer"
        onClick={() => handleCategoryClick(chartData[index]?.categoryId)}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[480px] w-full relative overflow-hidden">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Target className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Inversión por Categoría</h3>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Info className="size-3" />
                Distribución del esfuerzo de cotización
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[350px] w-full p-2 pt-0 pb-8">
          {!chartData || chartData.length === 0 || totalAmount === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Target className="size-10 text-slate-200 mt-6" />
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider text-center px-4">
                No hay datos para mostrar en este periodo
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={90}
                  outerRadius={135}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                  isAnimationActive={true}
                  cornerRadius={4}
                  label={renderCustomizedLabel}
                  labelLine={{ strokeWidth: 1.5, stroke: '#cbd5e1' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      onClick={() => handleCategoryClick(entry.categoryId)} // <-- CLICK EN LA DONA
                      className="cursor-pointer hover:opacity-80 transition-opacity outline-none"
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', fontWeight: '600', color: '#64748b', paddingTop: '30px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-600" />
      </div>

      {chartData.length > 0 && totalAmount > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col w-full relative overflow-hidden p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {chartData.map((item) => (
              <div
                key={item.name}
                onClick={() => handleCategoryClick(item.categoryId)}
                className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
              >
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                <div className="flex justify-between items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-slate-800">{currencyFormatter(item.value)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-600" />
        </div>
      )}

    </div>
  );
};