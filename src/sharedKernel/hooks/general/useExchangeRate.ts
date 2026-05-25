import type {
  Paginated,
  ExchangeRateUpsertDto,
  ExchangeRateResponseDto,
  ExchangeRateStatusDto,
  PagedSelect,
  OptionItem,
} from "@/application";
import {
  createExchangeRate,
  fetchExchangeRateById,
  fetchExchangeRateList,
  fetchExchangeRateSelect,
  updateExchangeRate,
  updateExchangeRateStatus,
} from "@/infrastructure";
import { useGeneralExChangeRatePerms } from "@/pages/general/ExchangeRate/hooks/exChangeRate.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkExchangeRate = {
  all: ["exchangeRate"] as const,
  lists: () => [...qkExchangeRate.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, date?: string | null, usersKey?: string | null) =>
    [...qkExchangeRate.lists(), pageIndex, pageSize, search ?? "", { date }, usersKey] as const,

  selects: () => [...qkExchangeRate.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkExchangeRate.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkExchangeRate.all, "by-id", id] as const,
};

export function useExchangeRateList(
  pageIndex: number,
  pageSize: number,
  search?: string,
  date?: string | null
) {
  const s = (search ?? "").trim();

  const {canViewAllExChangeRate, isLoadingPerms} = useGeneralExChangeRatePerms();
  const userIdStr = useAuth((s) => s.userId);  
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersBy: number | undefined = canViewAllExChangeRate
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewAllExChangeRate ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewAllExChangeRate || !!userId);  



  return useQuery<Paginated<ExchangeRateResponseDto>>({
    queryKey: qkExchangeRate.list(pageIndex, pageSize, s, date, usersKeyPart),
    queryFn: () => fetchExchangeRateList(pageIndex + 1, pageSize, s, date, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000, 
    enabled,
  });
}

export function useExchangeRateOptions(
  page: number,
  search: string,
  pageSize: number,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkExchangeRate.select(page, s, pageSize),
    queryFn: () => fetchExchangeRateSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useExchangeRateById(id?: number | null) {
  return useQuery<ExchangeRateResponseDto>({
    queryKey: id != null ? qkExchangeRate.byId(id) : qkExchangeRate.byId(-1),
    queryFn: () => fetchExchangeRateById(id as number),
    enabled: id != null,
  });
}

export function useExchangeRateMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ExchangeRateUpsertDto, "exchangeRateId">
  >({
    mutationFn: createExchangeRate,
    onMutate: () => showLoading("Creando tipo de cambio..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkExchangeRate.lists() });
      } else {
        await showApiError({ response: { data: res } }, "No se pudo crear el tipo de cambio.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando tipo de cambio.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, ExchangeRateUpsertDto>({
    mutationFn: updateExchangeRate,
    onMutate: () => showLoading("Actualizando tipo de cambio..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkExchangeRate.lists() }),
          vars.exchangeRateId
            ? qc.invalidateQueries({ queryKey: qkExchangeRate.byId(vars.exchangeRateId) })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo actualizar el tipo de cambio.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando tipo de cambio.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, ExchangeRateStatusDto>({
    mutationFn: updateExchangeRateStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkExchangeRate.lists(),
            refetchType: "active",
          }),
          vars.exchangeRateId
            ? qc.invalidateQueries({
                queryKey: qkExchangeRate.byId(vars.exchangeRateId),
                refetchType: "active",
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo cambiar el estado.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error cambiando estado.");
    },
  });

  return { createMut, updateMut, statusMut };
}