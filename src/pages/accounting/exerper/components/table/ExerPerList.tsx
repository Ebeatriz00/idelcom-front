import type { PeriodsResponseDto } from "@/application/dtos/accounting/exerper/ExerPer.dto";
import { buildSelectColumn } from "@/layouts/components/ui/table/columns";
import { DataTable } from "@/layouts/components/ui/table/dataTable";
import { statusToBool } from "@/sharedKernel/utils/status";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, Pencil, Power, Lock, Unlock, Loader2 } from "lucide-react"; 
import { useMemo } from "react";
import { periodsGuards } from "../../utils/guards";

type PaginationState = { pageIndex: number; pageSize: number };

export function PeriodsList({
  data,
  total,
  pageCount,
  pagination,
  onPaginationChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onVisibleCountChange,
  exercisesEndDate,
  isExerciseBlocked,
  onToggleBlock,
  onBlockLoadingId,
  canEditExPer = true,
  canEditStatusExPer = true,
}: {
  data: PeriodsResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState)
  ) => void;
  onEdit: (row: PeriodsResponseDto) => void;
  onToggleStatus: (row: PeriodsResponseDto) => void;
  onDelete: (row: PeriodsResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  exercisesEndDate: string | null;
  isExerciseBlocked: boolean;
  onToggleBlock: (row: PeriodsResponseDto) => void;
  onBlockLoadingId: number | null;
  canEditExPer?: boolean;
  canEditStatusExPer?: boolean;
}) {
  const columns = useMemo<ColumnDef<PeriodsResponseDto, any>[]>(
    () => [
      buildSelectColumn<PeriodsResponseDto>(),

      {
        accessorKey: "description",
        meta: { className: "truncate", label: "Descripción" },
        enableGlobalFilter: true,
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Descripción <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          const isActive = statusToBool(status);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {row.original.description}
              </span>
              {isActive ? (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[10px]">
                  <BadgeCheck className="size-3" /> activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-gray-100 text-gray-600 px-1.5 py-0.5 text-[10px]">
                  inactivo
                </span>
              )}
            </div>
          );
        },
      },

      {
        accessorKey: "endDate",
        header: "Fecha Fin Periodo",
        enableGlobalFilter: false,
        meta: { className: "hidden sm:table-cell", label: "Fecha Fin" },
        cell: ({ row }) => (
          <span className="text-gray-700">
            {row.original.endDate
              ? new Date(row.original.endDate).toLocaleDateString()
              : "—"}
          </span>
        ),
      },

      {
        id: "exercisesEndDate",
        header: "Fecha Fin Ejercicio",
        meta: {
          className: "hidden sm:table-cell",
          label: "Fecha Fin Ejercicio",
        },
        cell: () => (
          <span className="text-gray-700">
            {exercisesEndDate
              ? new Date(exercisesEndDate).toLocaleDateString()
              : "—"}
          </span>
        ),
      },

      {
        id: "actions",
        header: "Acciones",
        meta: { className: "text-right w-[160px]" }, 
        enableSorting: false,
        cell: ({ row }) => {
          const periodsId = row.original.periodsId;
          const active = statusToBool(row.original.status);
          const inUse = periodsGuards.isInUse(row.original);
          const _canToggle = periodsGuards.canToggle(row.original);

          const isBlocked = !row.original.indBlock; 
          const isProcessingBlock = onBlockLoadingId === periodsId;
          const isDisabledByBlock = isExerciseBlocked || isBlocked;

          return (
            <div className="inline-flex items-center gap-1 justify-end w-full">
              {}
              {canEditExPer && (
              <button
                onClick={() => onEdit(row.original)}
                disabled={isDisabledByBlock}
                className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Editar"
                title={
                  isExerciseBlocked
                    ? "Ejercicio principal bloqueado"
                    : isBlocked
                      ? "Período bloqueado"
                      : "Editar"
                }
              >
                <Pencil className="size-4" />
              </button>
              )}

              {canEditStatusExPer && (
              
              <button
                onClick={() => _canToggle && onToggleStatus(row.original)}
                disabled={!_canToggle || isDisabledByBlock}
                className="rounded-md p-1.5 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Activar/Desactivar"
                title={
                  isExerciseBlocked
                    ? "Ejercicio principal bloqueado"
                    : isBlocked
                      ? "Período bloqueado"
                      : _canToggle
                        ? active
                          ? "Desactivar"
                          : "Activar"
                        : inUse
                          ? "No se puede desactivar: perfil en uso"
                          : "Acción no permitida"
                }
              >
                <Power
                  className={`size-4 ${
                    active ? "text-emerald-600" : "text-gray-400"
                  }`}
                />
              </button>
              )}

              <button
                onClick={() => onToggleBlock(row.original)}
                disabled={isExerciseBlocked || isProcessingBlock}
                className={[
                  "rounded-md p-1.5 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
                  isBlocked ? "text-rose-600" : "text-gray-400",
                ].join(" ")}
                aria-label={isBlocked ? "Desbloquear Período" : "Bloquear Período"}
                title={
                  isExerciseBlocked
                    ? "Desbloqueo no permitido por Ejercicio"
                    : isBlocked
                      ? "Desbloquear Período"
                      : "Bloquear Período"
                }
              >
                {isProcessingBlock ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isBlocked ? (
                  <Lock className="size-4" />
                ) : (
                  <Unlock className="size-4" />
                )}
              </button>
            </div>
          );
        },
      },
    ],
    [onToggleStatus, onDelete, onEdit, isExerciseBlocked, onToggleBlock, onBlockLoadingId, canEditExPer, canEditStatusExPer] 
  );
  return (
    <DataTable<PeriodsResponseDto>
      data={data}
      columns={columns}
      total={total}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      onVisibleCountChange={onVisibleCountChange}
      searchPlaceholder="Buscar… (Descripción de periodo)"
    />
  );
}