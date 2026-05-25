import type {
  OptionItem,
  PagedSelect,
  Paginated,
  ProcessTypeResponseDto,
  ProcessTypeStatusDto,
  ProcessTypeUpsertDto,
} from "@/application";
import {
  createProcessType,
  fetchProcessTypeById,
  fetchProcessTypeList,
  fetchProcessTypeSelect,
  updateProcessType,
  updateProcessTypeStatus,
} from "@/infrastructure";
import { useCrmProcessPerms } from "@/pages/crm/opportunities/processes/hooks/process.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkProcessType = {
  all: ["process-type"] as const,
  lists: () => [...qkProcessType.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkProcessType.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkProcessType.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkProcessType.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkProcessType.all, "by-id", id] as const,
};

export function useProcessTypeList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllProcess, isLoadingPerms} = useCrmProcessPerms();
    const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllProcess
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllProcess ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllProcess || !!userId);  
  
  return useQuery<Paginated<ProcessTypeResponseDto>>({
    queryKey: qkProcessType.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchProcessTypeList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useProcessTypeOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkProcessType.select(page, s, pageSize),
    queryFn: () => fetchProcessTypeSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useProcessTypeById(id?: number | null) {
  return useQuery<ProcessTypeResponseDto>({
    queryKey: id != null ? qkProcessType.byId(id) : qkProcessType.byId(-1),
    queryFn: () => fetchProcessTypeById(id as number),
    enabled: id != null,
  });
}

export function useProcessTypeMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ProcessTypeUpsertDto, "processTypeId">
  >({
    mutationFn: createProcessType,
    onMutate: () => showLoading("Creando tipos de procesos..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkProcessType.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la tipos de procesos."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando tipos de procesos.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, ProcessTypeUpsertDto>({
    mutationFn: updateProcessType,
    onMutate: () => showLoading("Actualizando tipos de procesos..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkProcessType.lists() }),
          vars.processTypeId
            ? qc.invalidateQueries({
                queryKey: qkProcessType.byId(vars.processTypeId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la tipos de procesos."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando tipos de procesos.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, ProcessTypeStatusDto>({
    mutationFn: updateProcessTypeStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkProcessType.lists(),
            refetchType: "active",
          }),
          vars.processTypeId
            ? qc.invalidateQueries({
                queryKey: qkProcessType.byId(vars.processTypeId),
                refetchType: "active",
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
