import { rankItem } from "@tanstack/match-sorter-utils";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
  type SortingState,
  type ColumnFiltersState,
  type OnChangeFn,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

export type PaginationState = { pageIndex: number; pageSize: number };

const fuzzyGlobalFilter =
  <T>(): FilterFn<T> =>
  (row, columnId, filterValue, addMeta) => {
    const value = String(row.getValue(columnId) ?? "");
    const itemRank = rankItem(value, String(filterValue ?? ""));
    addMeta?.({ itemRank });
    return itemRank.passed;
  };

export function useDataTable<T>({
  data,
  columns,
  pagination,
  onPaginationChange,
  pageCount,
  total,
  onVisibleCountChange,
  columnFilters,
  onColumnFiltersChange,
  sorting: propSorting,         
  onSortingChange: propOnSortingChange 
}: {
  data: T[];
  columns: ColumnDef<T, any>[];
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  pageCount: number;
  total: number;
  onVisibleCountChange?: (n: number) => void;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  sorting?: SortingState;           
  onSortingChange?: OnChangeFn<SortingState>;
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const isServerSideSorting = !!propOnSortingChange;

  const sorting = isServerSideSorting ? propSorting : internalSorting;
  const onSortingChange = isServerSideSorting ? propOnSortingChange : setInternalSorting;

  const table = useReactTable({
    data,
    columns,
    state: { 
      pagination, 
      globalFilter, 
      rowSelection, 
      sorting,
      ...(columnFilters !== undefined && { columnFilters }), 
    },
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    
    onSortingChange: onSortingChange, 
    onColumnFiltersChange: onColumnFiltersChange,
    
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    
    manualPagination: true,
    manualFiltering: true,
    manualSorting: isServerSideSorting, 
    
    pageCount,
    globalFilterFn: fuzzyGlobalFilter<T>(),
  });

  const visibleCount = table.getRowModel().rows.length;
  useEffect(() => {
    onVisibleCountChange?.(visibleCount);
  }, [visibleCount, onVisibleCountChange]);

  const selected = table.getSelectedRowModel().rows.map((r) => r.original as T);
  const visible = table.getRowModel().rows.map((r) => r.original as T);
  const rowsToExport = selected.length > 0 ? selected : visible;

  return { table, globalFilter, setGlobalFilter, rowsToExport, total };
}