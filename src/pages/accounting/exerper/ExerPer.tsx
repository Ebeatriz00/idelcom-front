import type {
  ExercisesBlockToggleDto,
  ExercisesResponseDto,
  ExercisesStatusDto,
  PeriodsBlockToggleDto,
  PeriodsResponseDto,
  PeriodsUpsertDto,
} from "@/application/dtos/accounting/exerper/ExerPer.dto";
import { Button } from "@/layouts/components/ui/button";
import {
  CardContent,
  CardHeader,
  CardSimple,
  CardTitle,
} from "@/layouts/presentation/cards/cardSimple";

import {
  qkExercises,
  qkPeriods,
  usePeriodsList,
} from "@/sharedKernel/hooks/accounting/useExerPer";
import {
  useExercisesMutations,
  usePeriodsMutations,
} from "./mutations/useExerPer";

import { showApiError, showWarningConfirm } from "@/sharedKernel";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AsideExercises } from "./components/aside/AsideExerPer";
import { PeriodsFormModal } from "./components/dialog/AssignExerPerDialog";
import { ExercisesFormModal } from "./components/dialog/ExercisesFormModal";
import { PeriodsList } from "./components/table/ExerPerList";
import { useOpAccExPerPerms } from "./hooks/exePer.perms";
import { usePeriodsFormModal } from "./hooks/useExerPerFormModal";
import { useExercisesFormModal } from "./hooks/useExercisesFormModal";

export const getExercisesId = (e: ExercisesResponseDto | null) =>
  e?.exercisesId ?? null;

export const getExercisesLabel = (e: ExercisesResponseDto | null) =>
  e?.description ?? `Ejercicio ${getExercisesId(e) ?? ""}`;

function capitalize(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ExercisesPeriods() {
  const qc = useQueryClient();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [exToggleLoadingId, setExToggleLoadingId] = useState<number | null>(
    null
  );
  const [exBlockLoadingId, setExBlockLoadingId] = useState<number | null>(null);
  const [periodBlockLoadingId, setPeriodBlockLoadingId] = useState<
    number | null
  >(null);

  const [selectedExercises, setSelectedExercises] =
    useState<ExercisesResponseDto | null>(null);
  const selectedExercisesId = useMemo(
    () => getExercisesId(selectedExercises),
    [selectedExercises]
  );

  const {
    open: periodModalOpen,
    openEdit: periodModalOpenEdit,
    close: periodModalClose,
    submit: periodModalSubmit,
    defaultValues: periodModalDefaultValues,
    isFetching: periodModalIsFetching,
    saving: periodModalSaving,
    editingId: periodModalEditingId,
  } = usePeriodsFormModal();

  const {
    open: exModalOpen,
    openCreate: exModalOpenCreate,
    openEdit: exModalOpenEdit,
    close: exModalClose,
    submit: exModalSubmit,
    defaultValues: exModalDefaultValues,
    isFetching: exModalIsFetching,
    saving: exModalSaving,
    editingId: exModalEditingId,
  } = useExercisesFormModal();

  const { canCreateExPer, canEditExPer, canEditStatusExPer, canDeleteExPer } =
    useOpAccExPerPerms();

  const { data } = usePeriodsList(
    selectedExercisesId,
    pagination.pageIndex,
    pagination.pageSize
  );

  const rows: PeriodsResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: PeriodsResponseDto) {
    if (!canEditExPer) return;
    if (row.periodsId) periodModalOpenEdit(row.periodsId);
  }

  const {
    statusMut: periodStatusMut,
    bulkCreateMut,
    blockMut: periodBlockMut,
  } = usePeriodsMutations();

  const { statusMut: exStatusMut, blockMut: exBlockMut } =
    useExercisesMutations();

  async function handleCreateYear() {
    if (!selectedExercises) return;

    const exercisesId = selectedExercises.exercisesId;
    const year = new Date(selectedExercises.endDate).getFullYear();

    try {
      const existingMonthNames = new Set(
        rows.map((row) => row.description.toLowerCase())
      );

      const periodsToCreate: Omit<PeriodsUpsertDto, "periodsId">[] = [];
      const culture = "es-ES";

      for (let i = 0; i < 12; i++) {
        const monthName = new Date(year, i, 1).toLocaleString(culture, {
          month: "long",
        });
        const capitalizedMonthName = capitalize(monthName);

        if (!existingMonthNames.has(capitalizedMonthName.toLowerCase())) {
          const endDate = new Date(year, i + 1, 0);
          const isoEndDate = endDate.toISOString().split("T")[0];

          periodsToCreate.push({
            description: capitalizedMonthName,
            endDate: isoEndDate,
            exercisesId: exercisesId,
          });
        }
      }

      if (periodsToCreate.length === 0) {
        alert("Todos los períodos para este año ya han sido creados.");
        return;
      }

      const confirmed = await showWarningConfirm(
        "¿Desea Agregar los periodos?",
        "Esta acción no se puede deshacer.",
        "Sí, crear",
        "No, cancelar",
        "Creado",
        "Los periodos fueron creados correctamente."
      );

      if (!confirmed) return;
      await bulkCreateMut.mutateAsync(periodsToCreate);
    } catch (error: any) {
      console.error("Error al preparar la creación masiva:", error);
      showApiError(error, "Error al crear períodos.");
    }
  }

  async function onToggleStatus(row: PeriodsResponseDto) {
    if (!canEditStatusExPer) return;
    const current = statusToBool(row.status);
    await periodStatusMut.mutateAsync({
      periodsId: row.periodsId,
      status: boolToStatusString(!current),
    });

    if (selectedExercisesId != null) {
      qc.invalidateQueries({
        queryKey: qkPeriods.list(
          Number(selectedExercisesId),
          pagination.pageIndex,
          pagination.pageSize
        ),
      });
    }
  }

  function handleEditExercise(row: ExercisesResponseDto) {
    exModalOpenEdit(row.exercisesId);
  }

  async function handleToggleStatusExercise(row: ExercisesResponseDto) {
    setExToggleLoadingId(row.exercisesId);
    try {
      const current = statusToBool(row.status);
      await exStatusMut.mutateAsync({
        exercisesId: row.exercisesId,
        status: boolToStatusString(!current),
      } as ExercisesStatusDto);
    } catch (error: any) {
      showApiError(error, "Error al cambiar estado del ejercicio.");
    } finally {
      setExToggleLoadingId(null);
    }
  }

  async function handleToggleBlockExercise(row: ExercisesResponseDto) {
    setExBlockLoadingId(row.exercisesId);
    try {
      const newState = !row.indBlock;
      await exBlockMut.mutateAsync({
        exercisesId: row.exercisesId,
        indBlock: newState,
      } as ExercisesBlockToggleDto);

      if (selectedExercisesId === row.exercisesId) {
        setSelectedExercises((prev) =>
          prev ? { ...prev, indBlock: newState } : null
        );
      }
    } catch (error: any) {
      showApiError(error, "Error al cambiar estado de bloqueo.");
    } finally {
      setExBlockLoadingId(null);
    }
  }
  async function handleToggleBlockPeriod(row: PeriodsResponseDto) {
    setPeriodBlockLoadingId(row.periodsId);
    try {
      const newState = !row.indBlock;
      await periodBlockMut.mutateAsync({
        periodsId: row.periodsId,
        indBlock: newState,
      } as PeriodsBlockToggleDto);

      qc.invalidateQueries({ queryKey: qkPeriods.lists(row.exercisesId) });
    } catch (error: any) {
      showApiError(error, "Error al cambiar estado de bloqueo del período.");
    } finally {
      setPeriodBlockLoadingId(null);
    }
  }

  async function onDeletePeriod(_row: PeriodsResponseDto) {
    if (!canDeleteExPer) return;
  }

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [selectedExercisesId]);

  const isSelectedExerciseBlocked = selectedExercises
    ? !selectedExercises.indBlock
    : false;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Periodos por Ejercicio</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={canCreateExPer ? exModalOpenCreate : undefined}
          >
            <Plus className="h-4 w-4 mr-2" /> Crear Ejercicio
          </Button>

          <Button
            disabled={!selectedExercises}
            onClick={canCreateExPer ? handleCreateYear : undefined}
          >
            <Plus className="h-4 w-4 mr-2" /> Crear Año Completo
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              qc.invalidateQueries({ queryKey: qkExercises.lists() });
              if (selectedExercisesId != null) {
                qc.invalidateQueries({
                  queryKey: qkPeriods.list(
                    Number(selectedExercisesId),
                    pagination.pageIndex,
                    pagination.pageSize
                  ),
                });
              }
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refrescar
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
        <AsideExercises
          selectedId={selectedExercisesId}
          onSelect={(row) => {
            setSelectedExercises(row as ExercisesResponseDto);
          }}
          onEditExercise={handleEditExercise}
          onToggleStatusExercise={handleToggleStatusExercise}
          onToggleLoadingId={exToggleLoadingId}
          onToggleBlockExercise={handleToggleBlockExercise}
          onBlockLoadingId={exBlockLoadingId}
        />

        <section>
          <CardSimple>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>
                  Periodos de:{" "}
                  {selectedExercises ? (
                    <span className="font-semibold">
                      {getExercisesLabel(selectedExercises)}
                    </span>
                  ) : (
                    <span className="italic text-muted-foreground">
                      Selecciona un ejercicio
                    </span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <PeriodsList
                data={rows}
                total={total}
                pageCount={pageCount}
                pagination={pagination}
                onEdit={onEdit}
                onPaginationChange={setPagination}
                onToggleStatus={onToggleStatus}
                onDelete={onDeletePeriod}
                exercisesEndDate={selectedExercises?.endDate ?? null}
                isExerciseBlocked={isSelectedExerciseBlocked}
                onToggleBlock={handleToggleBlockPeriod}
                onBlockLoadingId={periodBlockLoadingId}
              />
            </CardContent>
          </CardSimple>
        </section>
      </div>

      {exModalOpen && (
        <ExercisesFormModal
          open={exModalOpen}
          title={exModalEditingId ? "Editar Ejercicio" : "Crear Ejercicio"}
          loadingDetail={Boolean(exModalEditingId) && exModalIsFetching}
          defaultValues={exModalDefaultValues}
          onClose={exModalClose}
          onSubmit={exModalSubmit}
          saving={exModalSaving}
        />
      )}

      {periodModalOpen && selectedExercisesId != null && (
        <PeriodsFormModal
          open={periodModalOpen}
          title={periodModalEditingId ? "Editar Periodo" : "Crear Periodo"}
          loadingDetail={Boolean(periodModalEditingId) && periodModalIsFetching}
          defaultValues={periodModalDefaultValues}
          onClose={periodModalClose}
          onSubmit={periodModalSubmit}
          saving={periodModalSaving}
          exercisesId={selectedExercisesId}
        />
      )}
    </div>
  );
}
