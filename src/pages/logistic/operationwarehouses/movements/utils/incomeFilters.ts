import type { MovementTypesResponseDto, OptionItem } from "@/application";
import type { UseOptionsHook } from "@/layouts/components/ui/search-select/types";
import type { ActiveIncomeFilter, IncomeFilterState } from "../types/income.types";

export const INCOME_OPERATION_ID = 1;

export function normalizeOptionId(value: string) {
  const parsed = Number(value);
  return parsed > 0 ? parsed : undefined;
}

export function isIncomeType(item: MovementTypesResponseDto) {
  return (
    item.movOperId === INCOME_OPERATION_ID ||
    item.movOperDescription?.trim().toUpperCase() === "INGRESO"
  );
}

export function toMovementTypeOptions(
  incomeTypes: MovementTypesResponseDto[],
): OptionItem[] {
  return incomeTypes.map((item) => ({
    value: item.movementTypesId ?? 0,
    label: item.description ?? item.code ?? `Tipo ${item.movementTypesId}`,
  }));
}

export function makeLocalOptionsHook(options: OptionItem[]): UseOptionsHook {
  return (page = 1, search = "", pageSize = 100) => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? options.filter((option) => option.label.toLowerCase().includes(term))
      : options;
    const safePage = Math.max(1, page);
    const safeSize = Math.max(1, pageSize);
    const start = (safePage - 1) * safeSize;

    return {
      data: {
        items: filtered.slice(start, start + safeSize),
        page: safePage,
        pageSize: safeSize,
        hasMore: start + safeSize < filtered.length,
      },
      isLoading: false,
      isFetching: false,
      refetch: () => undefined,
    };
  };
}

export function getActiveIncomeFilters(
  filters: IncomeFilterState,
  incomeTypes: MovementTypesResponseDto[],
  warehouses: OptionItem[],
): ActiveIncomeFilter[] {
  return [
    filters.movementTypeId
      ? {
          key: "movementTypeId",
          label:
            incomeTypes.find(
              (item) => item.movementTypesId === filters.movementTypeId,
            )?.description ?? "Tipo seleccionado",
        }
      : undefined,
    filters.warehouseId
      ? {
          key: "warehouseId",
          label:
            warehouses.find((item) => Number(item.value) === filters.warehouseId)
              ?.label ?? "Almacen seleccionado",
        }
      : undefined,
    filters.dateFrom
      ? { key: "dateFrom", label: `Desde ${filters.dateFrom}` }
      : undefined,
    filters.dateTo
      ? { key: "dateTo", label: `Hasta ${filters.dateTo}` }
      : undefined,
  ].filter((item): item is ActiveIncomeFilter => Boolean(item));
}
