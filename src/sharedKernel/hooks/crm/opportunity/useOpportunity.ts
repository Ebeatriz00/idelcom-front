import type {
  ActivityOpporCreateDto,
  ActivityOpporDeleteDto,
  FileTrackingOpperDeleteDto,
  FileTrackingOpporCreateDto,
  OpportunitiesByIdDto,
  OpportunitiesClientsGetByIdDto,
  OpportunitiesClientsUpdateDto,
  OpportunitiesDetailDto,
  OpportunitiesResponseDto,
  OpportunitiesStateUpdateDto,
  OpportunitiesStatusDto,
  OpportunitiesUploadNewVerDto,
  OpportunitiesUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  createActivityOppor,
  createFileTrackingOppor,
  createOpportunities,
  deleteActivityOppor,
  deleteFileTrackingOppor,
  fetchDeliverablesHiringOptions,
  fetchDeliverablesOptions,
  fetchDetailOpportunities,
  fetchFlowTypeSelect,
  fetchOpportunitiesById,
  fetchOpportunitiesClientsById,
  fetchOpportunitiesCode,
  fetchOpportunitiesList,
  fetchOpportunitiesSelect,
  fetchOpportunitiesStateById,
  fetchQuotationVerNoSelect,
  fetchUploadNewQuotaVer,
  markOpportunityCommentsRead,
  opportunitiesUpdateClient,
  opportunitiesUpdateDeliverables,
  opportunitiesUpdateState,
  updateActivityChangePriorityState,
  updateActivityChangeState,
  updateOpportunities,
  updateOpportunitiesStatus,
} from "@/infrastructure";
import { useCrmOpporPerms } from "@/pages/crm/opportunity/hooks/oppor.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { qkOpportunities } from "./opportunities.qk";

type OpportunitiesListResult = {
  items: OpportunitiesResponseDto[];
  total: number;
  totalPages: number;
};

export function useOpportunitiesList(
  pageIndex: number,
  pageSize: number,
  search?: string,
  stateId?: number,
  filterStartDate?: Date,
  filterFinishDate?: Date,
  filterYear?: number,
  workerId?: number,
) {
  const s = (search ?? "").trim();
  const { canViewAllOppor, isLoadingPerms } = useCrmOpporPerms();

  const workerIdStr = useAuth((s) => s.workerId);
  const myWorkerId = workerIdStr != null ? Number(workerIdStr) : undefined;

  const effectiveWorkerFilter: number | undefined = canViewAllOppor
    ? (workerId ?? undefined)
    : (myWorkerId ?? undefined);

  const workerKeyPart: string = canViewAllOppor
    ? String(workerId ?? "all")
    : String(workerIdStr ?? "all");

  const enabled = !isLoadingPerms && (canViewAllOppor || !!myWorkerId);

  return useQuery<Paginated<OpportunitiesResponseDto>>({
    queryKey: qkOpportunities.list(
      pageIndex,
      pageSize,
      s,
      workerKeyPart,
      stateId,
      filterStartDate,
      filterFinishDate,
      filterYear,
    ),
    queryFn: () =>
      fetchOpportunitiesList(
        pageIndex + 1,
        pageSize,
        s,
        effectiveWorkerFilter,
        stateId,
        filterStartDate,
        filterFinishDate,
        filterYear,
      ),
    retry: false,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}
export function useOpportunitiesOptions(
  clientsId: number,
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkOpportunities.selectOppor(clientsId, page, s, pageSize),
    queryFn: () => fetchOpportunitiesSelect(clientsId, page, s, pageSize),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useFlowTypeOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkOpportunities.selectFlowType(page, s, pageSize),
    queryFn: () => fetchFlowTypeSelect(page, s, pageSize),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function DeliverablesOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkOpportunities.select(page, s, pageSize),
    queryFn: () => fetchDeliverablesOptions(page, s, pageSize),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function DeliverablesHiringOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkOpportunities.selectHiring(page, s, pageSize),
    queryFn: () => fetchDeliverablesHiringOptions(page, s, pageSize),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function QuotationVersionNoOptions(
  page: number = 1,
  resourceId: string,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkOpportunities.selectQuotationVerNo(
      page,
      resourceId,
      s,
      pageSize,
    ),
    queryFn: () => fetchQuotationVerNoSelect(page, resourceId, s, pageSize),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

type UseOppByIdOpts = Omit<
  UseQueryOptions<OpportunitiesByIdDto>,
  "queryKey" | "queryFn" | "enabled"
> & {
  enabled?: boolean;
};

export function useOpportunitiesById(
  id?: string | null,
  opts?: UseOppByIdOpts,
) {
  const enabled = (opts?.enabled ?? true) && !!id;

  return useQuery<OpportunitiesByIdDto>({
    queryKey: qkOpportunities.byId(id ?? "none"), 
    queryFn: () => fetchOpportunitiesById(id!),
    retry: false,
    ...opts,
    enabled,
  });
}

export function useOpportunitiesClientsById(id?: string | null) {
  return useQuery<OpportunitiesClientsGetByIdDto>({
    queryKey:
      id != null
        ? qkOpportunities.clientsById(id)
        : qkOpportunities.clientsById(-1),
    queryFn: () => fetchOpportunitiesClientsById(id as string),
    retry: false,
    enabled: id != null,
  });
}

export function useOpportunitiesStateById(id?: string | null) {
  return useQuery<OpportunitiesStateUpdateDto>({
    queryKey:
      id != null
        ? qkOpportunities.stateById(id)
        : qkOpportunities.stateById(-1),
    queryFn: () => fetchOpportunitiesStateById(id as string),
    retry: false,
    enabled: id != null,
  });
}

export function useOpportunitiesCode() {
  return useQuery<string>({
    queryKey: qkOpportunities.code(),
    queryFn: fetchOpportunitiesCode,
    retry: false,
    staleTime: 60_000,
  });
}

export function useDetailOpportunities(id?: string | null) {
  const { canViewAllOppor, isLoadingPerms } = useCrmOpporPerms();
  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr ? Number(workerIdStr) : undefined;

  const hasWorker = !!workerId;

  const usersBy: number | undefined = canViewAllOppor ? undefined : workerId;

  const usersKeyPart: string = canViewAllOppor
    ? "all"
    : workerIdStr
      ? `worker-${workerIdStr}`
      : "none";

  const shouldBlock = !isLoadingPerms && !canViewAllOppor && !hasWorker;

  if (shouldBlock && id) {
    console.warn(
      "[useDetailOpportunities] Usuario sin workerId intentando ver detalle de oportunidad",
      { workerIdStr, workerId, canViewAllOppor },
    );
  }

  const enabled = !isLoadingPerms && !!id && !shouldBlock;

  return useQuery<OpportunitiesDetailDto>({
    queryKey: qkOpportunities.detailById(
      enabled ? id! : "disabled",
      usersKeyPart,
    ),
    queryFn: () => fetchDetailOpportunities(id!, usersBy),
    retry: false,
    enabled,
  });
}

export function useMarkOppCommentsRead() {
  const qc = useQueryClient();

  return useMutation<void, unknown, { linkToken: string }>({
    mutationFn: ({ linkToken }) => markOpportunityCommentsRead(linkToken),
    onSuccess: (_, { linkToken }) => {
      qc.setQueriesData<OpportunitiesListResult>(
        { queryKey: qkOpportunities.lists() },

        (old) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.map((o) =>
              o.linkToken === linkToken ? { ...o, unreadCommentsCount: 0 } : o,
            ),
          };
        },
      );
    },
  });
}

export function useOpportunitiesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<OpportunitiesUpsertDto, "linkToken">
  >({
    mutationFn: createOpportunities,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkOpportunities.lists() });
        await qc.invalidateQueries({ queryKey: ["dashboard"] });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la oportunidad.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando oportunidad.");
    },
  });

  const updateDeliverablesOnlyMut = useMutation<
    GlobalResponse,
    unknown,
    OpportunitiesStateUpdateDto
  >({
    mutationFn: opportunitiesUpdateDeliverables,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkOpportunities.lists() }),
          vars.linkToken
            ? Promise.all([
                qc.invalidateQueries({
                  queryKey: qkOpportunities.byId(vars.linkToken),
                }),
                qc.invalidateQueries({
                  queryKey: qkOpportunities.detailById(vars.linkToken),
                }),
              ])
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar los entregables.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando entregables.");
    },
  });

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    OpportunitiesUpsertDto
  >({
    mutationFn: updateOpportunities,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkOpportunities.lists() }),
          qc.invalidateQueries({ queryKey: qkOpportunities.code() }),
          qc.invalidateQueries({ queryKey: ["dashboard"] }),
          vars.linkToken
            ? qc.invalidateQueries({
                queryKey: qkOpportunities.byId(vars.linkToken),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la oportunidad.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando oportunidad.");
    },
  });

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    OpportunitiesStatusDto
  >({
    mutationFn: updateOpportunitiesStatus,
    retry: false,
    onMutate: (vars) =>
      showLoading(
        vars.status === "1"
          ? "Activando oportunidad..."
          : "Desactivando oportunidad...",
      ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkOpportunities.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
  });

  const updateChangeStateMut = useMutation<
    GlobalResponse,
    unknown,
    { dto: OpportunitiesStateUpdateDto; onProgress?: (pct: number) => void }
  >({
    mutationFn: opportunitiesUpdateState,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkOpportunities.lists() }),
          vars.dto.linkToken
            ? Promise.all([
                qc.invalidateQueries({
                  queryKey: qkOpportunities.byId(vars.dto.linkToken),
                }),
                qc.invalidateQueries({
                  queryKey: qkOpportunities.stateById(vars.dto.linkToken),
                }),
                qc.invalidateQueries({
                  queryKey: qkOpportunities.detailById(vars.dto.linkToken),
                }),
              ])
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la oportunidad.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando oportunidad.");
    },
  });

  const uploadQuptationNewVerMut = useMutation<
    GlobalResponse,
    unknown,
    { dto: OpportunitiesUploadNewVerDto; onProgress?: (pct: number) => void }
  >({
    mutationFn: fetchUploadNewQuotaVer,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkOpportunities.lists() }),
          vars.dto.linkToken
            ? Promise.all([
                qc.invalidateQueries({
                  queryKey: qkOpportunities.byId(vars.dto.linkToken),
                }),
                qc.invalidateQueries({
                  queryKey: qkOpportunities.stateById(vars.dto.linkToken),
                }),
                qc.invalidateQueries({
                  queryKey: qkOpportunities.detailById(vars.dto.linkToken),
                }),
              ])
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la oportunidad.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando oportunidad.");
    },
  });

  const updateChangeClientsMut = useMutation<
    GlobalResponse,
    unknown,
    OpportunitiesClientsUpdateDto
  >({
    mutationFn: opportunitiesUpdateClient,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkOpportunities.lists() }),
          vars.linkToken
            ? Promise.all([
                qc.invalidateQueries({
                  queryKey: qkOpportunities.byId(vars.linkToken),
                }),
                qc.invalidateQueries({
                  queryKey: qkOpportunities.clientsById(vars.linkToken),
                }),
                qc.invalidateQueries({
                  queryKey: qkOpportunities.detailById(vars.linkToken),
                }),
              ])
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la oportunidad.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando oportunidad.");
    },
  });
  return {
    createMut,
    updateMut,
    statusMut,
    updateChangeStateMut,
    updateChangeClientsMut,
    updateDeliverablesOnlyMut,
    uploadQuptationNewVerMut,
  };
}

export function useFTOpportunitiesMutations() {
  const qc = useQueryClient();

  const createFTMut = useMutation<
    GlobalResponse,
    unknown,
    FileTrackingOpporCreateDto & { silent?: boolean }
  >({
    mutationFn: createFileTrackingOppor,
    retry: false,
    onSuccess: async (res, variables) => {
      closeAlert();
      if (res.status === 1) {
        if (!variables.silent) {
          await showSuccess("Éxito", res.message);
        }
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo agregar el archivo.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error agregando archivo.");
    },
    onSettled: async (_res, _err, vars) => {
      if (vars?.opporToken) {
        await qc.invalidateQueries({
          queryKey: qkOpportunities.detailById(vars.opporToken),
        });
        await qc.refetchQueries({
          queryKey: qkOpportunities.detailById(vars.opporToken),
          type: "active",
        });
      }
      await qc.invalidateQueries({ queryKey: qkOpportunities.all });
    },
  });

  const delelteFTMut = useMutation<
    GlobalResponse,
    unknown,
    FileTrackingOpperDeleteDto
  >({
    mutationFn: deleteFileTrackingOppor,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo eliminar el archivo.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error eliminando archivo.");
    },
    onSettled: async (_res, _err, vars) => {
      if (vars?.opporToken) {
        await qc.invalidateQueries({
          queryKey: qkOpportunities.detailById(vars.opporToken),
        });
        await qc.refetchQueries({
          queryKey: qkOpportunities.detailById(vars.opporToken),
          type: "active",
        });
      }
      await qc.invalidateQueries({ queryKey: qkOpportunities.all });
    },
  });

  return { createFTMut, delelteFTMut };
}

export function useACOpportunitiesMutations() {
  const qc = useQueryClient();

  const createACMut = useMutation<
    GlobalResponse,
    unknown,
    ActivityOpporCreateDto
  >({
    mutationFn: createActivityOppor,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo agregar el acitividad.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error agregando acitividad.");
    },
    onSettled: async (_res, _err, vars) => {
      if (vars?.opporToken) {
        await qc.invalidateQueries({
          queryKey: qkOpportunities.detailById(vars.opporToken),
        });
        await qc.refetchQueries({
          queryKey: qkOpportunities.detailById(vars.opporToken),
          type: "active",
        });
      }
      await qc.invalidateQueries({ queryKey: qkOpportunities.all });
    },
  });

  const delelteACMut = useMutation<
    GlobalResponse,
    unknown,
    ActivityOpporDeleteDto
  >({
    mutationFn: deleteActivityOppor,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo eliminar la Actividad.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error eliminando Actividad.");
    },
    onSettled: async (_res, _err, vars) => {
      if (vars?.opporToken) {
        await qc.invalidateQueries({
          queryKey: qkOpportunities.detailById(vars.opporToken),
        });
        await qc.refetchQueries({
          queryKey: qkOpportunities.detailById(vars.opporToken),
          type: "active",
        });
      }
      await qc.invalidateQueries({ queryKey: qkOpportunities.all });
    },
  });

  const ActivitystateChangeMut = useMutation<
    GlobalResponse,
    unknown,
    { linkToken: string; status: string; opporToken: string }
  >({
    mutationFn: updateActivityChangeState,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkOpportunities.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
    onSettled: async (_res, _err, vars) => {
      if (vars?.opporToken) {
        await qc.invalidateQueries({
          queryKey: qkOpportunities.detailById(vars.opporToken),
        });
        await qc.refetchQueries({
          queryKey: qkOpportunities.detailById(vars.opporToken),
          type: "active",
        });
      }
      await qc.invalidateQueries({ queryKey: qkOpportunities.all });
    },
  });

  const ActivitystateChangePriorityMut = useMutation<
    GlobalResponse,
    unknown,
    { linkToken: string; status: string; opporToken: string }
  >({
    mutationFn: updateActivityChangePriorityState,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkOpportunities.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
    onSettled: async (_res, _err, vars) => {
      if (vars?.opporToken) {
        await qc.invalidateQueries({
          queryKey: qkOpportunities.detailById(vars.opporToken),
        });
        await qc.refetchQueries({
          queryKey: qkOpportunities.detailById(vars.opporToken),
          type: "active",
        });
      }
      await qc.invalidateQueries({ queryKey: qkOpportunities.all });
    },
  });

  return {
    createACMut,
    delelteACMut,
    ActivitystateChangeMut,
    ActivitystateChangePriorityMut,
  };
}
