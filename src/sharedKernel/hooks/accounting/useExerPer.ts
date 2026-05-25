import type { OptionItem, PagedSelect, Paginated } from "@/application";
import type {
  ExercisesBlockToggleDto,
  ExercisesResponseDto,
  ExercisesStatusDto,
  ExercisesUpsertDto,
  PeriodsBlockToggleDto,
  PeriodsResponseDto,
  PeriodsStatusDto,
  PeriodsUpsertDto,
} from "@/application/dtos/accounting/exerper/ExerPer.dto";
import {
  createBulkPeriods,
  createExercises,
  createPeriod,
  fetchExercisesById,
  fetchExercisesList,
  fetchExercisesSelect,
  fetchPeriodById,
  fetchPeriodsList,
  updateExercises,
  updateExercisesBlock,
  updateExercisesStatus,
  updatePeriod,
  updatePeriodsBlock,
  updatePeriodStatus,
} from "@/infrastructure/api-clients/accounting/exerPer.client";
import { useOpAccExPerPerms } from "@/pages/accounting/exerper/hooks/exePer.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkExercises = {
  all: ["exercises"] as const,

  lists: () => [...qkExercises.all, "list"] as const,

  list: (
    search: string,
    pageIndex: number,
    pageSize: number,
    usersKey: string,
  ) => [...qkExercises.lists(), search, pageIndex, pageSize, usersKey] as const,

  selects: () => [...qkExercises.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkExercises.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkExercises.all, "by-id", id] as const,
};

export const qkPeriods = {
  all: ["periods"] as const,

  lists: (exercisesId?: number | null) =>
    [...qkPeriods.all, "list", exercisesId ?? "none"] as const,

  list: (exercisesId: number, pageIndex: number, pageSize: number) =>
    [...qkPeriods.lists(exercisesId), pageIndex, pageSize] as const,

  byId: (id: number) => [...qkPeriods.all, "by-id", id] as const,
};

export function useExercisesList(
  search: string,
  pageIndex: number,
  pageSize: number,
) {
  const s = (search ?? "").trim();

  const { canViewAllExPer, isLoadingPerms } = useOpAccExPerPerms();
  const userIdStr = useAuth((s) => s.userId);
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersBy: number | undefined = canViewAllExPer
    ? undefined
    : (userId ?? undefined);
  const usersKeyPart: string = canViewAllExPer ? "all" : (userIdStr ?? "all");
  const enabled = !isLoadingPerms && (canViewAllExPer || !!userId);

  return useQuery<Paginated<ExercisesResponseDto>>({
    queryKey: qkExercises.list(s, pageIndex, pageSize, usersKeyPart),
    queryFn: () => fetchExercisesList(s, pageIndex + 1, pageSize, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function usePeriodsList(
  exercisesId: number | null,
  pageIndex: number,
  pageSize: number,
) {
  return useQuery<Paginated<PeriodsResponseDto>>({
    enabled: !!exercisesId,
    queryKey: qkPeriods.list(exercisesId ?? 0, pageIndex, pageSize),
    queryFn: () => fetchPeriodsList(exercisesId!, pageIndex + 1, pageSize),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useExerciesOptions(
  page: number,
  search: string,
  pageSize: number,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkExercises.select(page, s, pageSize),
    queryFn: () => fetchExercisesSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function usePeriodById(id?: number | null) {
  return useQuery<PeriodsResponseDto>({
    queryKey: id != null ? qkPeriods.byId(id) : qkPeriods.byId(-1),
    queryFn: () => fetchPeriodById(id as number),
    enabled: id != null,
  });
}

export function useExercisesById(id?: number | null) {
  return useQuery<ExercisesResponseDto>({
    queryKey: id != null ? qkExercises.byId(id) : qkExercises.byId(-1),
    queryFn: () => fetchExercisesById(id as number),
    enabled: id != null,
  });
}

export function useExercisesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ExercisesUpsertDto, "exercisesId">
  >({
    mutationFn: createExercises,
    onMutate: () => showLoading("Creando ejercicio..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkExercises.lists(),
          exact: false,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el ejercicio.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando ejercicio.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, ExercisesUpsertDto>({
    mutationFn: updateExercises,
    onMutate: () => showLoading("Actualizando ejercicio..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkExercises.lists(), exact: false }),
          vars.exercisesId
            ? qc.invalidateQueries({
                queryKey: qkExercises.byId(vars.exercisesId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el ejercicio.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando ejercicio.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, ExercisesStatusDto>({
    mutationFn: updateExercisesStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkExercises.lists(),
            exact: false,
            refetchType: "active",
          }),
          (vars as any).exercisesId
            ? qc.invalidateQueries({
                queryKey: qkExercises.byId((vars as any).exercisesId),
                refetchType: "active",
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error cambiando estado.");
    },
  });

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
          "No se pudo cambiar el estado de bloqueo.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error cambiando estado de bloqueo.");
    },
  });

  return { createMut, updateMut, statusMut, blockMut };
}

export function usePeriodsMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<PeriodsUpsertDto, "periodsId">
  >({
    mutationFn: createPeriod,
    onMutate: () => showLoading("Creando periodo..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkPeriods.lists(),
          exact: false,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el periodo.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando periodo.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, PeriodsUpsertDto>({
    mutationFn: updatePeriod,
    onMutate: () => showLoading("Actualizando periodo..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkPeriods.lists(), exact: false }),
          vars.periodsId
            ? qc.invalidateQueries({ queryKey: qkPeriods.byId(vars.periodsId) })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el periodo.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando periodo.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, PeriodsStatusDto>({
    mutationFn: updatePeriodStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkPeriods.lists(),
            exact: false,
            refetchType: "active",
          }),
          vars.periodsId
            ? qc.invalidateQueries({
                queryKey: qkPeriods.byId(vars.periodsId),
                refetchType: "active",
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
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
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkPeriods.all, exact: false });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el año.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando períodos.");
    },
  });

  const blockMut = useMutation<GlobalResponse, unknown, PeriodsBlockToggleDto>({
    mutationFn: updatePeriodsBlock,
    onMutate: () => showLoading("Actualizando estado de bloqueo..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkPeriods.lists(),
          exact: false,
          refetchType: "active",
        });
        await qc.invalidateQueries({
          queryKey: qkPeriods.byId(vars.periodsId),
          refetchType: "active",
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado de bloqueo.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error cambiando estado de bloqueo.");
    },
  });

  return { createMut, updateMut, statusMut, bulkCreateMut, blockMut };
}
