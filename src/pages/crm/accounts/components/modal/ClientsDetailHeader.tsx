import type { ClientDashboardHeaderDto } from "@/application";
import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import { Building2, MapPin } from "lucide-react";

interface Props {
  header: ClientDashboardHeaderDto;
}

export function ClientsDetailHeader({ header }: Props) {
  const fmtMoney = (amount: number) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();


  const getWinRateColor = (rate: number) => {
    if (rate >= 50) return "text-emerald-600"; 
    if (rate >= 20) return "text-amber-600";  
    return "text-rose-600";                   
  };

  const getLastActivityText = (dateStr?: string | Date | null) => {
    if (!dateStr) return "Sin actividad";
    
    const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    if (!isValid(date)) return "-";

    const daysAgo = differenceInCalendarDays(new Date(), date);
    

    if (daysAgo === 0) return "Hoy";
    if (daysAgo === 1) return "Ayer";
    if (daysAgo < 0) return "Futuro";
    
    return `Hace ${daysAgo} días`;
  };

  return (
    <header className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-200">
          {getInitials(header.clientsName)}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {header.clientsName}
          </h1>
          
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500">
            {header.clientAddress ? (
              <span className="flex items-center gap-1">
                <MapPin className="size-4" /> {header.clientAddress}
              </span>
            ) : (
              <span className="flex items-center gap-1 opacity-60">
                <MapPin className="size-4" /> Sin dirección
              </span>
            )}

            {header.departamentName && (
              <span className="flex items-center gap-1">
                <Building2 className="size-4" /> {header.departamentName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 md:grid-cols-3 lg:grid-cols-5">
        
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Valor Total (LTV)
          </div>
          <div className="mt-1 text-xl font-bold text-slate-800">
            {fmtMoney(header.ltvTotalAmount)}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Oportunidades
          </div>
          <div className="mt-1 text-xl font-bold text-blue-600">
            {header.openOppCount}{" "}
            {header.openOppAmount > 0 && (
              <span className="text-xs font-normal text-slate-400">
                ({fmtMoney(header.openOppAmount)})
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            N° de Cotizaciones
          </div>
          <div className="mt-1 text-xl font-bold text-slate-800">
            {header.totalQuotes}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tasa de Cierre
          </div>
          <div className={`mt-1 text-xl font-bold ${getWinRateColor(header.winRate)}`}>
            {Number(header.winRate).toLocaleString('es-PE', { maximumFractionDigits: 1 })}%
          </div>
        </div>

        <div className="col-span-2 md:col-span-1"> 
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Última Actividad
          </div>
          <div className="mt-1 pt-1 font-bold text-slate-800 text-sm md:text-xl">
            {getLastActivityText(header.lastActivityAt)}
          </div>
        </div>

      </div>
    </header>
  );
}