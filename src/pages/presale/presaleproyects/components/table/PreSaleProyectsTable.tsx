import { buildSelectColumn, DataTable, makeProgressCell, makeStateBadgeCell } from "@/layouts";
import { statusToBool, type ColumnSpec } from "@/sharedKernel";
import { confirmPdfLimit150 } from "@/sharedKernel/utils/export/confirmPdfLimit";
import { useExportActions } from "@/sharedKernel/utils/export/useExportActions";

import type { ColumnDef, ColumnFiltersState, OnChangeFn, SortingState } from "@tanstack/react-table";
import { BadgeCheck, FileText, Power, UserPlus, Calendar, X, FilePenLine, Gavel, Loader2, MessageCircle, MessageSquareDot, Eye } from "lucide-react"; 
import { useMemo, useCallback, useState } from "react"; 
import { useNavigate, useLocation } from "react-router-dom";
import type { PreSaleProyectsResponseDto } from "@/application/dtos/presale/PreSaleProyectsResponse.dto";
import { preSaleProyectsGuards } from "../../utils/guards";
import { useResponsibleModal } from "../../hooks/useResponsibleModal";
import { ResponsibleModal } from "../ResponsibleModal";
import Swal from "sweetalert2"; 

import { useProjectChangeStateModal } from "../../hooks/useProjectChangeStateModal"; 
import { ProjectChangeStateFormModal } from "../ProjectChangeStateFormModal";
import { ViabilityViewModal } from "../ViabilityViewModal"; 

import { ColumnHeader } from "./ColumnHeader"; 
import { HistoryObservationsModal } from "../HistoryObservationsModal";
import { ContractingObservationsModal } from "../ContractingObservationsModal"; 

import { fetchProjectObservationProjectList } from "@/infrastructure/api-clients/observations/observation.client";
import { OpportunityCommentsDialog } from "@/pages/crm/opportunity/components/modal/commentChat/CommentChatDialogs";

import {
  formatPreSaleDate,
  getPreSaleCalendarDate,
  usePreSaleProyectsExportAll,
} from "./helpers";
import type { PreSaleProjectColumnFilters } from "@/infrastructure/api-clients/presale/preSaleProyects.client";
import { ObservationsModalList } from "../ObservationsModalList";

interface Props {
  data: PreSaleProyectsResponseDto[];
  total: number;
  pageCount: number;
  pagination: any;
  onPaginationChange: any;
  onEdit: (row: PreSaleProyectsResponseDto) => void;
  onToggleStatus: (row: PreSaleProyectsResponseDto) => void;
  onAddCollaborators: (row: PreSaleProyectsResponseDto) => void;
  onVisibleCountChange: any;
  search: string;
  onSearchChange: any;
  canViewViability: boolean;
  canAddCollaborators: boolean;
  canUpdateProjectStatus: boolean;
  canAddPreSalesResponsible: boolean;
  canExportPreSale?: boolean; 
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  onRefresh: () => void;
  apiFilters?: PreSaleProjectColumnFilters;
  opporNum?: string;
  stateId?: number;
  categoryId?: number;
}

const STATE_REVISION_ID = 3; 
const OBS_TYPE_CONTRACT = 2; 
const STATUS_COMPLETED = 7;  

export function PreSaleProyectsTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onToggleStatus,
  onAddCollaborators,
  onVisibleCountChange,
  search,
  onSearchChange,
  canViewViability, 
  canAddCollaborators,
  canUpdateProjectStatus,
  canAddPreSalesResponsible,
  canExportPreSale = true, 
  columnFilters,
  onColumnFiltersChange,
  sorting,
  onSortingChange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onRefresh,
  apiFilters,
  opporNum,
  stateId,
  categoryId
}: Props) {
  
  const navigate = useNavigate();
  const location = useLocation();

  const [isValidating, setIsValidating] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [commentsToken, setCommentsToken] = useState<string | null>(null);

  const { open, close, openModal, submit, saving, selectedProject } = useResponsibleModal();
  const {
    open: openState,
    openEdit: openEditState,
    close: closeState,
    submit: submitState,
    defaultValues: defaultValuesState,
    currentStateDesc,
    currentPendingCount,
    currentOpporNumber, 
    saving: savingState
  } = useProjectChangeStateModal();

  const [viabilityModalOpen, setViabilityModalOpen] = useState(false);
  const [selectedOppToken, setSelectedOppToken] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyToken, setHistoryToken] = useState<string | null>(null);
  const [contractingToken, setContractingToken] = useState<string | null>(null);
  const [contractingFinishDate, setContractingFinishDate] = useState<string | null>(null);
  
  // NUEVO ESTADO PARA EL MODAL DE SOLO LECTURA
  const [unrestrictedToken, setUnrestrictedToken] = useState<string | null>(null);

  const sortByStr = sorting.length > 0 ? sorting[0].id : undefined;
  const sortDirectionStr = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined;

  const getDaysDifference = (dateString: string | Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = getPreSaleCalendarDate(dateString);
    if (!target) return 0;
    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTrafficLightStyles = (daysLeft: number) => {
    if (daysLeft < 0) return "bg-red-50 text-red-700 border-red-200 ring-red-500/10";
    if (daysLeft >= 0 && daysLeft <= 2) return "bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/10"; 
    if (daysLeft === 3 || daysLeft === 4) return "bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-500/10"; 
    return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10"; 
  };

  const getDaysText = (daysLeft: number) => {
    if (daysLeft < 0) return `Hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) === 1 ? '' : 's'}`;
    if (daysLeft === 0) return "Hoy";
    if (daysLeft === 1) return "Falta 1 día";
    return `Faltan ${daysLeft} días`;
  };

  const { getAllPreSaleProyectsForExport, getForPdfLimit } = usePreSaleProyectsExportAll(
    search,
    apiFilters,    
    sortByStr,  
    sortDirectionStr, 
    opporNum,       
    stateId,
    categoryId   
  );

  const handleOpenHistory = useCallback((token: string) => {
    setHistoryToken(token);
    setHistoryOpen(true);
  }, []);

  const handleOpenUnrestricted = useCallback((token: string) => {
    setUnrestrictedToken(token);
  }, []);

  const handleOpenContracts = useCallback((token: string, fDate: string | null) => {
    setContractingToken(token);
    setContractingFinishDate(fDate);
  }, []);

  const handleOpenViability = useCallback((token: string) => {
    setSelectedOppToken(token);
    setViabilityModalOpen(true);
  }, []);

  const handleOpenComments = useCallback((token: string) => {
    setCommentsToken(token);
    setOpenComments(true);
  }, []);

  const handleCloseViability = useCallback(() => {
    setViabilityModalOpen(false);
    setSelectedOppToken(null);
  }, []);

  const handleOpenStateModal = useCallback(async (row: PreSaleProyectsResponseDto) => {
    if (!row.responsibleId || row.responsibleId === 0) {
        Swal.fire({
          icon: "warning",
          title: "Asignación requerida",
          text: "Debe asignar un especialista antes de poder cambiar el estado del proyecto.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#3b82f6", 
        });
        return;
    }
    const currentStateId = Number((row as any).statePreSaleId || (row as any).stateId || 0);
    const opportunityStateDesc = row.opportunityStateDesc ;
    const ID_OBSERVADO = 8;
    const incompleteObs = (row as any).obsRevised ?? (row as any).ObsRevised ?? 0;
    if (currentStateId === ID_OBSERVADO && incompleteObs > 0) {
        Swal.fire({
            icon: "warning",
            title: "Observaciones Pendientes",
            text: `Las observaciones derivadas no han sido resueltas.`,
            confirmButtonText: "Entendido",
            confirmButtonColor: "#2563EB", 
        });
        return; 
    }
    if (opportunityStateDesc ==="OBSERVADO"){
      Swal.fire({
            icon: "warning",
            title: "Estado Oportunidad Observado",
            text: `No se puede cambiar el estado del proyecto. Existen observaciones pendientes en el área Comercial.`,
            confirmButtonText: "Entendido",
            confirmButtonColor: "#2563EB", 
        });
        return; 
    }
    if (currentStateId === STATE_REVISION_ID && row.linkToken) {
        setIsValidating(true); 
        try {
            const response = await fetchProjectObservationProjectList("", row.linkToken);
            const items = response?.items || [];
            const hasPendingContracts = items.some((obs: any) => 
                obs.obsType === OBS_TYPE_CONTRACT && 
                (obs.obsStatusId !== STATUS_COMPLETED || !obs.dueDate)
            );
            if (hasPendingContracts) {
                Swal.fire({
                    icon: "warning",
                    title: "Observaciones Pendientes",
                    text: "Tiene observaciones pendientes por resolver.",
                    confirmButtonText: "Entendido",
                    confirmButtonColor: "#f59e0b",
                });
                setIsValidating(false);
                return;
            }
        } catch (error) {
            console.error("Error validando observaciones:", error);
            Swal.fire("Error", "No se pudo verificar las observaciones. Intente nuevamente.", "error");
            setIsValidating(false);
            return;
        }
        setIsValidating(false);
    }
    if (row.linkToken) {
        const currentId = (row as any).statePreSaleId || (row as any).stateId;
        const rawVal = row.preSaleProyectsCount;
        const pendingCount = Array.isArray(rawVal) ? rawVal.length : Number(rawVal ?? 0); 
        openEditState(
          row.linkToken, 
          currentId ? Number(currentId) : undefined, 
          row.businessId, 
          row.statePreSaleDescription, 
          pendingCount,
          row.opportunityNumber || "" 
        );
    }
  }, [openEditState]);

  const statePreSaleCell = useMemo(() => makeStateBadgeCell({
    descField: "statePreSaleDescription",
    colorField: "stateColor",
    onOpen: canUpdateProjectStatus ? handleOpenStateModal : undefined
  }), [handleOpenStateModal, canUpdateProjectStatus]);

  const columns = useMemo<ColumnDef<PreSaleProyectsResponseDto, any>[]>(
    () => [
      buildSelectColumn<PreSaleProyectsResponseDto>(),
      {
        accessorKey: "opportunityNumber", 
        header: ({ column }) => (
          <div className="flex justify-center w-full">
            <ColumnHeader column={column} title="Código" />
          </div>
        ),
        meta: { className: "truncate", label: "Código" },
        cell: ({ row }) => {
          const projectId = row.original.linkToken; 
          const codeDisplay = row.original.opportunityNumber || "-";
          const isActive = statusToBool(row.original.status);
          return (
            <div className="flex items-center justify-center gap-2 w-full">
              <button
                onClick={() => projectId && navigate(`/pre-sale/proyects/detail/${projectId}`, { state: { fromFilters: location.search } })}
                className="text-primary font-medium hover:underline hover:text-primary/80 transition-all"
                disabled={!projectId}
              >
                {codeDisplay}
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
        accessorKey: "startDate",
        header: ({ column }) => (
          <div className="flex justify-center w-full">
            <ColumnHeader column={column} title="Ini. Opor." placeholder="dd/mm/yyyy" />
          </div>
        ),
        meta: { className: "hidden lg:table-cell", label: "Inicio Op." },
        cell: ({ row }) => {
          if (!row.original.startDate) return <div className="text-center w-full">—</div>;
          return (
            <div className="text-center w-full">
              <span className="text-gray-700 text-xs">{formatPreSaleDate(row.original.startDate)}</span>
            </div>
          );
        },
      },
      {
        id: "category",
        header: ({ column }) => (
          <div className="flex justify-center w-full">
            <ColumnHeader column={column} title="Categoría" />
          </div>
        ),
        meta: { className: "hidden sm:table-cell", label: "Categoría" },
        cell: ({ row }) => {
          const catId = (row.original as any).category;
          let label = "SIN CATEGORÍA";
          if (catId === 1) label = "ESTRATÉGICO";
          else if (catId === 2) label = "COMPLEMENTARIO";
          return (
            <div className="flex items-center justify-center w-full">
              <span className="text-gray-800 font-medium text-sm">{label}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <div className="flex justify-start w-full">
            <ColumnHeader column={column} title="Proyecto" placeholder="Filtrar proyecto..." />
          </div>
        ),
        meta: { className: "min-w-[200px] hidden sm:table-cell", label: "Proyecto" },
        cell: ({ row }) => (
            <span className="text-gray-800 font-medium block line-clamp-2 text-left w-full" title={row.original.opportunityDescription ?? ""}>
                {row.original.description}
            </span>
        )
      },
      { 
        accessorKey: "clientsDescription", 
        header: ({ column }) => (
          <div className="flex justify-start w-full">
            <ColumnHeader column={column} title="Cliente" />
          </div>
        ),
        meta: { className: "hidden sm:table-cell", label: "Cliente" },
        cell: ({ row }) => <div className="text-left w-full">{row.original.clientsDescription}</div>
      },
      { 
        accessorKey: "sellerDescription", 
        header: ({ column }) => (
          <div className="flex justify-center w-full">
            <ColumnHeader column={column} title="Vendedor" />
          </div>
        ),
        meta: { className: "hidden md:table-cell", label: "Vendedor" },
        cell: ({ row }) => <div className="text-center w-full">{row.original.sellerDescription}</div>
      },
      {
        accessorKey: "responsibleDescription",
        header: ({ column }) => (
          <div className="flex justify-center w-full">
             <ColumnHeader column={column} title="Especialista" />
          </div>
        ),
        meta: { className: "min-w-[200px] hidden sm:table-cell", label: "Especialista" },
        cell: ({ row }) => {
          const name = row.original.responsibleDescription;
          const isEditable = canAddPreSalesResponsible;
          if (!name && !isEditable) return <span className="text-gray-400 text-sm block w-full text-center">—</span>;
          return (
            <button
                type="button"
                disabled={!isEditable}
                onClick={() => isEditable && openModal({ linkToken: row.original.linkToken ?? "", workerId: row.original.responsibleId, workerName: name ?? undefined, projectCategory: (row.original as any).category })}
                className={`group flex items-center justify-center w-full gap-2 px-2 py-1 rounded-lg text-sm transition-colors 
                  ${isEditable 
                    ? (name ? 'hover:bg-gray-100 text-gray-700 font-medium cursor-pointer' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 italic cursor-pointer')
                    : 'text-gray-700 font-medium cursor-default opacity-100' 
                  }`}
            >
                {name ? (
                  <>
                    <span className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                      {name.charAt(0)}
                    </span>
                    <span>{name}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4" />
                    <span>Asignar</span>
                  </>
                )}
            </button>
          );
        },
      },
      {
        accessorKey: "preSaleProyectsCount",
        header: () => <div className="text-center">Entregables</div>,
        meta: { className: "hidden md:table-cell w-[110px] text-center align-middle" },
        cell: ({ row }) => {
          const rawVal = row.original.preSaleProyectsCount;
          const count = Array.isArray(rawVal) ? rawVal.length : Number(rawVal ?? 0);
          const colorClass = count === 0 ? "text-gray-500" : count === 1 ? "text-amber-600" : "text-red-600";
          return (
            <div className="flex items-center justify-center">
              <button 
                 onClick={() => navigate(`/pre-sale/proyects/tasks/${row.original.linkToken}`)}
                 className={`text-sm font-medium hover:underline hover:scale-105 transition-transform ${colorClass}`}
              >
                  {count === 0 ? "—" : count === 1 ? "1 pendiente" : `${count} pendientes`}
              </button>
            </div>
          );
        },
      },
      { 
          accessorKey: "stateGeneralDesc", 
          header: () => <div className="text-center">Etapa General</div>, 
          meta: { className: "hidden md:table-cell text-center", label: "Etapa General" }, 
          cell: makeStateBadgeCell({ descField: "stateGeneralDesc", colorField: "stateGeneralColor" }) 
      },
      { 
          accessorKey: "opportunityStateDesc", 
          header: ({ column }) => (
            <div className="flex justify-center w-full">
               <ColumnHeader column={column} title="Etapa Comercial" />
            </div>
          ), 
          meta: { className: "hidden md:table-cell text-center", label: "Etapa Comercial" }, 
          cell: makeStateBadgeCell({ descField: "opportunityStateDesc", colorField: "opportunityStateColor" }) 
      },
      { 
          accessorKey: "statePreSaleDescription", 
          header: ({ column }) => (
            <div className="flex justify-center w-full">
               <ColumnHeader column={column} title="Etapa Pre-Venta" />
            </div>
          ), 
          meta: { className: "hidden md:table-cell text-center", label: "Etapa Pre-Venta" }, 
          cell: statePreSaleCell 
      },
      {
        accessorKey: "quoDate",
        header: ({ column }) => (
          <div className="flex justify-center w-full">
            <ColumnHeader column={column} title="Fin Cotización" placeholder="dd/mm/yyyy" />
          </div>
        ),
        meta: { className: "hidden lg:table-cell", label: "Fin Cot." },
        cell: ({ row }) => {
          if (!row.original.quoDate) return <div className="text-center w-full text-gray-400">—</div>;
          
          const statePreSaleId = Number((row.original as any).statePreSaleId || (row.original as any).stateId || 0);
          const dateStr = formatPreSaleDate(row.original.quoDate);

          if (statePreSaleId === 4 || statePreSaleId === 5 || statePreSaleId === 7) {
            return (
              <div className="flex justify-center w-full">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 border border-gray-200">
                  {dateStr}
                </span>
              </div>
            );
          }

          const daysLeft = getDaysDifference(row.original.quoDate);
          const styles = getTrafficLightStyles(daysLeft);
          const daysText = getDaysText(daysLeft);

          return (
            <div className="flex justify-center w-full">
              <div className={`inline-flex flex-col items-center justify-center rounded-lg px-2.5 py-1 text-center border shadow-sm min-w-[90px] ${styles}`}>
                <span className="text-[11px] font-bold leading-none tracking-tight">
                  {dateStr}
                </span>
                <span className="text-[9px] font-medium opacity-80 leading-none mt-1 uppercase">
                  {daysText}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "costTotal",
        header: () => <div className="text-center">Costo Total</div>,
        meta: {
          className:
            "hidden md:table-cell min-w-[160px] text-right align-middle",
        },
        cell: ({ row }) => {
          const amount = row.original.costTotal ?? 0;
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
        accessorKey: "subTotal",
        header: () => <div className="text-center">Subtotal</div>,
        meta: {
          className:
            "hidden md:table-cell min-w-[160px] text-right align-middle",
        },
        cell: ({ row }) => {
          const amount = row.original.subTotal ?? 0;
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
        accessorKey: "totalAmount",
        header: () => <div className="text-center">Monto Total</div>,
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
        accessorKey: "finishDate",
        header: ({ column }) => (
          <div className="flex justify-center w-full">
            <ColumnHeader column={column} title="Fin Oportunidad" placeholder="dd/mm/yyyy" />
          </div>
        ),
        meta: { className: "hidden lg:table-cell", label: "Fin Op." },
        cell: ({ row }) => {
          if (!row.original.finishDate) return <div className="text-center w-full">—</div>;
          return (
            <div className="text-center w-full">
              <span className="text-gray-700 text-xs">{formatPreSaleDate(row.original.finishDate)}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "numPercPro",
        header: () => <div className="text-center">% Avance</div>,
        meta: { className: "hidden md:table-cell w-[100px] text-center", label: "% Avance" },
        cell: makeProgressCell({ percentField: "numPercPro", colorField: "stateColor" }),
      },
      {
        id: "actions",
        header: () => <div className="text-center w-full">Acciones</div>,
        meta: { className: "w-[180px] sticky right-0 bg-white border-l border-gray-100" }, 
        cell: ({ row }) => {
          const active = statusToBool(row.original.status);
          const _canToggle = preSaleProyectsGuards.canToggle(row.original);
          const totalContracts = (row.original as any).contractTotalCount || 0;
          const totalCommercial = (row.original as any).commercialTotalCount || 0;
          const unread = (row.original as any).unreadCommentsCount ?? 0;
          const hasUnread = unread > 0;
          const chatToken = (row.original as any).opportunityLinkToken || row.original.linkToken;
          
          // LÓGICA SOLO PARA MOSTRAR EL NUEVO BOTÓN
          const obsRevised = Number((row.original as any).obsRevised ?? (row.original as any).ObsRevised ?? 0);
          const obsCount = Number((row.original as any).observationsCount ?? 0);
          const isObservado = row.original.opportunityStateDesc === "OBSERVADO";
          const tieneObservaciones = totalCommercial > 0 || obsRevised > 0 || obsCount > 0 || isObservado;

          return (
            <div className="flex w-full items-center justify-center gap-2">
              <button
                onClick={() => chatToken && handleOpenComments(chatToken)}
                className="relative rounded-md p-1.5 hover:bg-blue-100 transition-all"
                aria-label="Mensajes"
                title={hasUnread ? "Tienes comentarios nuevos" : "Ver comentarios"}
              >
                {hasUnread ? <MessageSquareDot className="size-4 text-blue-600" /> : <MessageCircle className="size-4 text-gray-600" />}
                {hasUnread && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 badge-ping" />}
              </button>
              {totalContracts > 0 && (
                <button
                    onClick={() => {
                        const fDate = row.original.finishDate instanceof Date 
                            ? row.original.finishDate.toISOString() 
                            : (row.original.finishDate ?? null);
                        if (row.original.linkToken) handleOpenContracts(row.original.linkToken, fDate);
                    }}
                    className="rounded-md p-1.5 hover:bg-violet-50 text-violet-600 transition-colors border border-transparent hover:border-violet-100"
                    title="Gestión de Contratos"
                >
                    <FilePenLine className="size-4" />
                </button>
              )}
              {totalCommercial > 0 && (
                <button
                    onClick={() => row.original.linkToken && handleOpenHistory(row.original.linkToken)}
                    className="rounded-md p-1.5 hover:bg-orange-50 text-orange-600 transition-colors border border-transparent hover:border-orange-100"
                    title="Ver Observaciones Comerciales"
                >
                    <Gavel  className="size-4" />
                </button>
              )}
              
              {/* ---> NUEVO BOTÓN AGREGADO AQUÍ <--- */}
              {tieneObservaciones && (
                <button
                    onClick={() => row.original.linkToken && handleOpenUnrestricted(row.original.linkToken)}
                    className="rounded-md p-1.5 hover:bg-sky-50 text-sky-600 transition-colors border border-transparent hover:border-sky-100"
                    title="Ver Observaciones (Modo Lectura)"
                >
                    <Eye className="size-4" />
                </button>
              )}

              {canViewViability && (
                <button
                  onClick={() => row.original.linkToken && handleOpenViability(row.original.linkToken)}
                  className="rounded-md p-1.5 hover:bg-indigo-50 text-indigo-600 transition-colors"
                  title="Ver Análisis de Viabilidad"
                >
                  <FileText className="size-4" />
                </button>
              )}
              {canAddCollaborators && (
                <button
                  onClick={() => onAddCollaborators(row.original)}
                  className="rounded-md p-1.5 hover:bg-blue-50 text-blue-600 transition-colors"
                  title="Colaboradores"
                >
                  <UserPlus className="size-4" />
                </button>
              )}
              <button
                onClick={() => _canToggle && onToggleStatus(row.original)}
                disabled={!_canToggle || isValidating} 
                className={`rounded-md p-1.5 transition-colors ${active ? 'hover:bg-red-50 text-emerald-600' : 'hover:bg-emerald-50 text-gray-400'}`}
                title={active ? "Desactivar" : "Activar"}
              >
                {isValidating ? <Loader2 className="size-4 animate-spin"/> : <Power className="size-4" />}
              </button>
            </div>
          );
        },
      },
    ],
    [navigate, location.search, onToggleStatus, onAddCollaborators, statePreSaleCell, handleOpenViability, openModal, handleOpenHistory, handleOpenContracts, canViewViability, canAddCollaborators, canUpdateProjectStatus, canAddPreSalesResponsible, isValidating, handleOpenComments, handleOpenUnrestricted] 
  );

  const colsExport: ColumnSpec<PreSaleProyectsResponseDto>[] = useMemo(() => [
    { label: "Cód.", value: (r) => r.opportunityNumber },
    { label: "Inicio Oportunidad", value: (r) => formatPreSaleDate(r.startDate) },
    { 
      label: "Categoría", 
      value: (r) => {
        const catId = (r as any).category;
        if (catId === 1) return "Estratégico";
        if (catId === 2) return "Complementario";
        return "Sin Categoría";
      } 
    },
    { label: "Proyecto", value: (r) => r.description },
    { label: "Cliente", value: (r) => r.clientsDescription },
    { label: "Vendedor", value: (r) => r.sellerDescription },
    { label: "Responsable", value: (r) => r.responsibleDescription },
    { label: "Etapa General", value: (r) => r.stateGeneralDesc },
    { label: "Estado Comercial", value: (r) => r.opportunityStateDesc },
    { label: "Estado Pre Venta", value: (r) => r.statePreSaleDescription },
    { label: "Fin Cotización", value: (r) => formatPreSaleDate(r.quoDate) },
    { label: "Fin Oportunidad", value: (r) => formatPreSaleDate(r.finishDate) },
    { label: "Avance %", value: (r) => r.numPercPro !== undefined ? `${r.numPercPro}%` : "" },
  ], []);

  const exportActions = useExportActions<PreSaleProyectsResponseDto>({
    colsExport,
    opts: { filePrefix: "ProyectosPreVenta", title: "Reporte de Proyectos" },
    getAllForExport: getAllPreSaleProyectsForExport,
    pdf: {
      limit: 150,
      entityLabel: "proyectos",
      getForPdf: (onPct) => getForPdfLimit(150, onPct),
      confirm: confirmPdfLimit150,
    },
  });

  return (
    <>
      <DataTable<PreSaleProyectsResponseDto>
        data={data ?? []}
        columns={columns}
        total={total}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onVisibleCountChange={onVisibleCountChange}
        columnFilters={columnFilters}
        onColumnFiltersChange={onColumnFiltersChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        datePickerSlot={
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
            <Calendar className="size-4 text-gray-400" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-xs text-gray-600 border-none p-0 focus:ring-0 w-28 cursor-pointer" />
            <span className="text-gray-300">—</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-xs text-gray-600 border-none p-0 focus:ring-0 w-28 cursor-pointer" />
            {(startDate || endDate) && <button onClick={() => { setStartDate(""); setEndDate(""); }} className="ml-1 p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X className="size-3" /></button>}
             {isValidating && <span className="text-xs text-blue-500 ml-2 flex items-center gap-1 animate-pulse"><Loader2 size={12} className="animate-spin"/> Verificando...</span>}
          </div>
        }
        exportFns={canExportPreSale ? { onCsv: exportActions.onCsv, onXlsx: exportActions.onXlsx, onPdf: exportActions.onPdf } : undefined}
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar..."
        tableClassName="w-full table-auto min-w-[1100px] text-sm [&_td]:py-3 [&_th]:py-3 divide-y divide-gray-100"
      />
      <ResponsibleModal open={open} onClose={close} onSubmit={submit} saving={saving} defaultValues={{ linkToken: selectedProject?.linkToken ?? "", workerId: selectedProject?.workerId, projectCategory: selectedProject?.projectCategory ?? 0 }} currentResponsibleName={selectedProject?.workerName} />
      <ProjectChangeStateFormModal open={openState} onClose={closeState} onSubmit={submitState} saving={savingState} defaultValues={defaultValuesState} currentStateLabel={currentStateDesc} pendingCount={currentPendingCount} opporNumber={currentOpporNumber} />
      <ViabilityViewModal open={viabilityModalOpen} onClose={handleCloseViability} opportunityToken={selectedOppToken} />
      <HistoryObservationsModal open={historyOpen} onClose={() => setHistoryOpen(false)} projectToken={historyToken} />
      <ContractingObservationsModal open={!!contractingToken} onClose={() => { setContractingToken(null); setContractingFinishDate(null); }} projectToken={contractingToken} finishDate={contractingFinishDate} />
      <OpportunityCommentsDialog open={openComments} linkToken={commentsToken ?? ""} onClose={() => { setOpenComments(false); onRefresh(); }} />
      
      <ObservationsModalList 
        open={!!unrestrictedToken} 
        onClose={() => setUnrestrictedToken(null)} 
        projectToken={unrestrictedToken} 
      />
    </>
  );
}
