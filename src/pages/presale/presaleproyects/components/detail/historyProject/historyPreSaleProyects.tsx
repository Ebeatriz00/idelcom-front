
import { CardContentDetail } from "@/layouts";
import { fmtDate } from "@/sharedKernel";
import { ChevronDown, FileSymlink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TimelineItem } from "../../ui/timelineItem";
import { Pager } from "../../ui/pagination";
import type { PreSaleProyectsDetailDto } from "@/application/dtos/presale/PreSaleProyectsDetail.dto";


type Props = {
  data: PreSaleProyectsDetailDto;
  pageSize?: number;
};

export default function HistoryProject({ data, pageSize = 5 }: Props) {
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(1);

  const today = () => new Date().toLocaleDateString("es-PE");

  const items = useMemo(() => {
    const src = data.historyChanges ?? [];
    return [...src].sort(
      (a, b) =>
        new Date(b.dateChange ?? 0).getTime() -
        new Date(a.dateChange ?? 0).getTime()
    );
  }, [data.historyChanges]);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);

  return (
    <CardContentDetail className="p-0">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div
          className="h-1.5"
          style={{
            background: "linear-gradient(90deg, var(--brand,#FF6F00), #FFB74D)",
            boxShadow: "0 0 12px rgba(255, 111, 0, 0.25)",
          }}
        />

        {/* Header */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="group w-full flex items-center justify-between px-6 py-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
          aria-expanded={open}
          aria-controls="panel-history"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-800 tracking-tight">
              Historial de Cambios
            </h2>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 border border-gray-200">
              {total}
            </span>
          </div>
          <ChevronDown
            className={`size-5 text-gray-500 transition-transform duration-300 group-hover:text-gray-700 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* Contenido */}
        <div
          id="panel-history"
          className={`transition-all duration-300 overflow-hidden ${
            open
              ? "max-h-[2000px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="p-4">
            {total === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay registros en el historial todavía.
              </p>
            ) : (
              <ol className="relative space-y-3 pb-2">
                {pageSlice.map((h, idx) => (
                  <TimelineItem
                    key={`${idx}-${h.dateChange ?? "noDate"}`} 
                    icon={<FileSymlink className="size-3.5 text-gray-700" />}
                    title={h.history ?? ""}
                    desc={`Por ${h.usersName ?? "Desconocido"} — ${
                      fmtDate(h.dateChange) ?? today()
                    }`}
                    isLast={idx === pageSlice.length - 1 && page === pageCount}
                  />
                ))}
              </ol>
            )}
          </div>

          {/* Paginador */}
          <div className="mt-3 border-t border-gray-100 px-4 py-3">
            <Pager
              page={page}
              pageCount={pageCount}
              total={total}
              showingFrom={showingFrom}
              showingTo={showingTo}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
            />
          </div>
        </div>
      </div>
    </CardContentDetail>
  );
}
