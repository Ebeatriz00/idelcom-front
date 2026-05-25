import type {
  OptionItem,
  PagedSelect,
  Paginated,
  WorkerResponseDto,
  WorkerStatusDto,
  WorkerUpsertDto,
} from "@/application";
import {
  createWorker,
  fetchSalesWorkerSelect,
  fetchWorkerById,
  fetchWorkerList,
  fetchWorkerOperationsSelect,
  fetchWorkerProyectSelect,
  fetchWorkerSelect,
  fetchWorkerSquadSelect,
  updateWorker,
  updateWorkerStatus,
} from "@/infrastructure";
import { useHrWorkerPerms } from "@/pages/rrhh/Worker/hooks/worker.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkWorker = {
  all: ["workers"] as const,
  lists: () => [...qkWorker.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkWorker.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkWorker.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkWorker.selects(), page, search ?? "", pageSize] as const,

  selectsSales: () => [...qkWorker.all, "select-sales"] as const,
  selectSales: (page: number, search: string, pageSize: number) =>
    [...qkWorker.selectsSales(), page, search ?? "", pageSize] as const,

  selectsProyect: () => [...qkWorker.all, "select-proyect"] as const,
  selectProyect: (page: number, search: string, pageSize: number) =>
    [...qkWorker.selectsProyect(), page, search ?? "", pageSize] as const,

  selectsOperations: () => [...qkWorker.all, "select-operations"] as const,
  selectOperations: (page: number, search: string, pageSize: number) =>
    [...qkWorker.selectsOperations(), page, search ?? "", pageSize] as const,

  selectsSquad: () => [...qkWorker.all, "select-squad"] as const,
  selectSquad: (operationsId: number, page: number, search: string, pageSize: number) =>
    [...qkWorker.selectsSquad(), operationsId, page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkWorker.all, "by-id", id] as const,
};

export function useWorkerList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllWorker, isLoadingPerms} = useHrWorkerPerms();
  const userIdStr = useAuth((s) => s.userId);  
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersBy: number | undefined = canViewAllWorker
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewAllWorker ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewAllWorker || !!userId);


  return useQuery<Paginated<WorkerResponseDto>>({
    queryKey: qkWorker.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchWorkerList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useWorkerById(id?: number | null) {
  return useQuery<WorkerResponseDto>({
    queryKey: id != null ? qkWorker.byId(id) : qkWorker.byId(-1),
    queryFn: () => fetchWorkerById(id as number),
    enabled: id != null,
  });
}

export function useSalesWorkerOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkWorker.selectSales(page, s, pageSize),
    queryFn: () => fetchSalesWorkerSelect(page, pageSize, s),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useWorkerProyectOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkWorker.selectProyect(page, s, pageSize),
    queryFn: () => fetchWorkerProyectSelect(page, pageSize, s),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useWorkerOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkWorker.select(page, s, pageSize),
    queryFn: () => fetchWorkerSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useWorkerOperationsOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkWorker.selectOperations(page, s, pageSize),
    queryFn: () => fetchWorkerOperationsSelect(page, pageSize, s),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useWorkerSquadOptions(
  operationsId: number,
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkWorker.selectSquad(operationsId, page, s, pageSize),
    queryFn: () => fetchWorkerSquadSelect(operationsId, page, pageSize, s),
    placeholderData: (prev) => prev,
    enabled: (opts?.enabled ?? true) && !!operationsId,
    staleTime: 30_000,
  });
}

export function useWorkerMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<WorkerUpsertDto, "workerId">
  >({
    mutationFn: createWorker,
    onMutate: () => showLoading("Creando trabajador..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkWorker.lists(),
          exact: false,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el trabajador."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando trabajador.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, WorkerUpsertDto>({
    mutationFn: updateWorker,
    onMutate: () => showLoading("Actualizando trabajador..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);

        await Promise.all([
          qc.invalidateQueries({ queryKey: qkWorker.lists(), exact: false }),
          vars.workerId
            ? qc.invalidateQueries({ queryKey: qkWorker.byId(vars.workerId) })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el trabajador."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando trabajador.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, WorkerStatusDto>({
    mutationFn: updateWorkerStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkWorker.lists(),
            exact: false,
          }),
          vars.workerId
            ? qc.invalidateQueries({
                queryKey: qkWorker.byId(vars.workerId),
              })
            : Promise.resolve(),
        ]);
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

  return { createMut, updateMut, statusMut };
}
