import type { SalesQuotationVerResponse } from "@/application";
import { StateBadge } from "@/layouts";
import { useDebouncedValue, useQuotationVerList } from "@/sharedKernel";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Select } from "../components/SelectQuotation";

type StatusFilter =
  | "all"
  | "DRAFT"
  | "SENT"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

type Props = {
  quotationId: string;
  selectedVerId: string;
  onSelect: (v: SalesQuotationVerResponse) => void;
};

function formatDateTime(date?: Date | string | null) {
  if (!date) return "";

  const d = date instanceof Date ? date : new Date(date);

  return new Intl.DateTimeFormat("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function QuotationVersionsAside({
  quotationId,
  selectedVerId,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 300);

  const [status, setStatus] = useState<StatusFilter>("all");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // reset page cuando cambia búsqueda / cotización / status
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debounced, quotationId, status]);

  const { data, isLoading } = useQuotationVerList(
    quotationId,
    pagination.pageIndex,
    pagination.pageSize,
    debounced
  );

  const rows = useMemo(() => data?.items ?? [], [data]);

  const rowsFiltered = useMemo(() => {
    if (status === "all") return rows;
    return rows.filter((r) => r.versionStatus === status);
  }, [rows, status]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));
  const canPrev = pagination.pageIndex > 0;
  const canNext = pagination.pageIndex + 1 < totalPages;

  const existsInPage = useMemo(
    () =>
      !!selectedVerId &&
      rowsFiltered.some((x) => x.quotationVerId === selectedVerId),
    [rowsFiltered, selectedVerId]
  );

  useEffect(() => {
    if (rowsFiltered.length === 0) return;

    const current = rowsFiltered.find(
      (x) => x.quotationVerId === selectedVerId
    );

    if (!current) {
      onSelect(rowsFiltered[0]);
    }
  }, [rowsFiltered, existsInPage, selectedVerId, onSelect]);

  console.log(selectedVerId);

  const goPrev = () =>
    setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }));

  const goNext = () =>
    setPagination((p) => ({
      ...p,
      pageIndex: Math.min(totalPages - 1, p.pageIndex + 1),
    }));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-zinc-200 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-zinc-900">
            Versiones de cotización
          </div>

          {/*<IconBtn title="Nuevo">
            <Plus className="h-4 w-4" />
            Nuevo
          </IconBtn>*/}
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por versión, total…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={status}
              onChange={(v) => setStatus(v as StatusFilter)}
              options={[
                { value: "all", label: "All" },
                { value: "DRAFT", label: "Draft" },
                { value: "SENT", label: "Sent" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
            {/*<IconBtn title="Export list">
              <Download className="h-4 w-4" />
              Export
            </IconBtn>*/}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-zinc-100">
        {isLoading ? (
          <div className="p-4 text-sm text-zinc-500">Cargando…</div>
        ) : rowsFiltered.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500">
            No results.
          </div>
        ) : (
          rowsFiltered.map((v: SalesQuotationVerResponse) => {
            const active = v.quotationVerId === selectedVerId;

            const total = Number(v.total ?? 0);
            const sym = v.currencySymbol ?? "";
            const formatted = new Intl.NumberFormat("es-PE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(total);
            return (
              <button
                key={v.quotationVerId}
                onClick={() => onSelect(v)}
                className={[
                  "w-full p-3 text-left hover:bg-zinc-50",
                  active ? "bg-blue-50" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-900">
                      {v.quotationNo}
                    </div>

                    <div
                      className="truncate text-xs text-zinc-600"
                      title={v.clientsName} // tooltip nativo
                    >
                      {v.clientsName}
                    </div>

                    <div className="mt-1 truncate text-xs text-zinc-500">
                      Owner: {v.workerResponsible} · {v.versionNo}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-zinc-900">
                      {sym}
                      {formatted}
                    </div>

                    <div className="mt-1 inline-flex justify-end">
                      <StateBadge
                        desc={v.versionStatus}
                        colorKey={v.versionColor}
                      />
                    </div>

                    <div className="text-[11px] text-zinc-500 whitespace-nowrap tabular-nums">
                      {formatDateTime(v.createdDate)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="border-t border-zinc-200 p-3 flex items-center justify-between gap-2">
        <div className="text-xs text-zinc-500">
          Página {pagination.pageIndex + 1} de {totalPages} • {total} registros
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={!canPrev || isLoading}
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={goNext}
            disabled={!canNext || isLoading}
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {/* Actions 
      <div className="border-t border-zinc-200 p-4 space-y-2">
        <div className="text-xs font-semibold text-zinc-600">
          Acciones de versión
        </div>
        <div className="grid grid-cols-2 gap-2">
          <IconBtn title="Clonar versión">
            <Copy className="h-4 w-4" />
            Clonar
          </IconBtn>
          <IconBtn title="Recalcular">
            <Gauge className="h-4 w-4" />
            Recalcular
          </IconBtn>
          <IconBtn title="Exportar PDF">
            <Printer className="h-4 w-4" />
            PDF
          </IconBtn>
          <IconBtn title="Exportar Excel">
            <Download className="h-4 w-4" />
            Excel
          </IconBtn>
        </div>
      </div>*/}
    </div>
  );
}
