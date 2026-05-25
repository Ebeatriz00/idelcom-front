import type { WarehousesMovementResponseDto } from "@/application";
import { fetchMovementTypesList } from "@/infrastructure";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import { useSelectOptions } from "@/sharedKernel/hooks/SelectOptions/useSelectOptions";
import { useWarehousesOptions } from "@/sharedKernel/hooks/logistic/masters/useWarehouses";
import {
  useWarehousesMovementById,
  useWarehousesMovementList,
  useWarehousesMovementMutations,
} from "@/sharedKernel/hooks/logistic/operationsWarehouses/useWarehousesMovement";
import type { PaginationState } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Coins, PackagePlus, Warehouse } from "lucide-react";
import { useMemo, useState } from "react";
import { IncomeFiltersBar } from "./components/filters/IncomeFiltersBar";
import { IncomeHeader } from "./components/header/IncomeHeader";
import { IncomeMetricCard } from "./components/metrics/IncomeMetricCard";
import { IncomeDetailModal } from "./components/modal/IncomeDetailModal";
import { IncomeFormModal } from "./components/modal/IncomeFormModal";
import { EmptyIncomesState } from "./components/states/EmptyIncomesState";
import { IncomesTable } from "./components/table/IncomesTable";
import type { IncomeFilterState } from "./types/income.types";
import { money } from "./utils/formatters";
import { INCOME_OPERATION_ID, isIncomeType } from "./utils/incomeFilters";

export default function Movements() {
  const [filters, setFilters] = useState<IncomeFilterState>({ search: "" });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const debouncedSearch = useDebouncedValue(filters.search, 350);

  const movementTypesQuery = useQuery({
    queryKey: ["income-movement-types", INCOME_OPERATION_ID],
    queryFn: () => fetchMovementTypesList(1, 1000, "INGRESO"),
    staleTime: 60_000,
  });
  const incomeTypes = useMemo(
    () => (movementTypesQuery.data?.items ?? []).filter(isIncomeType),
    [movementTypesQuery.data?.items],
  );

  const warehousesQuery = useWarehousesOptions(1, "", 1000);
  const warehouses = useSelectOptions(warehousesQuery);

  const movementsQuery = useWarehousesMovementList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
    filters.movementTypeId,
    INCOME_OPERATION_ID,
    filters.warehouseId,
    filters.dateFrom,
    filters.dateTo,
  );

  const rows = movementsQuery.data?.items ?? [];
  const metrics = useMemo(() => {
    const amount = rows.reduce((sum, item) => sum + Number(item.total ?? 0), 0);
    const last = rows
      .map((item) => item.movementDate)
      .filter(Boolean)
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    const warehousesCount = new Map<string, number>();

    rows.forEach((item) => {
      const warehouse = item.warehouseDescription || "Sin almacen";
      warehousesCount.set(warehouse, (warehousesCount.get(warehouse) ?? 0) + 1);
    });

    return {
      total: movementsQuery.data?.total ?? 0,
      amount: money(amount),
      last: last ? last.toLocaleDateString("es-PE") : "-",
      mostUsedWarehouse:
        [...warehousesCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
        "-",
    };
  }, [movementsQuery.data?.total, rows]);

  const selectedDetailQuery = useWarehousesMovementById(selectedId);
  const { createMut } = useWarehousesMovementMutations();

  async function handleCreate(dto: Parameters<typeof createMut.mutateAsync>[0]) {
    await createMut.mutateAsync(dto);
    setFormOpen(false);
  }

  function handleFiltersChange(next: IncomeFilterState) {
    setFilters(next);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }

  function handleView(row: WarehousesMovementResponseDto) {
    setSelectedId(row.warehouseMovementId);
  }

  const total = movementsQuery.data?.total ?? 0;
  const pageCount = movementsQuery.data?.totalPages ?? 1;
  const loadingMovements = movementsQuery.isLoading || movementsQuery.isFetching;

  return (
    <main className="min-h-[80vh] space-y-5">
      <Breadcrumb
        items={[
          { label: "Logistica", href: "#" },
          { label: "Almacenes", href: "#" },
          { label: "Ingresos", current: true },
        ]}
      />

      <div className="mx-auto flex max-w-400 flex-col gap-4">
        <IncomeHeader onCreate={() => setFormOpen(true)} />

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <IncomeMetricCard
            label="Ingresos del periodo"
            value={metrics.total}
            icon={PackagePlus}
            tone="secondary"
          />
          <IncomeMetricCard
            label="Monto total"
            value={metrics.amount}
            icon={Coins}
            tone="accent"
          />
          <IncomeMetricCard
            label="Ultimo ingreso"
            value={metrics.last}
            icon={CalendarClock}
            tone="primary"
          />
          <IncomeMetricCard
            label="Almacen mas usado"
            value={metrics.mostUsedWarehouse}
            icon={Warehouse}
            tone="muted"
          />
        </section>

        <IncomesTable
          data={rows}
          total={total}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          search={filters.search}
          onSearchChange={(search) => handleFiltersChange({ ...filters, search })}
          loading={loadingMovements}
          onView={handleView}
          filtersSlot={
            <IncomeFiltersBar
              filters={filters}
              incomeTypes={incomeTypes}
              warehouses={warehouses}
              onChange={handleFiltersChange}
              onReset={() => handleFiltersChange({ search: "" })}
            />
          }
        />

        <EmptyIncomesState hasRows={rows.length > 0} loading={loadingMovements} />
      </div>

      <IncomeFormModal
        open={formOpen}
        movementTypes={incomeTypes}
        warehouses={warehouses}
        saving={createMut.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <IncomeDetailModal
        open={selectedId != null}
        data={selectedDetailQuery.data}
        loading={selectedDetailQuery.isLoading || selectedDetailQuery.isFetching}
        onClose={() => setSelectedId(null)}
      />
    </main>
  );
}
