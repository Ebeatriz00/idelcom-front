import type { SalesQuotationResponse } from "@/application";
import { buildSelectColumn, DataTable, makeStateBadgeCell } from "@/layouts";
import {
  exportCSV,
  exportExcel,
  exportPdf,
  statusToBool,
  type ColumnSpec,
} from "@/sharedKernel";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Layers } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  data: SalesQuotationResponse[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onToggleStatus: (row: SalesQuotationResponse) => void;
  search: string;
  onSearchChange: (q: string) => void;
};
export function QuotesTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onToggleStatus,
  search,
  onSearchChange,
}: Props) {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<SalesQuotationResponse, any>[]>(
    () => [
      buildSelectColumn<SalesQuotationResponse>(),
      {
        accessorKey: "quotationNo",
        meta: { className: "truncate", label: "N° Coti" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            N° Coti
            <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          const quotationId = row.original.quotationId;
          const version = row.original.versionNo;

          const handleNavigate = () => {
            if (quotationId)
              navigate(`/pre-sale/quotation/detail/${quotationId}`);
          };

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={handleNavigate}
                className="text-primary font-medium hover:underline hover:text-primary/80 transition-all disabled:opacity-50"
                title="Ver detalle de oportunidad"
                disabled={!quotationId}
              >
                {row.original.quotationNo}
                {version != null && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-gray-500">
                    <Layers className="size-3" />
                    {version}
                  </span>
                )}
              </button>

              {isActive ? (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">
                  <BadgeCheck className="size-3" /> activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                  inactivo
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "opporDesc",
        header: () => <div className="text-left">Oportunidad</div>,
        meta: { className: "w-[420px] max-w-[420px]" },
        cell: ({ getValue }) => (
          <div className="min-w-0 truncate" title={String(getValue() ?? "")}>
            {String(getValue() ?? "")}
          </div>
        ),
      },
      {
        accessorKey: "clientsName",
        header: () => <div className="text-left">Cliente</div>,
        meta: { className: "w-[420px] max-w-[420px]" },
        cell: ({ getValue }) => (
          <div className="min-w-0 truncate" title={String(getValue() ?? "")}>
            {String(getValue() ?? "")}
          </div>
        ),
      },
      {
        accessorKey: "workerName",
        header: () => <div className="text-left">Vendedor</div>,
        meta: {
          className:
            "hidden md:table-cell w-[160px] whitespace-normal break-words text-left align-top",
        },
      },
      {
        accessorKey: "total",
        header: () => <div className="text-left">Total</div>,
        meta: {
          className:
            "hidden md:table-cell w-[160px] whitespace-normal break-words text-left align-top",
        },
        cell: ({ row }) => {
          const total = row.original.total ?? 0;
          const sym = row.original.currencySymbol ?? "";

          const formatted = new Intl.NumberFormat("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(total);

          return (
            <span className="tabular-nums">
              {sym} {formatted}
            </span>
          );
        },
      },
      {
        accessorKey: "quotationStatus",
        header: () => <div className="text-center">Cotización</div>,

        cell: makeStateBadgeCell({
          descField: "quotationStatus",
          colorField: "quotationColor",
        }),
      },
      {
        accessorKey: "versionStatus",
        header: () => <div className="text-center">Versión</div>,

        cell: makeStateBadgeCell({
          descField: "versionStatus",
          colorField: "versionColor",
        }),
      },
    ],
    [navigate, onToggleStatus]
  );
  const colsExport: ColumnSpec<SalesQuotationResponse>[] = [
    { label: "Num Coti", value: (r) => r.quotationNo },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const opts = { filePrefix: "Cotizaciones", title: "Reporte de Cotizaciones" };

  return (
    <>
      <DataTable<SalesQuotationResponse>
        data={data}
        columns={columns}
        total={total}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        exportFns={{
          onCsv: (rows) => exportCSV(rows, colsExport, opts),
          onXlsx: (rows) => exportExcel(rows, colsExport, opts),
          onPdf: (rows) => exportPdf(rows, colsExport, opts),
        }}
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar..."
        tableClassName="w-full table-auto min-w-[1100px] text-sm [&_td]:py-3 [&_th]:py-3 divide-y divide-gray-100"
      />
    </>
  );
}
