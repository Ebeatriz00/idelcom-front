import type { PersonnelHomologationListItemDto } from "@/application";
import {
  Button,
  CardContent,
  CardHeader,
  CardSimple,
  CardTitle,
  InputSea,
} from "@/layouts";
import { useDebouncedValue } from "@/sharedKernel";
import { usePersonnelHomologationList } from "@/sharedKernel/hooks/operations/SSOMA/SsomaHomologation/personnelHomologation/usePersonnelHomologation";
import { Briefcase, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PaginationState, PropsTable } from "../../utils/TypesPersonnel";

export function AsidePersonnelHomologation({
  selectedId,
  onSelect,
  search,
  setSearch,
}: PropsTable) {
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 350);

  const [pagination, setPagination] = useState<PaginationState>({
    search: "",
    pageIndex: 0,
    pageSize: 12,
  });

  useEffect(() => {
    setPagination((p) => ({ ...p, search: debouncedSearch, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { data, isFetching } = usePersonnelHomologationList(
    pagination.pageIndex,
    pagination.pageSize,
    pagination.search,
  );

  const list: PersonnelHomologationListItemDto[] = useMemo(
    () => data?.items ?? [],
    [data],
  );
  const total = data?.total ?? 0;
  const pageCount =
    data?.totalPages ??
    Math.max(1, Math.ceil(total / Math.max(1, pagination.pageSize)));

  const isEmpty = !isFetching && list.length === 0;

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case "Homologado":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "En proceso":
        return "border-amber-200 bg-amber-50 text-amber-700";
      default:
        return "border-rose-200 bg-rose-50 text-rose-700";
    }
  }

  return (
    <aside className="flex h-full min-w-0 flex-col space-y-3">
      <CardSimple className="rounded-xl border border-gray-200 bg-white text-card-foreground shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Equipo Operaciones</CardTitle>
          <div className="relative mt-2">
            <InputSea
              placeholder="Buscar por nombre, apellidos y dni..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col">
          <div className="max-h-[50vh] flex-1 overflow-auto rounded-lg border border-gray-200 bg-white shadow-inner-sm xl:max-h-[60vh]">
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
                {list.map((personnel, index) => {
                  const personnelId = personnel.personnelOperationsId;
                  const hasValidPersonnelId =
                    personnelId !== null &&
                    personnelId !== undefined &&
                    `${personnelId}`.trim() !== "";
                  const rowKey = hasValidPersonnelId
                    ? `personnel-${personnelId}-${index}`
                    : `personnel-${personnel.personnelFullName}-${personnel.status}-${index}`;
                  const selected =
                    (hasValidPersonnelId &&
                      selectedId !== null &&
                      selectedId !== undefined &&
                      `${selectedId}` === `${personnelId}`) ||
                    selectedRowKey === rowKey;

                  return (
                    <li key={rowKey}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRowKey(rowKey);
                          onSelect(personnel);
                        }}
                        className={[
                          "w-full text-left px-4 py-3 transition",
                          "hover:bg-blue-50/50 focus-visible:outline-none",
                          selected
                            ? "bg-blue-50 border-l-4 border-l-blue-600"
                            : "border-l-4 border-l-transparent",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-700">
                              {personnel.personnelFullName}
                            </p>
                          </div>

                          <span
                            className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusBadgeClass(personnel.homologationStatus)}`}
                          >
                            {personnel.homologationStatus}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-2 px-1 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
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
              <span className="min-w-[40px] text-center">
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
