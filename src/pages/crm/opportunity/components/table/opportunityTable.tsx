import type {
  OpportunitiesResponseDto,
  OpportunitiesStateUpdateDto,
  OpportunitiesUploadNewVerDto,
} from "@/application";
import {
  buildSelectColumn,
  DataTable,
  makeProgressCell,
  makeStateBadgeCell,
} from "@/layouts";
import {
  fmtDate,
  statusToBool,
  useOpportunitiesMutations,
  useSalesWorkerOptions,
} from "@/sharedKernel";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import {
  ArrowUpDown,
  BadgeCheck,
  Bell,
  BellOff,
  BellRing,
  Calendar,
  FileSymlink,
  Key,
  Loader2,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ViabilityViewModal } from "@/pages/presale/presaleproyects/components/ViabilityViewModal";
import { useExerciesOptions } from "@/sharedKernel/hooks/accounting/useExerPer";
import { confirmPdfLimit150 } from "@/sharedKernel/utils/export/confirmPdfLimit";
import type { ColumnSpec } from "@/sharedKernel/utils/export/types";
import { useExportActions } from "@/sharedKernel/utils/export/useExportActions";
import { useOpporChangeStateModal } from "../../hooks/useOpporChangeStateModal";
import { useUploadQuoNewVer } from "../../hooks/useUploadQuoNewVer";
import { DeliverablesModal } from "../modal/changeState/deliverablesModal";
import { OpporChangeStateFormModal } from "../modal/changeState/opporChangeStateFormModal";
import { OpportunityCommentsDialog } from "../modal/commentChat/CommentChatDialogs";
import { FileExplorerDialog } from "../modal/files/fileOpporDialog";
import { OpporQuotationNewVerFormModal } from "../modal/quotationVersion/OpporQuotationNewVerFormModal";
import { OpporActionsCell } from "./OpporActionsCell";
import {
  getReminderState,
  useOpporExportAll,
  useOpporRowSelection,
} from "./helpers";
import { useStateOpporCell } from "./useStateOpporCell";

type Props = {
  data: OpportunitiesResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: OpportunitiesResponseDto) => void;
  onToggleStatus: (row: OpportunitiesResponseDto) => void;
  onDelete: (row: OpportunitiesResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditOppor?: boolean;
  canUseViewComment?: boolean;
  canUseSellerOption?: boolean;
  canExportOppor?: boolean;
  canEditStatusOppor?: boolean;
  canUseFileOption?: boolean;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  year: string;
  setYear: (v: string) => void;
  workerId: string;
  setWorkerId: (v: string) => void;
};
export function OpportunityTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onToggleStatus,
  onVisibleCountChange,
  search,
  onSearchChange,
  canEditOppor = true,
  canUseViewComment = true,
  canExportOppor = true,
  canEditStatusOppor = true,
  canUseFileOption = true,
  canUseSellerOption = true,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  year,
  setYear,
  workerId,
  setWorkerId,
}: Props) {
  const navigate = useNavigate();

  const location = useLocation();

  const [isValidating] = useState(false);

  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);

  const changeStateModal = useOpporChangeStateModal();
  const deliverablesModal = useOpporChangeStateModal();
  const quotationNewVerModal = useUploadQuoNewVer();

  const { data: yearsData } = useExerciesOptions(1, "", 2000);
  const years = yearsData?.items ?? [];

  const { data: workersData } = useSalesWorkerOptions(1, "", 1000);
  const workers = workersData?.items ?? [];

  const [viabilityModalOpen, setViabilityModalOpen] = useState(false);

  const { updateDeliverablesOnlyMut, uploadQuptationNewVerMut } =
    useOpportunitiesMutations();

  const { activeRowId, selectedOpporId, selectRow } = useOpporRowSelection();
  const [deliverablesStateDesc, setDeliverablesStateDesc] =
    useState<string>("");

  const [openComments, setOpenComments] = useState(false);
  const [openFiles, setOpenFiles] = useState(false);

  const { getAllOpporForExport, getForPdfLimit } = useOpporExportAll(
    search,
    undefined,
    startDate,
    endDate,
    year ? Number(year) : undefined,
    workerId ? Number(workerId) : undefined,
  );

  const handleSaveDeliverables = useCallback(
    async (dto: OpportunitiesStateUpdateDto) => {
      try {
        const id = dto.linkToken;
        if (!id) return;
        selectRow(id);
        await updateDeliverablesOnlyMut.mutateAsync(dto);
        deliverablesModal.close();
      } catch (error) {
        console.error("Error guardando entregables", error);
      }
    },
    [deliverablesModal, selectRow, updateDeliverablesOnlyMut],
  );
  const handleOpenDeliverables = useCallback(
    (row: OpportunitiesResponseDto) => {
      const id = row.linkToken;
      if (!id) return;

      selectRow(id);
      setDeliverablesStateDesc(row.stateOpporDesc ?? "");

      deliverablesModal.openEdit(id);
    },
    [deliverablesModal, selectRow],
  );

  const handleOpenStateModal = useCallback(
    (row: OpportunitiesResponseDto) => {
      const id = row.linkToken;
      if (!id) return;
      selectRow(id);
      changeStateModal.openEdit(id);
    },
    [changeStateModal, selectRow],
  );

  const handleOpenComments = useCallback(
    (row: OpportunitiesResponseDto) => {
      const id = row.linkToken;
      if (!id) return;
      selectRow(id);
      setOpenComments(true);
    },
    [selectRow],
  );

  const handleOpenFiles = useCallback(
    (row: OpportunitiesResponseDto) => {
      const id = row.linkToken;
      if (!id) return;
      selectRow(id);
      setOpenFiles(true);
    },
    [selectRow],
  );

  const handleOpenQuotation = useCallback(
    (row: OpportunitiesResponseDto) => {
      const id = row.linkToken;
      if (!id) return;
      selectRow(id);
      quotationNewVerModal.openFor(row);
    },
    [quotationNewVerModal, selectRow],
  );

  const handleCloseViability = useCallback(() => {
    setViabilityModalOpen(false);
  }, []);

  const handleOpenViability = useCallback((row: OpportunitiesResponseDto) => {
    const id = row.linkToken;
    if (!id) return;
    selectRow(id);
    setViabilityModalOpen(true);
  }, []);

  const handleSubmitQuotationNewVer = useCallback(
    async (dto: OpportunitiesUploadNewVerDto) => {
      try {
        await uploadQuptationNewVerMut.mutateAsync({ dto });
        quotationNewVerModal.close();
      } catch (error) {
        console.error("Error uploading quotation version", error);
      }
    },
    [uploadQuptationNewVerMut, quotationNewVerModal],
  );

  const stateOpporCell = useStateOpporCell({
    onOpenStateModal: handleOpenStateModal,
    selectRow,
    openEdit: changeStateModal.openEdit,
  });

  const progressCell = useMemo(() => {
    const base = makeProgressCell({
      percentField: "porcentProgressPro",
      colorField: "stateColor",
    });
    return (ctx: any) => base(ctx);
  }, []);

  const makeCountCell =
    (getCount: (r: OpportunitiesResponseDto) => number) =>
    ({ row }: any) => {
      const count = getCount(row.original);
      const label =
        count === 0 ? "—" : count === 1 ? "1 pendiente" : `${count} pendientes`;
      const colorClass =
        count === 0
          ? "text-gray-500"
          : count === 1
            ? "text-amber-600"
            : "text-red-600";

      return (
        <div className="flex items-center justify-center">
          <span className={`text-sm font-medium ${colorClass}`}>{label}</span>
        </div>
      );
    };

  const columns = useMemo<ColumnDef<OpportunitiesResponseDto, any>[]>(
    () => [
      buildSelectColumn<OpportunitiesResponseDto>(),
      {
        accessorKey: "opporNumber",
        meta: { className: "truncate", label: "N°" },
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            N° <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isActive = statusToBool(row.original.status);
          const opporId = row.original.linkToken;
          const typeOppor = row.original.typeOpporDesc;

          const isReminderEnabled = Boolean(row.original.followupEnabled);
          const reminderDate = row.original.followupNextAt
            ? new Date(row.original.followupNextAt)
            : null;

          const reminderState = getReminderState(
            isReminderEnabled,
            Boolean(row.original.followupSuspended),
            reminderDate,
          );

          const handleNavigate = () => {
            if (opporId)
              navigate(`/crm/opportunity/detail/${opporId}`, {
                state: { fromFilters: location.search },
              });
          };

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={handleNavigate}
                className="text-primary font-medium hover:underline hover:text-primary/80 transition-all disabled:opacity-50"
                title="Ver detalle de oportunidad"
                disabled={!opporId}
              >
                {row.original.opporNumber}
              </button>

              {typeOppor === "PRINCIPAL" ? (
                <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700">
                  <Key className="size-3" />
                  PRINCIPAL
                </span>
              ) : typeOppor === "ADICIONAL" ? (
                <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
                  <FileSymlink className="size-3" />
                  ADICIONAL
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                  SIN DEFINIR
                </span>
              )}

              {isActive ? (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">
                  <BadgeCheck className="size-3" /> activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                  inactivo
                </span>
              )}
              {reminderState !== "NONE" && (
                <button
                  type="button"
                  title={
                    reminderState === "SUSPENDED"
                      ? "Recordatorio suspendido"
                      : reminderState === "EXPIRED"
                        ? "Recordatorio vencido"
                        : "Recordatorio activo"
                  }
                  className={`
                    transition
                    ${
                      reminderState === "ACTIVE" &&
                      "text-amber-500 hover:text-amber-600"
                    }
                    ${reminderState === "SUSPENDED" && "text-zinc-400"}
                    ${
                      reminderState === "EXPIRED" &&
                      "text-rose-600 animate-shake"
                    }
                  `}
                >
                  {reminderState === "ACTIVE" && <Bell className="size-4" />}
                  {reminderState === "SUSPENDED" && (
                    <BellOff className="size-4" />
                  )}
                  {reminderState === "EXPIRED" && (
                    <BellRing className="size-4" />
                  )}
                </button>
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
        accessorKey: "salesName",
        header: () => <div className="text-left">Vendedor</div>,
        meta: {
          className:
            "hidden md:table-cell w-[160px] whitespace-normal break-words text-left align-top",
        },
      },
      {
        accessorKey: "salesPre",
        header: () => <div className="text-left">PreVenta</div>,
        meta: {
          className:
            "hidden md:table-cell w-[150px] whitespace-normal break-words text-left align-top",
        },
      },
      {
        accessorKey: "tasks",
        header: () => <div className="text-center">Tarea</div>,
        meta: {
          className: "hidden md:table-cell w-[110px] text-center align-middle",
        },
        cell: makeCountCell((r) => Number(r.tasks ?? 0)),
      },
      {
        accessorKey: "deliverablesCount",
        header: () => <div className="text-center">Entregables</div>,
        meta: {
          className: "hidden md:table-cell w-[110px] text-center align-middle",
        },
        cell: makeCountCell((r) => Number(r.deliverablesCount ?? 0)),
      },
      {
        accessorKey: "porcentProgressPro",
        header: () => <div className="text-center">% Avance</div>,
        meta: {
          className: "hidden md:table-cell w-[160px] text-center align-middle",
        },
        cell: progressCell,
      },
      {
        accessorKey: "stateGeneral",
        header: () => <div className="text-center">Etapa General</div>,
        meta: {
          className: "hidden md:table-cell w-[140px] text-center align-middle",
        },
        cell: makeStateBadgeCell({
          descField: "stateGeneral",
          colorField: "colorState",
        }),
      },
      {
        accessorKey: "stateOpporDesc",
        header: () => <div className="text-center">Etapa Comercial</div>,
        meta: {
          className: "hidden md:table-cell w-[140px] text-center align-middle",
        },
        cell: stateOpporCell,
      },
      {
        accessorKey: "statePreSales",
        header: () => <div className="text-center">Etapa Pre Venta</div>,
        meta: {
          className: "hidden md:table-cell w-[140px] text-center align-middle",
        },
        cell: makeStateBadgeCell({
          descField: "statePresales",
          colorField: "colorStatePresales",
        }),
      },
      {
        accessorKey: "dateRegister",
        header: () => <div className="text-center">Fecha Creación</div>,
        meta: { className: "hidden lg:table-cell", label: "Fecha Creación" },
        cell: ({ row }) => {
          if (!row.original.dateRegister) return <div className="text-center w-full">—</div>;
          return (
            <div className="text-center w-full">
              <span className="text-gray-700 text-xs">{fmtDate(row.original.dateRegister)}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "quoDate",
        header: () => <div className="text-center">Fin Entrega de Cotización</div>,
        meta: { className: "hidden lg:table-cell", label: "Fin Cotización" },
        cell: ({ row }) => {
          if (!row.original.quoDate) return <div className="text-center w-full">—</div>;
          return (
            <div className="text-center w-full">
              <span className="text-gray-700 text-xs">{fmtDate(row.original.quoDate)}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "dateFinish",
        header: () => <div className="text-center">Fin Oportunidad</div>,
        meta: { className: "hidden lg:table-cell", label: "Fin Oportunidad" },
        cell: ({ row }) => {
          if (!row.original.dateFinish) return <div className="text-center w-full">—</div>;
          return (
            <div className="text-center w-full">
              <span className="text-gray-700 text-xs">{fmtDate(row.original.dateFinish)}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "totalAmount",
        header: () => <div className="text-center">Total Cotización</div>,
        meta: {
          className:
            "hidden md:table-cell min-w-[160px] text-right align-middle",
        },
        cell: ({ row }) => {
          const amount = row.original.totalAmount ?? 0;
          const currency = row.original.currencyDesc ?? "";

          return (
            <div className="font-semibold text-gray-900 tabular-nums whitespace-nowrap">
              {currency}{" "}
              {amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        meta: {
          className:
            "w-[110px] text-right bg-gray-50 hover:bg-blue-100/50 transition-colors z-[10]",
        },
        cell: ({ row }) => (
          <OpporActionsCell
            oppor={row.original}
            canUseViewComment={canUseViewComment}
            canUseFileOption={canUseFileOption}
            canEditOppor={canEditOppor}
            canEditStatusOppor={canEditStatusOppor}
            existQuo={row.original.existQuo ?? 0}
            obsQuo={row.original.obsQuo ?? 0}
            obsQuoResolved={row.original.obsQuoResolved ?? 0}
            preSalesDelivered={row.original.preSalesDelivered ?? 0}
            typeObsEconomic={row.original.typeObsEconomic ?? 0}
            stateOpporDesc={row.original.stateOpporDesc}
            onOpenComments={handleOpenComments}
            onOpenFiles={handleOpenFiles}
            onOpenViability={handleOpenViability}
            onOpenQuotationVer={handleOpenQuotation}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onOpenDeliverables={handleOpenDeliverables}
            onOpenQuotation={(opporId) =>
              navigate(`/pre-sale/quotation/detail/${opporId}`)
            }
            openMenuFor={openMenuFor}
            setOpenMenuFor={setOpenMenuFor}
          />
        ),
      },
    ],
    [
      canEditOppor,
      canEditStatusOppor,
      canUseFileOption,
      canUseViewComment,
      deliverablesModal,
      handleOpenComments,
      handleOpenFiles,
      handleOpenQuotation,
      navigate,
      location.search,
      onEdit,
      onToggleStatus,
      openMenuFor,
      progressCell,
      setOpenMenuFor,
      stateOpporCell,
    ],
  );

  const colsExport: ColumnSpec<OpportunitiesResponseDto>[] = useMemo(
    () => [
      { label: "Num Proyecto", value: (r) => r.opporNumber },
      { label: "Oportunidad", value: (r) => r.opporDesc },
      { label: "Cliente", value: (r) => r.clientsName },
      { label: "Vendedor", value: (r) => r.salesName },
      { label: "Preventa", value: (r) => r.salesPre },
      { label: "Avance", value: (r) => (r.porcentProgressPro ?? 0) + " %" },
      { label: "Etapa General", value: (r) => r.stateGeneral },
      { label: "Etapa comercial", value: (r) => r.stateOpporDesc },
      { label: "Etapa Pre Venta", value: (r) => r.statePresales },
      {
        label: "Fecha Registro",
        value: (r) =>
          r.dateRegister ? fmtDate(r.dateRegister) : "",
      },
      {
        label: "Fin Cotización",
        value: (r) => (r.quoDate ? fmtDate(r.quoDate) : ""),
      },{
        label: "Fin Oportunidad",
        value: (r) => (r.dateFinish ? fmtDate(r.dateFinish) : ""),
      },
      { label: "Total Cotización", value: (r) => `${r.currencyDesc ?? ""} ${r.totalAmount?.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) ?? "0.00"}` },
    ],
    [],
  );

  const exportActions = useExportActions<OpportunitiesResponseDto>({
    colsExport,
    opts: { filePrefix: "Oportunidades", title: "Reporte de Oportunidades" },
    getAllForExport: getAllOpporForExport,
    pdf: {
      limit: 150,
      entityLabel: "oportunidades",
      getForPdf: (onPct) => getForPdfLimit(150, onPct),
      confirm: confirmPdfLimit150,
    },
  });

  return (
    <>
      <DataTable<OpportunitiesResponseDto>
        data={data}
        columns={columns}
        total={total}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onVisibleCountChange={onVisibleCountChange}
        datePickerSlot={
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
            <Calendar className="size-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs text-gray-600 border-none p-0 focus:ring-0 w-28 cursor-pointer"
            />
            <span className="text-gray-300">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs text-gray-600 border-none p-0 focus:ring-0 w-28 cursor-pointer"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="ml-1 p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                title="Limpiar fechas"
              >
                <X className="size-3" />
              </button>
            )}
            {isValidating && (
              <span className="text-xs text-blue-500 ml-2 flex items-center gap-1 animate-pulse">
                <Loader2 size={12} className="animate-spin" /> Verificando...
              </span>
            )}
          </div>
        }
        yearSlot={
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-gray-500">Año</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-transparent text-xs text-gray-700 border-none p-0 focus:ring-0 cursor-pointer"
            >
              <option value="">Todos</option>
              {years.map((y) => (
                <option key={y.value} value={String(y.value)}>
                  {y.label}
                </option>
              ))}
            </select>

            {year && (
              <button
                onClick={() => setYear("")}
                className="p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                title="Limpiar año"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        }
        workerSlot={
          canUseSellerOption ? (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-gray-500">Comercial</span>
              <select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className="bg-transparent text-xs text-gray-700 border-none p-0 focus:ring-0 cursor-pointer max-w-[180px]"
                title="Filtrar por comercial"
              >
                <option value="">Todos</option>
                {workers.map((w) => (
                  <option key={w.value} value={String(w.value)}>
                    {w.label}
                  </option>
                ))}
              </select>

              {workerId && (
                <button
                  onClick={() => setWorkerId("")}
                  className="p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                  title="Limpiar comercial"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          ) : undefined
        }
        exportFns={
          canExportOppor
            ? {
                onCsv: exportActions.onCsv,
                onXlsx: exportActions.onXlsx,
                onPdf: exportActions.onPdf,
              }
            : undefined
        }
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar..."
        tableClassName="w-full table-auto min-w-[1100px] text-sm [&_td]:py-3 [&_th]:py-3 divide-y divide-gray-100"
        rowProps={(row) => {
          const r = row.original;

          const id = r.linkToken ?? null;
          const isActive = activeRowId === id;

          const enabled = Boolean(r.followupEnabled);
          const suspended = Boolean(r.followupSuspended);
          const nextAt = r.followupNextAt ? new Date(r.followupNextAt) : null;

          const isExpired =
            enabled &&
            !suspended &&
            nextAt !== null &&
            nextAt.getTime() < Date.now();

          return {
            className: [
              isActive ? "row-active border-l-4 border-blue-500" : "",
              isExpired ? "reminder-alert" : "",
            ]
              .filter(Boolean)
              .join(" "),
            onClick: () => {
              const tok = r.linkToken;
              if (!tok) return;
              selectRow(tok);
            },
          };
        }}
      />

      <OpporChangeStateFormModal
        open={changeStateModal.open}
        title="Cambiar estado"
        loadingDetail={changeStateModal.isFetching}
        defaultValues={changeStateModal.defaultValues}
        onClose={changeStateModal.close}
        onSubmit={changeStateModal.submit}
        saving={changeStateModal.saving}
        uploadPct={changeStateModal.uploadPct}
        stateOpporLabel="Estado"
        reasonRejectionLabel="Motivo"
        quotationVerNoLabel="Version de Cotización"
      />

      <DeliverablesModal
        open={deliverablesModal.open}
        loadingDetail={deliverablesModal.isFetching}
        stateOpporDesc={deliverablesStateDesc}
        defaultValues={deliverablesModal.defaultValues}
        onClose={deliverablesModal.close}
        onSubmit={handleSaveDeliverables}
        saving={updateDeliverablesOnlyMut.isPending}
      />

      <OpportunityCommentsDialog
        open={openComments}
        linkToken={selectedOpporId}
        onClose={() => setOpenComments(false)}
      />

      <FileExplorerDialog
        open={openFiles}
        linkToken={selectedOpporId}
        onClose={() => setOpenFiles(false)}
      />

      <OpporQuotationNewVerFormModal
        open={quotationNewVerModal.open}
        title="Subir nueva version de la cotizacion"
        defaultValues={quotationNewVerModal.defaultValues}
        onClose={quotationNewVerModal.close}
        onSubmit={handleSubmitQuotationNewVer}
        saving={uploadQuptationNewVerMut.isPending}
      />

      <ViabilityViewModal
        open={viabilityModalOpen}
        onClose={handleCloseViability}
        opportunityToken={selectedOpporId}
      />
    </>
  );
}
