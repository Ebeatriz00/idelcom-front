import {
  CardContent,
  CardHeader,
  CardSimple,
  CardTitle,
  InputSea,
} from "@/layouts";
import { useDebouncedValue } from "@/sharedKernel";
import type { ExercisesResponseDto } from "@/application/dtos/accounting/exerper/ExerPer.dto";
import { useExercisesList } from "@/sharedKernel/hooks/accounting/useExerPer.ts";
import {
  Search,
  Pencil,
  Power,
  Loader2,
  Lock,
  Unlock,
  ChevronLeft, 
  ChevronRight, 
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { statusToBool } from "@/sharedKernel/utils/status";

type PaginationState = { search: string; pageIndex: number; pageSize: number };

const getExercisesId = (e: ExercisesResponseDto) => e.exercisesId;
const getExercisesLabel = (e: ExercisesResponseDto) => e.description;

export function AsideExercises({
  selectedId,
  onSelect,
  onEditExercise,
  onToggleStatusExercise,
  onToggleLoadingId,
  onToggleBlockExercise,
  onBlockLoadingId,
}: {
  selectedId?: number | string | null;
  onSelect: (row: ExercisesResponseDto) => void;
  onEditExercise: (exercise: ExercisesResponseDto) => void;
  onToggleStatusExercise: (exercise: ExercisesResponseDto) => void;
  onToggleLoadingId: number | null;
  onToggleBlockExercise: (exercise: ExercisesResponseDto) => void;
  onBlockLoadingId: number | null;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [pagination, setPagination] = useState<PaginationState>({
    search: "",
    pageIndex: 0,
    pageSize: 12,
  });

  useEffect(() => {
    setPagination((p) => ({ ...p, search: debouncedSearch, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { data, isFetching } = useExercisesList(
    pagination.search,
    pagination.pageIndex,
    pagination.pageSize
  );

  const list = useMemo(
    () => (data?.items ?? []) as ExercisesResponseDto[],
    [data]
  );
  const total = data?.total ?? 0;
  const pageCount =
    data?.totalPages ??
    Math.max(1, Math.ceil(total / Math.max(1, pagination.pageSize)));

  function handleNextPage() {
    setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }));
  }

  function handlePrevPage() {
    setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }));
  }

  const canGoPrev = pagination.pageIndex > 0;
  const canGoNext = pagination.pageIndex + 1 < pageCount;

  const isEmpty = !isFetching && list.length === 0;

  return (
    <aside className="space-y-3">
      <CardSimple>
        <CardHeader className="pb-2">
          <CardTitle>Ejercicios</CardTitle>
          <div className="relative mt-2">
            <InputSea
              placeholder="Buscar ejercicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="border border-gray-200 rounded-lg max-h-[460px] overflow-auto bg-white shadow-inner-sm">
            {isFetching && list.length === 0 ? (
              <ul className="divide-y divide-gray-100">
                {}
              </ul>
            ) : isEmpty ? (
              <div className="px-3 py-6 text-sm text-gray-500 text-center">
                Sin resultados.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {list.map((ejercicio: ExercisesResponseDto) => {
                  const id = getExercisesId(ejercicio);
                  const selected =
                    selectedId != null && String(selectedId) === String(id);
                  const isActive = statusToBool(ejercicio.status);
                  const isBlocked = !ejercicio.indBlock;
                  const isLoadingStatus = onToggleLoadingId === id;
                  const isLoadingBlock = onBlockLoadingId === id;
                  const isDisabled = isLoadingStatus || isLoadingBlock;

                  return (
                    <li key={id} className="group relative">
                      <button
                        type="button"
                        onClick={() => onSelect(ejercicio)}
                        className={[
                          "w-full text-left px-3 py-2 transition pr-28",
                          "hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
                          selected
                            ? "bg-gray-50 border border-gray-200"
                            : "border border-transparent",
                        ].join(" ")}
                      >
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {getExercisesLabel(ejercicio)}
                        </div>
                      </button>

                      {}
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditExercise(ejercicio);
                          }}
                          disabled={isBlocked || isDisabled}
                          className="rounded-md p-1.5 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Editar"
                          title={isBlocked ? "Ejercicio bloqueado" : "Editar"}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStatusExercise(ejercicio);
                          }}
                          disabled={isBlocked || isDisabled}
                          className={[
                            "rounded-md p-1.5 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
                            isActive ? "text-emerald-600" : "text-gray-400",
                          ].join(" ")}
                          aria-label="Activar/Desactivar"
                          title={
                            isBlocked
                              ? "Ejercicio bloqueado"
                              : isActive
                                ? "Desactivar"
                                : "Activar"
                          }
                        >
                          {isLoadingStatus ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Power className="size-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBlockExercise(ejercicio);
                          }}
                          disabled={isDisabled}
                          className={[
                            "rounded-md p-1.5 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
                            isBlocked ? "text-rose-600" : "text-gray-400",
                          ].join(" ")}
                          aria-label={isBlocked ? "Desbloquear" : "Bloquear"}
                          title={isBlocked ? "Desbloquear" : "Bloquear"}
                        >
                          {isLoadingBlock ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : isBlocked ? (
                            <Lock className="size-4" />
                          ) : (
                            <Unlock className="size-4" />
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {}
          <div className="flex items-center justify-between mt-2 px-1 text-xs text-gray-500">
            <span className="font-medium">
              Pág. {pagination.pageIndex + 1} de {pageCount}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={!canGoPrev || isFetching}
                className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={!canGoNext || isFetching}
                className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Página siguiente"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          {}
        </CardContent>
      </CardSimple>
    </aside>
  );
}