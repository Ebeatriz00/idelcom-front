import type {
  ClientActivityCreateDto,
  ClientActivityResponseDto,
  ClientActivityUpdateDto,
  ClientDashboardDto,
  ClientsByIdDto,
  ClientsHistoryResponseDto,
  ClientsResponseDto,
  ClientsStatusDto,
  ClientsUpdateChangeSalesDto,
  ClientsUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  createClients,
  createClientsActivity, 
  deleteClientsActivity, 
  fetchClientDetail,
  fetchClientsActivityList, 
  fetchClientsById,
  fetchClientsList,
  fetchClientsListHistory,
  fetchClientsSelect,
  updateClients,
  updateClientsActivityStatus,
  updateClientsChangeSales,
  updateClientsStatus,
} from "@/infrastructure";
import { useCrmAccountsPerms } from "@/pages/crm/accounts/hooks/permissions/accounts.perms";
import { useLinkContactDialog } from "@/pages/crm/contacts/hooks/useLinkContactDialog";
import {
  closeAlert,
  showAccountLinkedContactConfirm,
  showApiError,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkClients = {
  all: ["clients-crm"] as const,
  lists: () => [...qkClients.all, "list"] as const,
  list: (
    pageIndex: number,
    pageSize: number,
    search: string,
    usersKey: string,
    includeOthers: boolean
  ) =>
    [
      ...qkClients.lists(),
      pageIndex,
      pageSize,
      search,
      usersKey,
      includeOthers,
    ] as const,

  selects: () => [...qkClients.all, "select"] as const,
  select: (page: number, search: string, pageSize: number, usersKey: string) =>
    [...qkClients.selects(), page, search ?? "", pageSize, usersKey] as const,

  byId: (id: number) => [...qkClients.all, "by-id", id] as const,

  history: (id: number) => [...qkClients.all, "history-clients", id] as const,
  detail: (id: number) => [...qkClients.all, "detail", id] as const,

  // === NUEVAS KEYS PARA ACTIVIDADES ===
  activities: (clientsId: number) =>
    [...qkClients.all, "activities", clientsId] as const,
  activityList: (clientsId: number, page: number, pageSize: number) =>
    [...qkClients.activities(clientsId), "list", page, pageSize] as const,
};

// ... (Hooks existentes: useClientsList, useClientsOptions, etc. se mantienen igual) ...

export function useClientsList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const { canViewAllAccount, isLoadingPerms } = useCrmAccountsPerms();
  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr != null ? Number(workerIdStr) : undefined;

  const usersBy: number | undefined = canViewAllAccount
    ? undefined
    : workerId ?? undefined;
  const usersKeyPart: string = canViewAllAccount
    ? "all"
    : workerIdStr ?? "all";

  const enabled = !isLoadingPerms && (canViewAllAccount || !!workerId);

  const includeOthers = !canViewAllAccount && s.length > 0;

  return useQuery<Paginated<ClientsResponseDto>>({
    queryKey: qkClients.list(
      pageIndex,
      pageSize,
      s,
      usersKeyPart,
      includeOthers
    ),
    queryFn: () =>
      fetchClientsList(pageIndex + 1, pageSize, s, usersBy, includeOthers),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useClientsOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();

  const { canViewAllAccount, isLoadingPerms } = useCrmAccountsPerms();
  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr != null ? Number(workerIdStr) : undefined;

  const usersBy = canViewAllAccount ? undefined : workerId;
  const usersKeyPart = canViewAllAccount ? "all" : workerIdStr ?? "all";

  const enabledInternal = !isLoadingPerms && (canViewAllAccount || !!workerId);

  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkClients.select(page, s, pageSize, usersKeyPart),
    queryFn: () => fetchClientsSelect(page, s, pageSize, usersBy),
    placeholderData: (prev) => prev,
    enabled: (opts?.enabled ?? true) && enabledInternal,
    staleTime: 30_000,
  });
}

export function useClientsById(id?: number | null) {
  return useQuery<ClientsByIdDto>({
    queryKey: id != null ? qkClients.byId(id) : qkClients.byId(-1),
    queryFn: () => fetchClientsById(id as number),
    enabled: id != null,
  });
}
export function useClientsHistory(id?: number | null) {
  return useQuery<ClientsHistoryResponseDto[]>({
    queryKey: id != null ? qkClients.history(id) : qkClients.history(-1),
    queryFn: () => fetchClientsListHistory(id as number),
    enabled: id != null,
  });
}

export function useClientDetail(id?: number | null) {
  return useQuery<ClientDashboardDto | null>({
    queryKey: id != null ? qkClients.detail(id) : qkClients.detail(-1),
    queryFn: () => fetchClientDetail(id as number),
    enabled: id != null,
  });
}


export function useClientsActivityList(
  clientsId: number,
  page: number,
  pageSize: number
) {
  return useQuery<Paginated<ClientActivityResponseDto>>({
    queryKey: qkClients.activityList(clientsId, page, pageSize),
    queryFn: () => fetchClientsActivityList(clientsId, page, pageSize),
    enabled: !!clientsId && clientsId > 0,
    placeholderData: (prev) => prev, 
  });
}


export function useClientsActivityMutations(currentClientId?: number) {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ClientActivityCreateDto, "businessId" | "usersBy">
  >({
    mutationFn: createClientsActivity,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", "Actividad registrada correctamente.");
        await qc.invalidateQueries({
          queryKey: qkClients.activities(vars.clientsId),
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar la actividad."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al crear actividad.");
    },
  });

  const deleteMut = useMutation<GlobalResponse, unknown, number>({
    mutationFn: deleteClientsActivity,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", "Actividad eliminada.");
        if (currentClientId) {
          await qc.invalidateQueries({
            queryKey: qkClients.activities(currentClientId),
          });
        } else {
          await qc.invalidateQueries({
            queryKey: [...qkClients.all, "activities"],
          });
        }
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo eliminar la actividad."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al eliminar actividad.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, ClientActivityUpdateDto>({
    mutationFn: updateClientsActivityStatus,
    onSuccess: async (res) => {


      if (res.status === 1) {
        if (currentClientId) {
          await qc.invalidateQueries({
            queryKey: qkClients.activities(currentClientId),
          });
        }
      } else {
        await showApiError({ response: { data: res } }, "Error al cambiar estado.");
      }
    },
    onError: async (e) => {
      await showApiError(e, "Error de conexión al cambiar estado.");
    },
  });

  return { createMut, deleteMut, statusMut };
}

export function useClientsMutations(
  linkContactDialog?: ReturnType<typeof useLinkContactDialog>
) {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ClientsUpsertDto, "clientsId">
  >({
    mutationFn: createClients,
    onSuccess: async (res) => {
      closeAlert();

      if (res.status === 1) {
        const wantsLink = await showAccountLinkedContactConfirm();
        await qc.invalidateQueries({ queryKey: qkClients.lists() });
        if (wantsLink && res.id && linkContactDialog) {
          linkContactDialog.open(res.id);
        }
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el cliente."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando cliente.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, ClientsUpsertDto>({
    mutationFn: updateClients,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkClients.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la clientes."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando clientes.");
    },
  });

  const updateSalesMut = useMutation<
    GlobalResponse,
    unknown,
    ClientsUpdateChangeSalesDto
  >({
    mutationFn: updateClientsChangeSales,
    onSuccess: async (res, dto) => {
      closeAlert();

      if (res.status === 1) {
        await showSuccess("Éxito", res.message);

        const tasks: Promise<unknown>[] = [];

        tasks.push(
          qc.invalidateQueries({
            queryKey: qkClients.lists(),
            refetchType: "active",
          })
        );
        if (dto.clientsId != null) {
          tasks.push(
            qc.invalidateQueries({
              queryKey: qkClients.byId(dto.clientsId),
              refetchType: "active",
            })
          );

          tasks.push(
            qc.invalidateQueries({
              queryKey: qkClients.history(dto.clientsId),
              refetchType: "active",
            })
          );
        }

        await Promise.all(tasks);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar cambiar el vendedor."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando vendedor.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, ClientsStatusDto>({
    mutationFn: updateClientsStatus,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkClients.lists(),
            refetchType: "active",
          }),
          vars.clientsId
            ? qc.invalidateQueries({
                queryKey: qkClients.byId(vars.clientsId),
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

  return { createMut, updateMut, statusMut, updateSalesMut };
}