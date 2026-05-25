import {
  Button,
  CardContent,
  CardHeader,
  CardSimple,
  CardTitle,
  InputSea,
} from "@/layouts";
import { useDebouncedValue, useProfilesList } from "@/sharedKernel";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PaginationState = { search: string; pageIndex: number; pageSize: number };
type Any = any;

// Helpers seguros para múltiples DTOs
const getProfileId = (p: Any) => p?.profilesId ?? p?.profileId ?? p?.id;
const getProfileLabel = (p: Any) =>
  p?.name ?? p?.profileName ?? `Perfil ${getProfileId(p) ?? ""}`;

export function AsideProfiles({
  selectedId,
  onSelect,
}: {
  selectedId?: number | string | null;
  onSelect: (row: any) => void;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [pagination, setPagination] = useState<PaginationState>({
    search: "",
    pageIndex: 0,
    pageSize: 12,
  });

 
  useEffect(() => {
    setPagination((p) => ({ ...p, search: debouncedSearch, pageIndex: 0 }));
  }, [debouncedSearch]);


  const { data, isFetching } = useProfilesList(
    pagination.search,
    pagination.pageIndex,
    pagination.pageSize
  );


  const list = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const pageCount =
    data?.totalPages ??
    Math.max(1, Math.ceil(total / Math.max(1, pagination.pageSize)));

  const isEmpty = !isFetching && list.length === 0;

  return (
    <aside className="space-y-3">
      <CardSimple>
        <CardHeader className="pb-2">
          <CardTitle>Perfiles</CardTitle>
          <div className="relative mt-2">
            <InputSea
              placeholder="Buscar perfil..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="border border-gray-200 rounded-lg max-h-[460px] overflow-auto bg-white shadow-inner-sm">
            {isFetching && list.length === 0 ? (
              // Skeleton
              <ul className="divide-y divide-gray-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="px-3 py-3">
                    <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-1" />
                    <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                  </li>
                ))}
              </ul>
            ) : isEmpty ? (
              // Empty state
              <div className="px-3 py-6 text-sm text-gray-500 text-center">
                Sin resultados.
              </div>
            ) : (
              // Lista
              <ul className="divide-y divide-gray-100">
                {list.map((p: any) => {
                  const id = getProfileId(p);
                  const selected =
                    selectedId != null && String(selectedId) === String(id);

                  return (
                    <li key={id ?? crypto.randomUUID()}>
                      <button
                        type="button"
                        onClick={() => onSelect(p)}
                        className={[
                          "w-full text-left px-3 py-2 transition",
                          "hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
                          selected
                            ? "bg-gray-50 border border-gray-200"
                            : "border border-transparent",
                        ].join(" ")}
                      >
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {getProfileLabel(p)}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 px-1 text-xs text-gray-500">
            <span>Total: {total}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.max(0, p.pageIndex - 1),
                  }))
                }
                disabled={pagination.pageIndex <= 0 || isFetching}
              >
                Anterior
              </Button>
              <span>
                Pág {pageCount === 0 ? 0 : pagination.pageIndex + 1} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.min(pageCount - 1, p.pageIndex + 1),
                  }))
                }
                disabled={pagination.pageIndex + 1 >= pageCount || isFetching}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </CardSimple>
    </aside>
  );
}
