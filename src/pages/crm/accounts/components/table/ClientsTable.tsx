import type { ClientsResponseDto } from "@/application";
import { buildSelectColumn, DataTable } from "@/layouts";
import { LinkContactDialog } from "@/pages/crm/contacts/components/modal/LinkContactDialog";
import { useLinkContactDialog } from "@/pages/crm/contacts/hooks/useLinkContactDialog";
import { statusToBool } from "@/sharedKernel";
import { confirmPdfLimit150 } from "@/sharedKernel/utils/export/confirmPdfLimit";
import type { ColumnSpec } from "@/sharedKernel/utils/export/types";
import { useExportActions } from "@/sharedKernel/utils/export/useExportActions";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import {
  ArrowUpDown,
  BadgeCheck,
  Contact,
  History,
  Pencil,
  Power,
  Weight,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useClientsFormModal } from "../../hooks/useClientsModal";
import { clientsGuards } from "../../utils/guards";
import { ClientsHistoryFormModal } from "../modal/ClientsHistoryFormModal";
import { useClientsExportAll } from "./helper";

export function ClientsTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onChangeVendor,
  onToggleStatus,
  onDelete,
  onVisibleCountChange,
  search,
  onSearchChange,
  canAddContact = true,
  canChangeVendor = true,
  canEdit = true,
  canToggleStatus = true,
  canViewHistory = true,
  canExportAccount = true,
  onShowSellers,
}: {
  data: ClientsResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: ClientsResponseDto) => void;
  onChangeVendor: (row: ClientsResponseDto) => void;
  onToggleStatus: (row: ClientsResponseDto) => void;
  onDelete: (row: ClientsResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canAddContact?: boolean;
  canChangeVendor?: boolean;
  canEdit?: boolean;
  canToggleStatus?: boolean;
  canViewHistory?: boolean;
  canExportAccount?: boolean;
  onShowSellers?: (row: ClientsResponseDto) => void;
}) {
  const navigate = useNavigate();
  const { openHistory, openHistoryClienst, close, editingId } =
    useClientsFormModal();
  const linkContactDialog = useLinkContactDialog();

  const handleOpenHistoryModal = (row: ClientsResponseDto) => {
    if (row.clientsId) openHistoryClienst(row.clientsId);
  };

  const handleOpenContactModal = (row: ClientsResponseDto) => {
    if (row.clientsId) {
      linkContactDialog.open(row.clientsId);
    }
  };

  const { getAllOpporForExport, getForPdfLimit } = useClientsExportAll(search);

  const columns = useMemo<ColumnDef<ClientsResponseDto, any>[]>(
    () => [
      buildSelectColumn<ClientsResponseDto>(),
      {
        accessorKey: "clientsName",
        meta: { className: "truncate w-[420px] max-w-[420px]", label: "Contacto" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Contacto <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          const clientId = row.original.clientsId;

          const handleNavigate = () => {
            if (clientId) navigate(`/crm/accounts/detail/${clientId}`);
          };

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={handleNavigate}
                className="font-medium text-gray-900 truncate hover:underline hover:text-blue-600 transition-all text-left"
                title="Ver detalle de cuenta"
                disabled={!clientId}
              >
                {row.original.clientsName}
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
        accessorKey: "documents",
        header: () => <div className="text-center">N° Documento</div>,
        meta: {
          className: "hidden md:table-cell w-[180px] text-center align-middle",
        },
      },
      {
        accessorKey: "sales",
        header: () => <div className="text-center">Vendedor</div>,
        cell: ({ getValue, row }) => {
          const val = getValue() as string;
          const isMulti = val?.toLowerCase().includes("multi");

          if (isMulti) {
            return (
              <div className="flex justify-center">
                <button
                  onClick={() => onShowSellers?.(row.original)}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all"
                  title="Ver detalle de vendedores"
                >
                  {val.split(":")[0].trim()}
                </button>
              </div>
            );
          }

          return <div className="text-center">{val ?? "No asignado"}</div>;
        },
        meta: {
          className: "hidden md:table-cell w-[180px] text-center align-middle",
        },
      },
      {
        accessorKey: "sector",
        header: () => <div className="text-center">Negocio</div>,
        cell: ({ getValue }) => (
          <div className="text-center">{getValue() ?? "Sin Negocio"}</div>
        ),
        meta: {
          className: "hidden md:table-cell w-[180px] text-center align-middle",
        },
      },
      {
        accessorKey: "departament",
        header: () => <div className="text-center">Departamento</div>,
        cell: ({ getValue }) => (
          <div className="text-center">{getValue() ?? "Sin departamento"}</div>
        ),
        meta: {
          className: "hidden md:table-cell w-[180px] text-center align-middle",
        },
      },
      {
        accessorKey: "leadStatus",
        header: () => <div className="text-center">Estado</div>,
        cell: ({ getValue }) => (
          <div className="text-center">{getValue() ?? "Sin estado"}</div>
        ),
        meta: {
          className: "hidden md:table-cell w-[180px] text-center align-middle",
        },
      },
      {
        id: "actions",
        header: "Acciones",
        meta: { className: "w-[120px] text-right" },
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const inUse = clientsGuards.isInUse(row.original);
          const _canToggle = clientsGuards.canToggle(row.original);

          const isOtherSeller = !!row.original.isOtherSeller;

          const canEditRow = canEdit && !isOtherSeller;
          const canToggleRow = canToggleStatus && !isOtherSeller;
          const canAddContactRow = canAddContact && !isOtherSeller;

          return (
            <div className="inline-flex w-full items-center justify-end gap-1">
              {isOtherSeller && (
                <span
                  className="mr-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700"
                  title="Este cliente está asignado a otro vendedor"
                >
                  Otro vendedor
                </span>
              )}
              {canAddContactRow && (
                <button
                  onClick={() => linkContactDialog.open(row.original.clientsId)}
                  className="rounded-md p-1.5 text-yellow-600 hover:bg-yellow-100 transition"
                  aria-label="Agregar contacto"
                  title="Agregar contacto"
                >
                  <Contact className="size-4" />
                </button>
              )}
              {canChangeVendor && (
                <button
                  onClick={() => onChangeVendor(row.original)}
                  className="rounded-md p-1.5 text-violet-600 hover:bg-violet-100 transition"
                  aria-label="Cambiar Vendedor"
                  title="Cambiar Vendedor"
                >
                  <Weight className="size-4" />
                </button>
              )}

              {canEditRow && (
                <button
                  onClick={() => onEdit(row.original)}
                  className="rounded-md p-1.5 text-blue-600 hover:bg-blue-100 transition"
                  aria-label="Editar"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
              )}

              {canToggleRow && (
                <button
                  onClick={() => _canToggle && onToggleStatus(row.original)}
                  disabled={!_canToggle}
                  className={`
                    rounded-md p-1.5 transition
                    ${!_canToggle
                      ? "cursor-not-allowed opacity-40"
                      : active
                        ? "text-emerald-600 hover:bg-emerald-100"
                        : "text-red-600 hover:bg-red-100"
                    }
                  `}
                  aria-label="Activar/Desactivar"
                  title={
                    _canToggle
                      ? active
                        ? "Desactivar"
                        : "Activar"
                      : inUse
                        ? "No se puede desactivar: en uso"
                        : "Acción no permitida"
                  }
                >
                  <Power className="size-4" />
                </button>
              )}

              {canViewHistory && (
                <button
                  onClick={() => handleOpenHistoryModal(row.original)}
                  className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 transition"
                  aria-label="Historial"
                  title="Historial"
                >
                  <History className="size-4" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [
      onEdit,
      onToggleStatus,
      onDelete,
      onChangeVendor,
      canChangeVendor,
      canEdit,
      canToggleStatus,
      canViewHistory,
      handleOpenContactModal,
      handleOpenHistoryModal,
      linkContactDialog,
      navigate,
      onShowSellers,
    ],
  );

  const colsExport: ColumnSpec<ClientsResponseDto>[] = [
    { label: "Cuenta", value: (r) => r.clientsName },
    { label: "Documento", value: (r) => r.documents },
    { label: "Vendedor", value: (r) => r.sales },
    { label: "Sector", value: (r) => r.sector },
    { label: "Departamento", value: (r) => r.departament },
    { label: "Estado cuenta", value: (r) => r.leadStatus },
    {
      label: "Estado",
      value: (r) => (statusToBool(r.status) ? "Activo" : "Inactivo"),
    },
  ];

  const exportActions = useExportActions<ClientsResponseDto>({
    colsExport,
    opts: { filePrefix: "Cuentas", title: "Reporte de Cuentas" },
    getAllForExport: getAllOpporForExport,
    pdf: {
      limit: 150,
      entityLabel: "Cuentas",
      getForPdf: (onPct) => getForPdfLimit(150, onPct),
      confirm: confirmPdfLimit150,
    },
  });

  return (
    <>
      <DataTable<ClientsResponseDto>
        data={data}
        columns={columns}
        total={total}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onVisibleCountChange={onVisibleCountChange}
        exportFns={
          canExportAccount
            ? {
              onCsv: exportActions.onCsv,
              onXlsx: exportActions.onXlsx,
              onPdf: exportActions.onPdf,
            }
            : undefined
        }
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar... (RUC, CLIENTE, VENDEDOR)"
      />
      <ClientsHistoryFormModal
        openHistory={openHistory}
        title="Historial de cuenta"
        onClose={close}
        clientsId={editingId}
      />

      <LinkContactDialog
        open={linkContactDialog.isOpen}
        clientsId={linkContactDialog.currentClientsId || 0}
        onClose={linkContactDialog.close}
        onSubmit={linkContactDialog.onSubmit}
        saving={linkContactDialog.saving}
      />
    </>
  );
}
