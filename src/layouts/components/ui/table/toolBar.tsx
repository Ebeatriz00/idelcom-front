import type { Table } from "@tanstack/react-table";
import type { ComponentType, ReactNode } from "react";
import { ColumnsMenu } from "./columnsMenu";

type ExportMenuProps<T> = { rows: T[] };

type Props<T> = {
  table: Table<T>;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  rowsToExport?: T[];
  ExportMenuComponent?: ComponentType<ExportMenuProps<T>>;
  searchPlaceholder?: string;
  leftSlot?: ReactNode;
  columnsMenuExcludeIds?: string[];
  columnsMenuLabel?: string;
  columnsMenuWidth?: string;
  hideSearch?: boolean;
  hideColumnsMenu?: boolean;
  loading?: boolean;
  datePickerSlot?: ReactNode;
  yearSlot?: ReactNode;
  workerSlot?: ReactNode;
};

export function Toolbar<T>({
  table,
  globalFilter,
  setGlobalFilter,
  rowsToExport = [],
  ExportMenuComponent,
  searchPlaceholder = "Buscar…",
  leftSlot,
  columnsMenuExcludeIds = ["actions", "select"],
  columnsMenuLabel = "Columnas",
  columnsMenuWidth = "w-52",
  hideSearch = false,
  hideColumnsMenu = false,
  loading,
  datePickerSlot,
  yearSlot,
  workerSlot
}: Props<T>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4">
      <div className="flex items-center gap-2 w-full">
        {!hideSearch && (
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
          />
        )}
        
        {datePickerSlot}
        {yearSlot}
        {workerSlot}
        {leftSlot}
        {loading && <span className="text-xs text-gray-500">Cargando…</span>}
      </div>

      <div className="hidden sm:flex items-center gap-2">
        {ExportMenuComponent ? (
          <ExportMenuComponent rows={rowsToExport} />
        ) : null}
        {!hideColumnsMenu && (
          <ColumnsMenu
            table={table}
            exclude={columnsMenuExcludeIds}
            label={columnsMenuLabel}
            menuWidthClass={columnsMenuWidth}
          />
        )}
      </div>
    </div>
  );
}