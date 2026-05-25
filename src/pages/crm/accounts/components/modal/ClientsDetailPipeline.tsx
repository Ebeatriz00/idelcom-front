import type { ClientDashboardPipelineDto } from "@/application";
import { Calendar, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";
import { useState } from "react";

interface Props {
  pipeline: ClientDashboardPipelineDto[];
}

const ITEMS_PER_PAGE = 4;

export function ClientsDetailPipeline({ pipeline }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = pipeline.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = pipeline.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const totalAmount = pipeline.reduce((acc, curr) => acc + curr.opportunityAmount, 0);

  const fmtMoney = (amount: number) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  const fmtDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
    });
  };

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="flex h-[420px] flex-col justify-between rounded-xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
      
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h3 className="text-sm font-bold text-blue-900">
          Oportunidades
        </h3>
        <span className="rounded bg-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-800">
          Total: {fmtMoney(totalAmount)}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {totalItems === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-blue-200 bg-white/50 text-center text-xs text-blue-400">
            <DollarSign className="mb-1 size-5 opacity-50" />
            <p>Sin oportunidades activas.</p>
          </div>
        ) : (
          <div className="grid h-full grid-cols-1 gap-3 md:grid-cols-2">
            {currentItems.map((opp) => (
              <div
                key={opp.opporId}
                className="flex flex-col justify-between rounded-lg border border-blue-100 bg-white p-3 shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <span
                      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide"
                      style={{
                        backgroundColor: `${opp.stateColor}15`,
                        color: opp.stateColor,
                      }}
                    >
                      {opp.stateDesc}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="size-2.5" />
                      {fmtDate(opp.finishDate)}
                    </span>
                  </div>

                  <h4 
                    className="line-clamp-2 text-xs font-bold leading-snug text-slate-800" 
                    title={opp.opporDesc}
                  >
                    {opp.opporDesc}
                  </h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">#{opp.opporId}</p>
                </div>

                <div className="mt-2 flex items-end justify-between border-t border-slate-50 pt-2">
                  <span className="text-sm font-bold text-slate-900">
                    {fmtMoney(opp.opportunityAmount)}
                  </span>
                  
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex shrink-0 items-center justify-between border-t border-blue-200/50 pt-2">
          <p className="text-[10px] text-blue-800">
             <span className="font-semibold">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</span> de {totalItems}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="flex size-6 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm hover:bg-blue-100 disabled:opacity-50"
            >
              <ChevronLeft className="size-3" />
            </button>
            
            <span className="text-[10px] font-semibold text-blue-900">
                {currentPage}/{totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="flex size-6 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm hover:bg-blue-100 disabled:opacity-50"
            >
              <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}