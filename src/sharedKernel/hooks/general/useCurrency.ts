import type {
  CurrencyResponseDto,
  CurrencyStatusDto,
  CurrencyUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  createCurrency,
  fetchCurrencyById,
  fetchCurrencyList,
  fetchCurrencySelect,
  updateCurrency,
  updateCurrencyStatus,
} from "@/infrastructure";
import { useGeneralCurrencyPerms } from "@/pages/general/Currency/hooks/currency.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkCurrency = {
  all: ["currency"] as const,
  lists: () => [...qkCurrency.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkCurrency.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkCurrency.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkCurrency.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkCurrency.all, "by-id", id] as const,
};

export function useCurrencyList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const {canViewAllCurrency, isLoadingPerms} = useGeneralCurrencyPerms();
  const userIdStr = useAuth((s) => s.userId);  
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersBy: number | undefined = canViewAllCurrency
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewAllCurrency ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewAllCurrency || !!userId);  


  return useQuery<Paginated<CurrencyResponseDto>>({
    queryKey: qkCurrency.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchCurrencyList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useCurrencyOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkCurrency.select(page, s, pageSize),
    queryFn: () => fetchCurrencySelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useCurrencyById(id?: number | null) {
  return useQuery<CurrencyResponseDto>({
    queryKey: id != null ? qkCurrency.byId(id) : qkCurrency.byId(-1),
    queryFn: () => fetchCurrencyById(id as number),
    enabled: id != null,
  });
}

export function useCurrencyMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<CurrencyUpsertDto, "currencyId">
  >({
    mutationFn: createCurrency,
    onMutate: () => showLoading("Creando moneda..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkCurrency.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la moneda."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando moneda.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, CurrencyUpsertDto>({
    mutationFn: updateCurrency,
    onMutate: () => showLoading("Actualizando moneda..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkCurrency.lists() }),
          vars.currencyId
            ? qc.invalidateQueries({
                queryKey: qkCurrency.byId(vars.currencyId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la moneda."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando moneda.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, CurrencyStatusDto>({
    mutationFn: updateCurrencyStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkCurrency.lists(),
            refetchType: "active",
          }),
          vars.currencyId
            ? qc.invalidateQueries({
                queryKey: qkCurrency.byId(vars.currencyId),
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
