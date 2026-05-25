import type { HiringResponseDto } from "@/application";
import { buildSelectColumn, DataTable, makeStateBadgeCell } from "@/layouts";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { ArrowUpDown, FolderSearch2, ClipboardList, MessageSquare } from "lucide-react";
import { useMemo } from "react";

export function HiringTable({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  search,
  onSearchChange,
  canEditStatusOpporHiring = true,
  onEditStatus,
  onOpenFile,
  onOpenDeliverables,
  onOpenObservations, 
}: {
  data: HiringResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditStatusOpporHiring?: boolean;
  onEditStatus?: (row: HiringResponseDto) => void;
  onOpenFile?: (token: string) => void;
  onOpenDeliverables?: (token: string, taskInfo?: any) => void;
  onOpenObservations?: (token: string) => void;
}) {

  const stateOpporCell = useMemo(
    () =>
      makeStateBadgeCell({
        descField: "opporStatus",
        colorField: "opporStatusColor",
      }),
    []
  );

  const stateOpporHiringCell = useMemo(
    () =>
      makeStateBadgeCell({
        descField: "hiringStatus",
        colorField: "hiringStatusColor",
        onOpen: canEditStatusOpporHiring ? onEditStatus : undefined,
      }),
    [canEditStatusOpporHiring, onEditStatus]
  );

  const columns = useMemo<ColumnDef<HiringResponseDto, any>[]>(
    () => [
      buildSelectColumn<HiringResponseDto>(),
      {
        accessorKey: "opporNum",
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
        cell: ({ row }) => (
          <span className="font-medium text-gray-900 truncate">
            {row.original.opporNum}
          </span>
        ),
      },
      {
        accessorKey: "opporDesc",
        header: "Oportunidad",
        meta: { className: "hidden sm:table-cell", label: "Oportunidad" },
        cell: ({ row }) => (
          <span className="text-gray-700">
            {row.original.opporDesc}
          </span>
        ),
      },
      {
        accessorKey: "clientsName",
        header: "Cliente",
        meta: { className: "hidden sm:table-cell", label: "Cliente" },
      },
      {
        accessorKey: "opporStatus",
        header: () => <div className="text-center w-full">Etapa comercial</div>,
        meta: { className: "text-center", label: "Etapa comercial" },
        cell: (props) => (
          <div className="flex justify-center items-center w-full">
            {stateOpporCell(props)}
          </div>
        ),
      },
      {
        accessorKey: "hiringStatus",
        header: () => <div className="text-center w-full">Etapa Contrataciones</div>,
        meta: { className: "text-center", label: "Etapa Contrataciones" },
        cell: (props) => (
          <div className="flex justify-center items-center w-full">
            {stateOpporHiringCell(props)}
          </div>
        ),
      },
      
      {
        id: "files",
        header: () => <div className="text-center w-full">Acciones</div>,
        meta: { className: "w-[150px] text-right sticky right-0 bg-white border-l border-gray-100" }, 
        cell: ({ row }) => {
          const item = row.original as any;
          const unreadCount = item.unreadFilesCount ?? 0;
          const hasUnread = unreadCount > 0;

          const isOpporValid = item.stateOpportunityId === 3; 
          const isHiringValid = item.licStatusId === 1;       
          const hasTask = !!item.tasksId; 
          const isTaskMode = isOpporValid && isHiringValid && hasTask;

          const taskInfo = isTaskMode ? {
             taskId: String(item.tasksId),
             taskDesc: item.taskDesc,
             taskColor: item.taskColor
          } : null;

          const obsStatusId = Number(item.obsStatusId || 0);

          return (
            <div className="flex items-center justify-center gap-2">
              
               {obsStatusId > 0 && (
                <button
                  type="button"
                  title="Ver observaciones"
                  onClick={() => {
                     const token = item.linkToken || item.opporToken;
                     if (onOpenObservations && token) {
                       onOpenObservations(String(token));
                     }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    obsStatusId === 7 
                        ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" 
                        : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  <MessageSquare className="size-4" />
                </button>
              )}

              <button
                type="button"
                title={isTaskMode ? `Ver Tarea (${item.taskDesc})` : "Ver consultas"}
                onClick={() => {
                   const token = item.linkToken || item.opporToken || item.opporId;
                   if (onOpenDeliverables && token) {
                     onOpenDeliverables(String(token), taskInfo);
                   }
                }}
                className={`p-2 rounded-lg transition-colors ${
                   isTaskMode 
                     ? "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" 
                     : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                }`}
              >
                <ClipboardList className="size-4" />
              </button>

              <button
                type="button"
                title={hasUnread ? "Tienes archivos nuevos" : "Ver archivos adjuntos"}
                onClick={() => {
                  const token = item.linkToken || item.opporToken;
                  if (onOpenFile && token) onOpenFile(String(token));
                }}
                className="relative p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <FolderSearch2 className="size-4" />
                {hasUnread && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </button>
            </div>
          );
        },
      },
    ],
    [stateOpporCell, stateOpporHiringCell, onOpenFile, onOpenDeliverables, onOpenObservations]
  );

  return (
    <DataTable<HiringResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar..."
    />
  );
}