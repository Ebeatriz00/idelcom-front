import type { ClientsHistoryResponseDto } from "@/application";
import { CardContentDetail } from "@/layouts";
import { TimelineItem } from "@/pages/crm/opportunity/components/detail/ui/timelineItem";
import { Pager } from "@/pages/presale/presaleproyects/components/ui/pagination";
import { FileSymlink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
  data: ClientsHistoryResponseDto[];
  pageSize?: number;
};

function fmtDate(value?: Date | string | null) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClientsHistoryForm({ data, pageSize = 10 }: Props) {
  const [page, setPage] = useState(1);

  const items = useMemo(() => {
    const src = data ?? [];
    return [...src].sort(
      (a, b) =>
        new Date(b.changeAt ?? 0).getTime() -
        new Date(a.changeAt ?? 0).getTime()
    );
  }, [data]);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount, page]);

  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);

  return (
    <CardContentDetail className="p-0">
        <div className="p-4">
          {total === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No hay registros en el historial todavía.
            </p>
          ) : (
            <ol className="relative space-y-3 pb-2">
              {pageSlice.map((h, idx) => (
                <TimelineItem
                  key={h.eventId ?? `${idx}-${h.changeAt ?? "noDate"}`}
                  icon={<FileSymlink className="size-3.5 text-gray-700" />}
                  title={h.description}
                  desc={`Por ${h.changeUser ?? "Desconocido"} — ${fmtDate(
                    h.changeAt
                  )}`}
                  isLast={idx === pageSlice.length - 1 && page === pageCount}
                />
              ))}
            </ol>
          )}
        </div>

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
    </CardContentDetail>
  );
}
