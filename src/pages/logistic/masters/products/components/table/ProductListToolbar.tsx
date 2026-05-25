import type { OptionItem } from "@/application";
import { Filter, Search, X } from "lucide-react";
import { ProductFilterSelect } from "./ProductFilterSelect";

type ProductListToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter?: number;
  productTypeFilter?: number;
  brandFilter?: number;
  onCategoryFilterChange: (value?: number) => void;
  onProductTypeFilterChange: (value?: number) => void;
  onBrandFilterChange: (value?: number) => void;
  categoriesOptions: OptionItem[];
  productTypesOptions: OptionItem[];
  brandsOptions: OptionItem[];
  categoriesLoading?: boolean;
  productTypesLoading?: boolean;
  brandsLoading?: boolean;
};

export function ProductListToolbar({
  search,
  onSearchChange,
  categoryFilter,
  productTypeFilter,
  brandFilter,
  onCategoryFilterChange,
  onProductTypeFilterChange,
  onBrandFilterChange,
  categoriesOptions,
  productTypesOptions,
  brandsOptions,
  categoriesLoading,
  productTypesLoading,
  brandsLoading,
}: ProductListToolbarProps) {
  const hasFilters = Boolean(
    search || categoryFilter || productTypeFilter || brandFilter,
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-3 xl:flex-row xl:items-end">
          <label className="flex min-w-[260px] flex-1 flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Busqueda general
            </span>
            <span className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar por descripcion, SKU, codigo, marca, linea o tipo..."
                className="h-10 w-full rounded-xl border border-secondary/10 bg-white pl-9 pr-9 text-sm font-medium text-secondary outline-none transition placeholder:text-slate-400 hover:border-primary/30 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-muted hover:text-secondary"
                  aria-label="Limpiar busqueda"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </span>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ProductFilterSelect
              label="Categoria"
              placeholder="Todas las categorias"
              value={categoryFilter}
              options={categoriesOptions}
              onChange={onCategoryFilterChange}
              loading={categoriesLoading}
            />
            <ProductFilterSelect
              label="Tipo"
              placeholder="Todos los tipos"
              value={productTypeFilter}
              options={productTypesOptions}
              onChange={onProductTypeFilterChange}
              loading={productTypesLoading}
            />
            <ProductFilterSelect
              label="Marca"
              placeholder="Todas las marcas"
              value={brandFilter}
              options={brandsOptions}
              onChange={onBrandFilterChange}
              loading={brandsLoading}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                onCategoryFilterChange(undefined);
                onProductTypeFilterChange(undefined);
                onBrandFilterChange(undefined);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-secondary/10 bg-white px-3 text-sm font-semibold text-secondary transition hover:bg-muted"
            >
              <Filter className="size-4" />
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
