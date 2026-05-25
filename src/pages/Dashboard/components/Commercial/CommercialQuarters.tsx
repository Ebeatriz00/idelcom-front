import { useDashboardMetricsQuarter } from "@/sharedKernel/hooks/dashboard/useDashboardCommercial";
import { 
  Loader2, 
  TrendingUp, 
} from "lucide-react";

const QUARTERS = [
  { 
    id: 1, 
    label: "Q1", 
    dates: "Ene - Mar", 
    iconColor: "text-sky-600",
    bgColor: "bg-sky-50",
    gradientLine: "from-sky-500 to-blue-600",
    icon: TrendingUp 
  }, 
  { 
    id: 2, 
    label: "Q2", 
    dates: "Abr - Jun", 
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    gradientLine: "from-emerald-500 to-teal-600",
    icon: TrendingUp 
  }, 
  { 
    id: 3, 
    label: "Q3", 
    dates: "Jul - Sep", 
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50",
    gradientLine: "from-amber-500 to-orange-600",
    icon: TrendingUp 
  }, 
  { 
    id: 4, 
    label: "Q4", 
    dates: "Oct - Dic", 
    iconColor: "text-rose-600",
    bgColor: "bg-rose-50",
    gradientLine: "from-rose-500 to-red-600",
    icon: TrendingUp 
  }, 
];

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

export const DashboardQuarterMetrics = ({ usersId, quarter, year }: Props) => {
  const { data, isLoading } = useDashboardMetricsQuarter(usersId, quarter, year);

  if (isLoading) {
    return (
      <div className="flex w-full justify-center items-center h-32 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <Loader2 className="animate-spin text-gray-400 size-6" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 w-full h-full">
      {QUARTERS.map((q) => {
        const metric = data?.find((d) => d.quarterNum === q.id);
        const quantity = metric?.quantity ?? 0;
        const Icon = q.icon;

        return (
          <div
            key={q.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {q.label}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {q.dates}
                  </span>
                </div>
                
                <div className={`p-2 rounded-lg ${q.bgColor} ${q.iconColor} transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className="size-5" strokeWidth={2.5} />
                </div>
              </div>

              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-gray-800 tracking-tight font-mono">
                   {new Intl.NumberFormat('es-PE').format(quantity)}
                </span>
              </div>
            </div>

            <div className={`h-1 w-full bg-gradient-to-r ${q.gradientLine} opacity-80`} />
          </div>
        );
      })}
    </div>
  );
};