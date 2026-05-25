import type { ProductsResponseDto } from "@/application";
import { buildSelectColumn, DataTable } from "@/layouts";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  statusToBool,
  type ColumnSpec,
} from "@/sharedKernel";
import { useSelectOptions } from "@/sharedKernel/hooks/SelectOptions/useSelectOptions";
import { useBrandsOptions } from "@/sharedKernel/hooks/logistic/masters/useBrands";
import { useCategoriesOptions } from "@/sharedKernel/hooks/logistic/masters/useCategories";
import { useProductTypesOptions } from "@/sharedKernel/hooks/logistic/masters/useProductTypes";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Boxes,
  Image as ImageIcon,
  Layers3,
  Pencil,
  Power,
  Tag,
} from "lucide-react";
import { useMemo } from "react";
import type { PropsTable } from "../../utils/products.type";
import { ProductActionButton } from "./ProductActionButton";
import { ProductBadge, ProductTypeBadge } from "./ProductBadges";
import { ProductListToolbar } from "./ProductListToolbar";
import { ProductNameCell } from "./ProductNameCell";

function EmptyDash() {
  return <span className="text-slate-400">-</span>;
}

function SortableHeader({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 transition hover:text-secondary"
      onClick={onClick}
    >
      {label}
      <ArrowUpDown className="size-3.5" />
    </button>
  );
}

export function ProductsTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onOpenGallery,
  onToggleStatus,
  onVisibleCountChange,
  search,
  onSearchChange,
  categoryFilter,
  productTypeFilter,
  brandFilter,
  onCategoryFilterChange,
  onProductTypeFilterChange,
  onBrandFilterChange,
  canEditProducts = true,
  canExportProducts = true,
  canEditStatusProducts = true,
}: PropsTable) {
  const categoriesQuery = useCategoriesOptions(1, "", 1000);
  const productTypesQuery = useProductTypesOptions(1, "", 1000);
  const brandsQuery = useBrandsOptions(1, "", 1000);

  const categoriesOptions = useSelectOptions(categoriesQuery);
  const productTypesOptions = useSelectOptions(productTypesQuery);
  const brandsOptions = useSelectOptions(brandsQuery);

  const columns = useMemo<ColumnDef<ProductsResponseDto, unknown>[]>(
    () => [
      buildSelectColumn<ProductsResponseDto>(),

      {
        accessorKey: "description",
        meta: {
          className: "min-w-[380px] whitespace-normal",
          label: "Producto",
        },
        header: ({ column }) => (
          <SortableHeader
            label="Producto"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => <ProductNameCell product={row.original} />,
      },

      {
        accessorKey: "brandsDescription",
        header: "Marca",
        meta: {
          className: "hidden md:table-cell min-w-[180px] whitespace-normal",
        },
        cell: ({ row }) =>
          row.original.brandsDescription ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-secondary ring-1 ring-secondary/10">
              <Tag className="size-3.5 text-slate-400" />
              {row.original.brandsDescription}
            </span>
          ) : (
            <EmptyDash />
          ),
      },

      {
        accessorKey: "linesDescription",
        header: "Linea",
        meta: {
          className: "hidden lg:table-cell min-w-[180px] whitespace-normal",
        },
        cell: ({ row }) =>
          row.original.linesDescription ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <Layers3 className="size-3.5 text-slate-400" />
              {row.original.linesDescription}
            </span>
          ) : (
            <EmptyDash />
          ),
      },

      {
        accessorKey: "typesDescription",
        header: "Tipo",
        meta: {
          className: "hidden xl:table-cell min-w-[170px] whitespace-normal",
        },
        cell: ({ row }) => (
          <ProductTypeBadge
            label={row.original.typesDescription}
            isService={row.original.isServices}
            isTool={row.original.isTool}
          />
        ),
      },

      {
        accessorKey: "categoriesDescription",
        header: "Categoria",
        meta: {
          className: "hidden 2xl:table-cell min-w-[180px] whitespace-normal",
        },
        cell: ({ row }) =>
          row.original.categoriesDescription ? (
            <span className="text-sm font-medium text-slate-600">
              {row.original.categoriesDescription}
            </span>
          ) : (
            <EmptyDash />
          ),
      },

      {
        id: "inventoryFlags",
        header: "Operacion",
        meta: { className: "hidden xl:table-cell min-w-[190px]" },
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1.5">
            {row.original.isStockable && (
              <ProductBadge tone="emerald">Inventario</ProductBadge>
            )}
            {row.original.manageLots && (
              <ProductBadge tone="blue">Lotes</ProductBadge>
            )}
            {row.original.manegesSerials && (
              <ProductBadge tone="amber">Series</ProductBadge>
            )}
            {!row.original.isStockable &&
              !row.original.manageLots &&
              !row.original.manegesSerials && <ProductBadge>Catalogo</ProductBadge>}
          </div>
        ),
      },

      {
        accessorKey: "stockMin",
        header: () => <div className="text-center">Stock min.</div>,
        meta: { className: "text-center min-w-[105px]" },
        cell: ({ row }) => (
          <div className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-secondary ring-1 ring-secondary/10">
            <Boxes className="size-3.5 text-slate-400" />
            {row.original.stockMin ?? 0}
          </div>
        ),
      },

      {
        id: "actions",
        header: "Acciones",
        meta: {
          className:
            "w-[132px] min-w-[132px] text-right sticky right-0 bg-white/90 backdrop-blur-md border-l border-secondary/10",
        },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);

          return (
            <div className="inline-flex w-full items-center justify-end gap-1 opacity-80 transition group-hover:opacity-100">
              <ProductActionButton
                icon={ImageIcon}
                label="Ver imagenes"
                tone="blue"
                onClick={() => onOpenGallery(row.original)}
              />

              {canEditProducts && (
                <ProductActionButton
                  icon={Pencil}
                  label="Editar producto"
                  onClick={() => onEdit(row.original)}
                />
              )}

              {canEditStatusProducts && (
                <ProductActionButton
                  icon={Power}
                  label={active ? "Desactivar producto" : "Activar producto"}
                  tone={active ? "emerald" : "slate"}
                  onClick={() => onToggleStatus(row.original)}
                />
              )}
            </div>
          );
        },
      },
    ],
    [
      onEdit,
      onOpenGallery,
      onToggleStatus,
      canEditProducts,
      canEditStatusProducts,
    ],
  );

  const colsExport: ColumnSpec<ProductsResponseDto>[] = [
    { label: "Producto", value: (r) => r.description },
    { label: "SKU", value: (r) => r.sku || "" },
    { label: "Codigo de barras", value: (r) => r.barcode || "" },
    { label: "Numero de parte", value: (r) => r.partNum || "" },
    { label: "Marca", value: (r) => r.brandsDescription || "" },
    { label: "Linea", value: (r) => r.linesDescription || "" },
    { label: "Tipo", value: (r) => r.typesDescription || "" },
    { label: "Categoria", value: (r) => r.categoriesDescription || "" },
    { label: "Stk.Min", value: (r) => r.stockMin?.toString() || "0" },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = { filePrefix: "Productos", title: "Listado de Productos" };

  return (
    <div className="space-y-3">
      <DataTable<ProductsResponseDto>
        data={data}
        columns={columns}
        total={total}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onVisibleCountChange={onVisibleCountChange}
        exportFns={
          canExportProducts
            ? {
                onCsv: (rows) => exportCSV(rows, colsExport, opts),
                onXlsx: (rows) => exportExcel(rows, colsExport, opts),
                onPdf: (rows) => exportPdf(rows, colsExport, opts),
              }
            : undefined
        }
        hideSearch
        columnsMenuLabel="Vista"
        columnsMenuWidth="w-56"
        searchValue={search}
        onSearchChange={onSearchChange}
        datePickerSlot={
          <ProductListToolbar
            search={search}
            onSearchChange={onSearchChange}
            categoryFilter={categoryFilter}
            productTypeFilter={productTypeFilter}
            brandFilter={brandFilter}
            onCategoryFilterChange={onCategoryFilterChange}
            onProductTypeFilterChange={onProductTypeFilterChange}
            onBrandFilterChange={onBrandFilterChange}
            categoriesOptions={categoriesOptions}
            productTypesOptions={productTypesOptions}
            brandsOptions={brandsOptions}
            categoriesLoading={categoriesQuery.isLoading}
            productTypesLoading={productTypesQuery.isLoading}
            brandsLoading={brandsQuery.isLoading}
          />
        }
        containerClassName="overflow-hidden rounded-2xl border border-secondary/10 bg-white shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]"
        tableClassName="w-full min-w-[1280px] table-auto text-sm [&_td]:py-3.5 [&_th]:py-3.5"
        rowProps={() => ({
          className:
            "group border-b border-slate-100 bg-white transition-colors duration-150 hover:bg-primary-degrad/40",
        })}
      />
    </div>
  );
}
