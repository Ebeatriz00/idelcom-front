import type { OrdersResponseDto } from "@/application/dtos/operations/orders/orders.dto";
import {
  Button,
  CardContent,
  CardHeader,
  CardSimple,
  CardTitle,
  InputSea,
} from "@/layouts";
import { useDebouncedValue } from "@/sharedKernel";
import { useOrdersList } from "@/sharedKernel/hooks/operations/orders/useOrders";
import { Briefcase, Search } from "lucide-react";
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
    return data.items.filter(order => order.typeOppor !== '2');
  }, [data]);
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? Math.max(1, Math.ceil(total / pagination.pageSize));

  const isEmpty = !isFetching && list.length === 0;

  return (
    <aside className="space-y-3 h-full flex flex-col">
      <CardSimple className="rounded-xl border border-gray-200 bg-white text-card-foreground shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Órdenes de Servicio</CardTitle>
          <div className="relative mt-2">
            <InputSea
              placeholder="Buscar por descripción o número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col">
          <div className="border border-gray-200 rounded-lg flex-1 overflow-auto bg-white shadow-inner-sm max-h-[60vh]">
            {isFetching && list.length === 0 ? (
              <ul className="divide-y divide-gray-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="px-3 py-3">
                    <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="h-3 w-1/2 bg-gray-50 rounded animate-pulse" />
                  </li>
                ))}
              </ul>
            ) : isEmpty ? (
              <div className="px-3 py-8 text-sm text-gray-500 text-center flex flex-col items-center">
                <Briefcase className="h-8 w-8 text-gray-300 mb-2" />
                Sin resultados.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {list.map((order) => {
                  const isSelected = selectedId === order.operationsId;
                  return (
                    <li key={order.operationsId}>
                      <button
                        type="button"
                        onClick={() => onSelect(order)}
                        className={[
                          "w-full text-left px-4 py-3 transition",
                          "hover:bg-blue-50/50 focus-visible:outline-none",
                          isSelected
                            ? "bg-blue-50 border-l-4 border-l-blue-600"
                            : "border-l-4 border-l-transparent",
                        ].join(" ")}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                              N° {order.opporNum}
                            </span>
                            <span 
                              className="h-1.5 w-1.5 rounded-full" 
                              style={{ backgroundColor: order.stateColor || '#10b981' }} 
                            />
                          </div>
                          <p className={`truncate text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                            {order.opporDesc}
                          </p>
                          <p className="truncate text-[11px] text-slate-400 font-medium">
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

          <div className="flex items-center justify-between mt-3 px-1 text-xs text-gray-500">
            <span>Total: {total}</span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.max(0, p.pageIndex - 1),
                  }))
                }
                disabled={pagination.pageIndex <= 0 || isFetching}
              >
                Ant
              </Button>
              <span className="min-w-[40px] text-center font-medium">
                {pageCount === 0 ? 0 : pagination.pageIndex + 1} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.min(pageCount - 1, p.pageIndex + 1),
                  }))
                }
                disabled={pagination.pageIndex + 1 >= pageCount || isFetching}
              >
                Sig
              </Button>
            </div>
          </div>
        </CardContent>
      </CardSimple>
    </aside>
  );
}
