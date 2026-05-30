import type { OrdersResponseDto } from "@/application/dtos/operations/orders/orders.dto";
import { InputSea } from "@/layouts";
import { useDebouncedValue } from "@/sharedKernel";
import { useOrdersList } from "@/sharedKernel/hooks/operations/orders/useOrders";
import { Briefcase, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface AsideOrdersProps {
  selectedId?: number;
  onSelect: (order: OrdersResponseDto) => void;
}

export function AsideOrders({ selectedId, onSelect }: AsideOrdersProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 12,
  });

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { data, isFetching } = useOrdersList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
  );

  const list = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((order) => order.typeOppor !== "2");
  }, [data]);

  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? Math.max(1, Math.ceil(total / pagination.pageSize));
  const isEmpty = !isFetching && list.length === 0;

  return (
    <aside className="h-full min-w-0 xl:sticky xl:top-4">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white text-card-foreground shadow-sm">
        <header className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-700">
                Operaciones
              </p>
              <h2 className="mt-1 text-base font-black text-slate-950 tracking-tight">
                Ordenes de Servicio
              </h2>
            </div>
            <span className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-600">
              {total}
            </span>
          </div>

          <div className="relative mt-4">
            <InputSea
              placeholder="Buscar por descripcion o numero..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </header>

        <div className="flex flex-col p-3 pt-3 sm:p-4">
          <div className="overflow-auto rounded-lg border border-slate-200 bg-white shadow-inner-sm max-h-[36vh] sm:max-h-[44vh] xl:max-h-[calc(100vh-278px)]">
            {isFetching && list.length === 0 ? (
              <ul className="divide-y divide-slate-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="px-4 py-4">
                    <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-50" />
                  </li>
                ))}
              </ul>
            ) : isEmpty ? (
              <div className="flex flex-col items-center px-4 py-10 text-center text-sm text-slate-500">
                <Briefcase className="mb-2 h-8 w-8 text-slate-300" />
                Sin resultados.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {list.map((order) => {
                  const isSelected = selectedId === order.operationsId;

                  return (
                    <li key={order.operationsId}>
                      <button
                        type="button"
                        onClick={() => onSelect(order)}
                        className={[
                          "min-h-[84px] w-full px-4 py-4 text-left transition",
                          "hover:bg-blue-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
                          isSelected
                            ? "border-l-4 border-l-blue-700 bg-blue-50"
                            : "border-l-4 border-l-transparent",
                        ].join(" ")}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                              N° {order.opporNum}
                            </span>
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: order.stateColor || "#10b981" }}
                            />
                          </div>
                          <p
                            className={`truncate text-sm font-semibold ${
                              isSelected ? "text-blue-950" : "text-slate-700"
                            }`}
                          >
                            {order.opporDesc}
                          </p>
                          <p className="truncate text-[11px] font-medium text-slate-400">
                            {order.clientsName || "Sin cliente"}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-semibold">
              {isFetching ? "Actualizando..." : `${total} registros`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Pagina anterior"
                className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.max(0, p.pageIndex - 1),
                  }))
                }
                disabled={pagination.pageIndex <= 0 || isFetching}
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="min-w-[54px] text-center font-black text-slate-700">
                {pageCount === 0 ? 0 : pagination.pageIndex + 1} / {pageCount}
              </span>
              <button
                type="button"
                aria-label="Pagina siguiente"
                className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.min(pageCount - 1, p.pageIndex + 1),
                  }))
                }
                disabled={pagination.pageIndex + 1 >= pageCount || isFetching}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}
