import type { MovementTypesResponseDto } from "@/application";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import { cn, exportCSV, exportExcel, exportPdf, type ColumnSpec } from "@/sharedKernel";
import { statusToBool } from "@/sharedKernel/utils/status";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpDown,
  ArrowUpFromLine,
  BadgeCheck,
  Boxes,
  Eye,
  FilterX,
  PackageOpen,
  Pencil,
  Plus,
  Power,
  Search,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import { movementTypesGuards } from "../../utils/guards";

type PaginationState = { pageIndex: number; pageSize: number };

type MovementTypeFilters = {
  classification: string;
  operation: string;
  entity: string;
  affectsStock: "all" | "yes" | "no";
};

const emptyFilters: MovementTypeFilters = {
  classification: "",
  operation: "",
  entity: "",
  affectsStock: "all",
};

function normalized(value?: string | null) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function uniqueValues(data: MovementTypesResponseDto[], getter: (row: MovementTypesResponseDto) => string | undefined) {
  return Array.from(
    new Set(data.map((row) => getter(row)?.trim()).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));
}

function SoftBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ring-1",
        className,
      )}
    >
      {children}
    </span>
  );
}

function classificationClass(value?: string) {
  const key = normalized(value);
  if (key.includes("COMPRA")) return "bg-blue-50 text-blue-700 ring-blue-200";
  if (key.includes("VENTA")) return "bg-violet-50 text-violet-700 ring-violet-200";
  if (key.includes("INVENTARIO")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (key.includes("DEVOLUCION")) return "bg-cyan-50 text-cyan-700 ring-cyan-200";
  if (key.includes("GARANTIA")) return "bg-amber-50 text-amber-700 ring-amber-200";
  if (key.includes("CONSUMO")) return "bg-orange-50 text-orange-700 ring-orange-200";
  if (key.includes("AJUSTE")) return "bg-slate-100 text-slate-700 ring-slate-200";
  if (key.includes("TRASLADO")) return "bg-indigo-50 text-indigo-700 ring-indigo-200";
  return "bg-slate-50 text-slate-600 ring-slate-200";
}

function OperationBadge({ value }: { value?: string }) {
  const key = normalized(value);
  const Icon = key.includes("INGRESO")
    ? ArrowDownToLine
    : key.includes("SALIDA")
      ? ArrowUpFromLine
      : key.includes("TRASLADO")
        ? ArrowLeftRight
        : Wrench;
  const color = key.includes("INGRESO")
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : key.includes("SALIDA")
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : key.includes("TRASLADO")
        ? "bg-blue-50 text-blue-700 ring-blue-200"
        : "bg-amber-50 text-amber-700 ring-amber-200";

  return (
    <SoftBadge className={color}>
      <Icon className="size-3.5" />
      {value || "Sin operacion"}
    </SoftBadge>
  );
}

function ToolbarSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-[150px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
      aria-label={label}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function MovementTypesTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onVisibleCountChange,
  search,
  onSearchChange,
  onCreate,
  canCreateMovType = true,
  canExportMovType = true,
  canEditMovType = true,
  canEditStatusMovType = true,
}: {
  data: MovementTypesResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: MovementTypesResponseDto) => void;
  onToggleStatus: (row: MovementTypesResponseDto) => void;
  onDelete: (row: MovementTypesResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  onCreate?: () => void;
  canCreateMovType?: boolean;
  canEditMovType?: boolean;
  canExportMovType?: boolean;
  canEditStatusMovType?: boolean;
}) {
  const [filters, setFilters] = useState<MovementTypeFilters>(emptyFilters);

  const classificationOptions = useMemo(
    () => uniqueValues(data, (row) => row.movClasDescription),
    [data],
  );
  const operationOptions = useMemo(
    () => uniqueValues(data, (row) => row.movOperDescription),
    [data],
  );
  const entityOptions = useMemo(
    () => uniqueValues(data, (row) => row.movPerDescription),
    [data],
  );

  const hasFilters =
    Boolean(filters.classification || filters.operation || filters.entity) ||
    filters.affectsStock !== "all";

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (filters.classification && row.movClasDescription !== filters.classification) return false;
      if (filters.operation && row.movOperDescription !== filters.operation) return false;
      if (filters.entity && row.movPerDescription !== filters.entity) return false;
      if (filters.affectsStock === "yes" && row.affectsStock !== true) return false;
      if (filters.affectsStock === "no" && row.affectsStock === true) return false;
      return true;
    });
  }, [data, filters]);

  const columns = useMemo<ColumnDef<MovementTypesResponseDto, unknown>[]>(
    () => [
      buildSelectColumn<MovementTypesResponseDto>() as ColumnDef<MovementTypesResponseDto, unknown>,
      {
        accessorKey: "code",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Codigo <ArrowUpDown className="size-3.5" />
          </button>
        ),
        meta: { className: "w-[130px]", label: "Codigo" },
        cell: ({ row }) => (
          <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold tracking-wide text-slate-800 ring-1 ring-slate-200">
            {row.original.code || "-"}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Descripcion",
        meta: { className: "min-w-[260px]", label: "Descripcion" },
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          return (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-950" title={row.original.description}>
                {row.original.description || "Tipo sin descripcion"}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <SoftBadge
                  className={
                    isActive
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-slate-100 text-slate-600 ring-slate-200"
                  }
                >
                  {isActive && <BadgeCheck className="size-3" />}
                  {isActive ? "Activo" : "Inactivo"}
                </SoftBadge>
                {row.original.movSunatDescription && (
                  <span className="truncate text-xs text-slate-500">
                    SUNAT {row.original.movSunatDescription}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "movClasDescription",
        header: "Clasificacion",
        meta: { className: "hidden md:table-cell", label: "Clasificacion" },
        cell: ({ row }) => (
          <SoftBadge className={classificationClass(row.original.movClasDescription)}>
            {row.original.movClasDescription || "Sin clasificacion"}
          </SoftBadge>
        ),
      },
      {
        accessorKey: "movOperDescription",
        header: "Operacion",
        meta: { className: "hidden md:table-cell", label: "Operacion" },
        cell: ({ row }) => <OperationBadge value={row.original.movOperDescription} />,
      },
      {
        accessorKey: "movPerDescription",
        header: "Entidad relacionada",
        meta: { className: "hidden lg:table-cell", label: "Entidad relacionada" },
        cell: ({ row }) => (
          <SoftBadge className="bg-white text-slate-700 ring-slate-200">
            {row.original.movPerDescription || "Ninguna"}
          </SoftBadge>
        ),
      },
      {
        accessorKey: "movSunatDescription",
        header: "SUNAT",
        meta: { className: "hidden xl:table-cell", label: "SUNAT" },
        cell: ({ row }) =>
          row.original.movSunatDescription ? (
            <span className="inline-flex max-w-[150px] truncate rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              {row.original.movSunatDescription}
            </span>
          ) : (
            <span className="text-xs text-slate-400">Opcional</span>
          ),
      },
      {
        id: "rules",
        header: "Reglas",
        meta: { className: "min-w-[210px]", label: "Reglas" },
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            {row.original.affectsStock && (
              <SoftBadge className="bg-emerald-50 text-emerald-700 ring-emerald-200">
                Stock
              </SoftBadge>
            )}
            {row.original.requiresDestWare && (
              <SoftBadge className="bg-blue-50 text-blue-700 ring-blue-200">
                Destino
              </SoftBadge>
            )}
            {row.original.generatesAccounting && (
              <SoftBadge className="bg-indigo-50 text-indigo-700 ring-indigo-200">
                Contable
              </SoftBadge>
            )}
            {row.original.allowNegative && (
              <SoftBadge className="bg-rose-50 text-rose-700 ring-rose-200">
                Negativo
              </SoftBadge>
            )}
            {!row.original.affectsStock &&
              !row.original.requiresDestWare &&
              !row.original.generatesAccounting &&
              !row.original.allowNegative && (
                <span className="text-xs text-slate-400">Informativo</span>
              )}
          </div>
        ),
      },
      {
        id: "status",
        header: "Estado",
        meta: { className: "hidden sm:table-cell w-[100px]", label: "Estado" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          return (
            <SoftBadge
              className={
                active
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-slate-100 text-slate-600 ring-slate-200"
              }
            >
              {active ? "Activo" : "Inactivo"}
            </SoftBadge>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[128px] text-right" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const inUse = movementTypesGuards.isInUse(row.original);
          const canToggle = movementTypesGuards.canToggle(row.original);

          return (
            <div className="inline-flex w-full items-center justify-end gap-1 opacity-100 transition md:opacity-70 md:group-hover:opacity-100">
              <button
                type="button"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Ver detalle"
                title="Ver detalle"
              >
                <Eye className="size-4" />
              </button>
              {canEditMovType && (
                <button
                  type="button"
                  onClick={() => onEdit(row.original)}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                  aria-label="Editar tipo de movimiento"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
              )}

              {canEditStatusMovType && (
                <button
                  type="button"
                  onClick={() => canToggle && onToggleStatus(row.original)}
                  disabled={!canToggle}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={active ? "Desactivar tipo de movimiento" : "Activar tipo de movimiento"}
                  title={
                    canToggle
                      ? active
                        ? "Desactivar"
                        : "Activar"
                      : inUse
                        ? "No se puede desactivar: tipo de movimiento en uso"
                        : "Accion no permitida"
                  }
                >
                  <Power className={cn("size-4", active && "text-emerald-600")} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onEdit, onToggleStatus, onDelete, canEditMovType, canEditStatusMovType],
  );

  const colsExport: ColumnSpec<MovementTypesResponseDto>[] = [
    { label: "Codigo", value: (r) => r.code },
    { label: "Descripcion", value: (r) => r.description },
    { label: "Clasificacion", value: (r) => r.movClasDescription },
    { label: "Operacion", value: (r) => r.movOperDescription },
    { label: "Entidad relacionada", value: (r) => r.movPerDescription },
    { label: "Sunat", value: (r) => r.movSunatDescription },
    { label: "Afecta stock", value: (r) => (r.affectsStock ? "Si" : "No") },
    { label: "Destino", value: (r) => (r.requiresDestWare ? "Si" : "No") },
    { label: "Contable", value: (r) => (r.generatesAccounting ? "Si" : "No") },
    { label: "Negativo", value: (r) => (r.allowNegative ? "Si" : "No") },
    { label: "Estado", value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo") },
  ];

  const opts = {
    filePrefix: "TiposMovimiento",
    title: "Reporte de Tipos de Movimiento",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por codigo, descripcion, clasificacion u operacion..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToolbarSelect
              label="Clasificacion"
              value={filters.classification}
              options={classificationOptions}
              onChange={(classification) => setFilters((current) => ({ ...current, classification }))}
            />
            <ToolbarSelect
              label="Operacion"
              value={filters.operation}
              options={operationOptions}
              onChange={(operation) => setFilters((current) => ({ ...current, operation }))}
            />
            <ToolbarSelect
              label="Entidad"
              value={filters.entity}
              options={entityOptions}
              onChange={(entity) => setFilters((current) => ({ ...current, entity }))}
            />
            <select
              value={filters.affectsStock}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  affectsStock: event.target.value as MovementTypeFilters["affectsStock"],
                }))
              }
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              aria-label="Afecta stock"
            >
              <option value="all">Afecta stock</option>
              <option value="yes">Si afecta</option>
              <option value="no">No afecta</option>
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={() => setFilters(emptyFilters)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <FilterX className="size-4" />
                Limpiar filtros
              </button>
            )}

            {canCreateMovType && onCreate && (
              <button
                type="button"
                onClick={onCreate}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
              >
                <Plus className="size-4" />
                Nuevo Tipo
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
            <SlidersHorizontal className="size-3.5" />
            Reglas visibles:
          </span>
          <span className="inline-flex items-center gap-1"><Boxes className="size-3.5" /> Stock</span>
          <span>Destino</span>
          <span>Contable</span>
          <span className="text-rose-600">Negativo</span>
        </div>
      </div>

      {filteredData.length === 0 && !search && !hasFilters ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-slate-200">
            <PackageOpen className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-950">
            No hay tipos de movimiento registrados
          </h3>
          {canCreateMovType && onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
            >
              <Plus className="size-4" />
              Crear primer tipo de movimiento
            </button>
          )}
        </div>
      ) : (
        <DataTable<MovementTypesResponseDto>
          data={filteredData}
          columns={columns}
          total={hasFilters ? filteredData.length : total}
          pageCount={hasFilters ? 1 : pageCount}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          onVisibleCountChange={onVisibleCountChange}
          exportFns={
            canExportMovType
              ? {
                  onCsv: (rows) => exportCSV(rows, colsExport, opts),
                  onXlsx: (rows) => exportExcel(rows, colsExport, opts),
                  onPdf: (rows) => exportPdf(rows, colsExport, opts),
                }
              : undefined
          }
          hideSearch
          containerClassName="border-0 bg-white"
          tableClassName="w-full table-fixed text-sm"
          rowProps={() => ({
            className:
              "group cursor-default transition-colors hover:bg-slate-50/90",
          })}
        />
      )}
    </div>
  );
}
