import type {
  LeadsStatusResponseDto,
  LeadsStatusStatusDto,
  LeadsStatusUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  createLeadsStatus,
  fetchLeadsStatusById,
  fetchLeadsStatusList,
  fetchLeadsStatusSelect,
  updateLeadsStatus,
  updateLeadsStatusStatus,
} from "@/infrastructure";
import { useCrmStatusPerms } from "@/pages/crm/leads/status/hooks/status.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import type { GlobalResponse } from "@/sharedKernel/globalResponse";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkLeadsStatus = {
  all: ["leads-status"] as const,
  lists: () => [...qkLeadsStatus.all, "list"] as const,
  list: (
    pageIndex: number,
    pageSize: number,
    search: string,
    usersKey: string
  ) =>
    [
      ...qkLeadsStatus.lists(),
      pageIndex,
      pageSize,
      search ?? "",
      usersKey,
    ] as const,

  selects: () => [...qkLeadsStatus.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkLeadsStatus.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkLeadsStatus.all, "by-id", id] as const,
};

export function useLeadsStatusList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const { canViewAllStatus } = useCrmStatusPerms();
  const userIdStr = useAuth((s) => s.userId);
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersBy: number | undefined = canViewAllStatus
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewAllStatus ? "all" : userIdStr ?? "all";

  return useQuery<Paginated<LeadsStatusResponseDto>>({
    queryKey: qkLeadsStatus.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchLeadsStatusList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useLeadsStatusOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkLeadsStatus.select(page, s, pageSize),
    queryFn: () => fetchLeadsStatusSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useLeadsStatusById(id?: number | null) {
  return useQuery<LeadsStatusResponseDto>({
    queryKey: id != null ? qkLeadsStatus.byId(id) : qkLeadsStatus.byId(-1),
    queryFn: () => fetchLeadsStatusById(id as number),
    enabled: id != null,
  });
}

export function useLeadsStatusMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<LeadsStatusUpsertDto, "leadsStatusId">
  >({
    mutationFn: createLeadsStatus,
    onMutate: () => showLoading("Creando estado leads..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkLeadsStatus.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la estado leads."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando estado leads.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, LeadsStatusUpsertDto>({
    mutationFn: updateLeadsStatus,
    onMutate: () => showLoading("Actualizando estado leads..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkLeadsStatus.lists() }),
          vars.leadsStatusId
            ? qc.invalidateQueries({
                queryKey: qkLeadsStatus.byId(vars.leadsStatusId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la estado leads."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando estado leads.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, LeadsStatusStatusDto>({
    mutationFn: updateLeadsStatusStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkLeadsStatus.lists(),
            refetchType: "active",
          }),
          vars.leadsStatusId
            ? qc.invalidateQueries({
                queryKey: qkLeadsStatus.byId(vars.leadsStatusId),
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
