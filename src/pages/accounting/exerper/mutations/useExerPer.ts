import type {
  ExercisesResponseDto,
  ExercisesStatusDto,
  ExercisesUpsertDto,
  PeriodsResponseDto,
  PeriodsStatusDto,
  PeriodsUpsertDto,
  ExercisesBlockToggleDto,
  PeriodsBlockToggleDto,
} from "@/application/dtos/accounting/exerper/ExerPer.dto";
import {
  createPeriod,
  updatePeriod,
  createExercises,
  updateExercises,
  updateExercisesStatus,
  updatePeriodStatus,
  updateExercisesBlock,
  createBulkPeriods,
  updatePeriodsBlock, 
} from "@/infrastructure/api-clients/accounting/exerPer.client";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import {
  qkExercises,
  qkPeriods,
} from "@/sharedKernel/hooks/accounting/useExerPer"; 
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchExercisesAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: ExercisesResponseDto) => boolean,
  updater: (it: ExercisesResponseDto) => ExercisesResponseDto
) {
  const caches = qc.getQueriesData<{ items: ExercisesResponseDto[] }>({
    queryKey: qkExercises.lists(),
    exact: false,
  });
  for (const [key, data] of caches) {
    if (!data?.items) continue;
    const next = {
      ...data,
      items: data.items.map((it) => (predicate(it) ? updater(it) : it)),
    };
    qc.setQueryData(key, next);
  }
}

function patchPeriodsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: PeriodsResponseDto) => boolean,
  updater: (it: PeriodsResponseDto) => PeriodsResponseDto
) {
  const caches = qc.getQueriesData<{ items: PeriodsResponseDto[] }>({
    queryKey: qkPeriods.lists(),
    exact: false,
  });
  for (const [key, data] of caches) {
    if (!data?.items) continue;
    const next = {
      ...data,
      items: data.items.map((it) => (predicate(it) ? updater(it) : it)),
    };
    qc.setQueryData(key, next);
  }
}

export const usePeriodsMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<PeriodsUpsertDto, "periodsId">
  >({
    mutationFn: createPeriod,
    onMutate: () => showLoading("Registrando nuevo periodo..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkPeriods.lists(),
          exact: false,
          refetchType: "active",
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar el periodo."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando el periodo.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, PeriodsUpsertDto>({
    mutationFn: updatePeriod,
    onMutate: () => showLoading("Actualizando periodo..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.periodsId) {
          patchPeriodsAfterUpdate(
            qc,
            (it) => it.periodsId === vars.periodsId,
            (it) => ({
              ...it,
              description: vars.description,
              endDate: vars.endDate,
              exercisesId: vars.exercisesId,
              ...(vars.status && { status: vars.status }),
            })
          );
        }
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el periodo."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando el periodo.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, PeriodsStatusDto>({
    mutationFn: updatePeriodStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkPeriods.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error cambiando estado.");
    },
  });

  const bulkCreateMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<PeriodsUpsertDto, "periodsId">[]
  >({
    mutationFn: createBulkPeriods,
    onMutate: () => showLoading("Creando 12 períodos..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {

        await qc.invalidateQueries({ queryKey: qkPeriods.all, exact: false });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el año."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando períodos.");
    },
  });

  const blockMut = useMutation<
    GlobalResponse,
    unknown,
    PeriodsBlockToggleDto 
  >({
    mutationFn: updatePeriodsBlock, 
    onMutate: () => showLoading("Actualizando estado de bloqueo..."),
    onSuccess: async (res, vars) => { // <-- Se usa 'vars' (el DTO enviado)
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        
        // Invalidar la lista de períodos que contiene este período
        await qc.invalidateQueries({
          queryKey: qkPeriods.all, 
          exact: false,
          refetchType: "active",
        });
        
        // Invalidar el detalle del período (si está abierto en un modal)
        await qc.invalidateQueries({
          queryKey: qkPeriods.byId(vars.periodsId), // <-- Usar vars.periodsId directamente
          refetchType: "active",
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado de bloqueo."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error cambiando estado de bloqueo.");
    },
  });

  return { createMut, updateMut, statusMut, bulkCreateMut, blockMut };
};

export const useExercisesMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ExercisesUpsertDto, "exercisesId">
  >({
    mutationFn: createExercises,
    onMutate: () => showLoading("Registrando nuevo ejercicio..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkExercises.lists(),
          exact: false,
          refetchType: "active",
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar el ejercicio."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando el ejercicio.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, ExercisesUpsertDto>({
    mutationFn: updateExercises,
    onMutate: () => showLoading("Actualizando ejercicio..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.exercisesId) {
          patchExercisesAfterUpdate(
            qc,
            (it) => it.exercisesId === vars.exercisesId,
            (it) => ({
              ...it,
              description: vars.description,
              endDate: vars.endDate,
              ...(vars.status && { status: vars.status }),
            })
          );
        }
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el ejercicio."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando el ejercicio.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, ExercisesStatusDto>({
    mutationFn: updateExercisesStatus,
    onMutate: () => showLoading("Actualizando estado del ejercicio..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkExercises.lists(),
          exact: false,
          refetchType: "active",
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error cambiando estado.");
    },
  });

  // --- blockMut AÑADIDO ---
  const blockMut = useMutation<
    GlobalResponse,
    unknown,
    ExercisesBlockToggleDto
  >({
    mutationFn: updateExercisesBlock,
    onMutate: () => showLoading("Actualizando estado de bloqueo..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkExercises.lists(),
          exact: false,
          refetchType: "active",
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado de bloqueo."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error cambiando estado de bloqueo.");
    },
  });

  return { createMut, updateMut, statusMut, blockMut };
};