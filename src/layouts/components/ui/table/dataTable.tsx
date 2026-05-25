import { TableSkeleton } from "@/layouts";
import { useDataTable } from "@/sharedKernel/hooks/tables/useDataTable";
import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  Row,
  SortingState,
} from "@tanstack/react-table";
import type { HTMLAttributes, ReactNode } from "react";
import { ExportMenu } from "./exportMenu";
import { TableFooter } from "./tableFooter";
import { TableView } from "./tableView";
import { Toolbar } from "./toolBar";

export function DataTable<T>({
  data,
  columns,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onVisibleCountChange,
  exportFns,
  searchPlaceholder,
  hideSearch,
  columnsMenuExcludeIds,
  columnsMenuLabel,
  columnsMenuWidth,
  rowProps,
  hideColumnsMenu,
  tableClassName,
  containerClassName,
  searchValue,
  onSearchChange,
  loading,
  columnFilters,
  onColumnFiltersChange,
  datePickerSlot,
  yearSlot,
  workerSlot,
  sorting,
  onSortingChange,
}: {
  data: T[];
  columns: ColumnDef<T, any>[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onVisibleCountChange?: (n: number) => void;
  exportFns?: {
    onCsv?: (rows: T[]) => void;
    onXlsx?: (rows: T[]) => void;
    onPdf?: (rows: T[]) => void;
  };
  searchPlaceholder?: string;
  hideSearch?: boolean;
  columnsMenuExcludeIds?: string[];
  columnsMenuLabel?: string;
  columnsMenuWidth?: string;
  rowProps?: (row: Row<T>) => HTMLAttributes<HTMLTableRowElement>;
  hideColumnsMenu?: boolean;
  tableClassName?: string;
  containerClassName?: string;
  searchValue?: string;
  onSearchChange?: (q: string) => void;
  loading?: boolean;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  datePickerSlot?: ReactNode;
  yearSlot?: ReactNode;
  workerSlot?: ReactNode;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
}) {
  const { table, globalFilter, setGlobalFilter, rowsToExport } =
    useDataTable<T>({
      data,
      columns,
      pagination,
      onPaginationChange,
      pageCount,
      total,
      onVisibleCountChange,
      columnFilters,
      onColumnFiltersChange,
      sorting,
      onSortingChange,
    });

  const hasExport =
    !!exportFns &&
    (!!exportFns.onCsv || !!exportFns.onXlsx || !!exportFns.onPdf);

  const showSkeleton = !!loading && data.length === 0;
  const visibleCols = table.getVisibleLeafColumns();
  const colCount = visibleCols.length || 4;

  return (
    <div
      className={
        containerClassName ??
        "rounded-2xl border border-gray-200 bg-white overflow-hidden"
      }
    >
      <Toolbar<T>
        table={table}
        globalFilter={searchValue ?? globalFilter}
        setGlobalFilter={onSearchChange ?? setGlobalFilter}
        rowsToExport={rowsToExport}
        ExportMenuComponent={
          hasExport
            ? () => (
                <ExportMenu<T>
                  rows={rowsToExport}
                  onCsv={exportFns?.onCsv}
                  onXlsx={exportFns?.onXlsx}
                  onPdf={exportFns?.onPdf}
                />
              )
            : undefined
        }
        searchPlaceholder={searchPlaceholder}
        hideSearch={hideSearch}
        columnsMenuExcludeIds={columnsMenuExcludeIds}
        columnsMenuLabel={columnsMenuLabel}
        columnsMenuWidth={columnsMenuWidth}
        hideColumnsMenu={hideColumnsMenu}
        loading={loading}
        datePickerSlot={datePickerSlot}
        yearSlot={yearSlot}
        workerSlot={workerSlot}
      />

      {showSkeleton ? (
        <TableSkeleton colCount={colCount} />
      ) : (
        <TableView<T>
          table={table}
          rowProps={rowProps}
          tableClassName={tableClassName}
        />
      )}

      <TableFooter<T>
        table={table}
        total={total}
        pageSize={pagination.pageSize}
        setPageSize={(n) =>
          onPaginationChange((p) => ({ ...p, pageSize: n, pageIndex: 0 }))
        }
      />
    </div>
  );
}
