import type {
  Paginated,
  SeriesUpsertDto,
  SeriesResponseDto,
  SeriesStatusDto,
  PagedSelect,
  OptionItem,
} from "@/application";
import {
  createSeries,
  fetchSeriesById,
  fetchSeriesList,
  fetchSeriesSelect,
  updateSeries,
  updateSeriesStatus,
} from "@/infrastructure"; 
import { useAccSeriesPerms } from "@/pages/accounting/series/hooks/series.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkSeries = {
  all: ["series"] as const,
  lists: () => [...qkSeries.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkSeries.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkSeries.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkSeries.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkSeries.all, "by-id", id] as const,
};

export function useSeriesList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllSeries, isLoadingPerms} = useAccSeriesPerms();
    const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllSeries
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllSeries ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllSeries || !!userId);   

  return useQuery<Paginated<SeriesResponseDto>>({
    queryKey: qkSeries.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchSeriesList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000, 
    enabled,
  });
}

export function useSeriesOptions(
  page: number,
  search: string,
  pageSize: number,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkSeries.select(page, s, pageSize),
    queryFn: () => fetchSeriesSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useSeriesById(id?: number | null) {
  return useQuery<SeriesResponseDto>({
    queryKey: id != null ? qkSeries.byId(id) : qkSeries.byId(-1),
    queryFn: () => fetchSeriesById(id as number),
    enabled: id != null,
  });
}

export function useSeriesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<SeriesUpsertDto, "seriesId">
  >({
    mutationFn: createSeries,
    onMutate: () => showLoading("Creando serie..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkSeries.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la serie."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando serie.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, SeriesUpsertDto>({
    mutationFn: updateSeries,
    onMutate: () => showLoading("Actualizando serie..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkSeries.lists() }),
          vars.seriesId
            ? qc.invalidateQueries({ queryKey: qkSeries.byId(vars.seriesId) })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la serie."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando serie.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, SeriesStatusDto>({
    mutationFn: updateSeriesStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkSeries.lists(),
            refetchType: "active",
          }),
          vars.seriesId
            ? qc.invalidateQueries({
                queryKey: qkSeries.byId(vars.seriesId),
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