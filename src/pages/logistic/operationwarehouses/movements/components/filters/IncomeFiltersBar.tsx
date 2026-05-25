import { SearchSelect } from "@/layouts";
import { Filter, RefreshCcw, Search } from "lucide-react";
import { useMemo } from "react";
import type { IncomeFiltersBarProps } from "../../types/income.types";
import {
  getActiveIncomeFilters,
  makeLocalOptionsHook,
  normalizeOptionId,
  toMovementTypeOptions,
} from "../../utils/incomeFilters";

export function IncomeFiltersBar({
  filters,
  incomeTypes,
  warehouses,
  onChange,
  onReset,
}: IncomeFiltersBarProps) {
  const movementTypeOptions = useMemo(
    () => toMovementTypeOptions(incomeTypes),
    [incomeTypes],
  );
  const movementTypeUseOptions = useMemo(
    () => makeLocalOptionsHook(movementTypeOptions),
    [movementTypeOptions],
  );
  const selectedMovementType =
    movementTypeOptions.find(
      (option) => Number(option.value) === filters.movementTypeId,
    ) ?? null;
  const activeFilters = getActiveIncomeFilters(filters, incomeTypes, warehouses);

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(320px,1.4fr)_minmax(280px,1.15fr)_minmax(220px,0.9fr)_minmax(150px,0.65fr)_minmax(150px,0.65fr)_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
            placeholder="Buscar ingresos..."
            className="h-10 w-full rounded-lg border border-secondary/15 bg-background pl-9 pr-3 text-sm text-secondary outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/15"
          />
        </label>

        <SearchSelect
          useOptions={movementTypeUseOptions}
          value={selectedMovementType}
          onChange={(option) =>
            onChange({
              ...filters,
              movementTypeId: option ? Number(option.value) : undefined,
            })
          }
          placeholder="Tipo de ingreso"
          pageSize={100}
          minSearchChars={0}
          className="w-full"
          inputClassName="h-10 rounded-lg border border-secondary/15 bg-white px-3 text-sm shadow-none hover:border-primary/40 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15"
          textClassName="font-medium text-secondary placeholder:text-muted-foreground"
        />

        <select
          value={filters.warehouseId ?? 0}
          onChange={(event) =>
            onChange({
              ...filters,
              warehouseId: normalizeOptionId(event.target.value),
            })
          }
          className="h-10 rounded-lg border border-secondary/15 bg-white px-3 text-sm text-secondary outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        >
          <option value={0}>Almacen</option>
          {warehouses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(event) =>
            onChange({ ...filters, dateFrom: event.target.value || undefined })
          }
          className="h-10 rounded-lg border border-secondary/15 bg-white px-3 text-sm text-secondary outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          aria-label="Fecha desde"
        />

        <input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(event) =>
            onChange({ ...filters, dateTo: event.target.value || undefined })
          }
          className="h-10 rounded-lg border border-secondary/15 bg-white px-3 text-sm text-secondary outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          aria-label="Fecha hasta"
        />

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-secondary/15 bg-white px-3 text-sm font-semibold text-secondary transition hover:bg-muted"
        >
          <RefreshCcw className="size-4" />
          Limpiar
        </button>
      </div>

      {activeFilters.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
            <Filter className="size-3.5" />
            Filtros
          </span>
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="rounded-full bg-primary-degrad px-3 py-1 text-xs font-semibold text-primary"
            >
              {filter.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
