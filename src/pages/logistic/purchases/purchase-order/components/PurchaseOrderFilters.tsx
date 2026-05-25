import type { OptionItem } from "@/application";
import { SlidersHorizontal, X } from "lucide-react";

import { SearchSelect } from "@/layouts/components/ui/search-select/searchSelect";
import { usePurchaseOrderStatusOptions } from "@/sharedKernel/hooks/logistic/purchases/usePurchaseOrderStatus";

type Props = {
  search: string;
  status: OptionItem | null;
  dateFrom: string;
  dateTo: string;
  total: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: OptionItem | null) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
};

const inputClass =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10";

export function PurchaseOrderFilters({
  search,
  status,
  dateFrom,
  dateTo,
  total,
  onSearchChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onClear,
}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-100 p-1.5 text-slate-500">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Filtros</h2>
            <p className="text-xs text-slate-500">
              {total} orden{total !== 1 ? "es" : ""} encontrada{total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.6fr)_minmax(180px,1fr)_150px_150px_auto] xl:items-end">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Búsqueda</span>
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por proveedor, RUC o número de OC"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Estado</span>
          <SearchSelect
            useOptions={usePurchaseOrderStatusOptions}
            value={status}
            onChange={onStatusChange}
            placeholder="Estado"
            className="w-full"
            inputClassName="h-10 rounded-md border-slate-200 px-3 py-0"
            textClassName="font-normal text-slate-800 placeholder:text-slate-400"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Desde</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Hasta</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
            className={inputClass}
          />
        </label>

        <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-1 xl:flex-nowrap">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 xl:flex-none"
          >
            <X className="size-4" aria-hidden="true" />
            Limpiar
          </button>
        </div>
      </div>
    </section>
  );
}
