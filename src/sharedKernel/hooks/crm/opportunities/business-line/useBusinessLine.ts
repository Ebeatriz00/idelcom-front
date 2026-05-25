import type {
  BusinessLineResponseDto,
  BusinessLineStatusDto,
  BusinessLineUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  createBusinessLine,
  fetchBusinessLineById,
  fetchBusinessLineList,
  fetchBusinessLineSelect,
  updateBusinessLine,
  updateBusinessLineStatus,
} from "@/infrastructure";
import { useCrmBLinesPerms } from "@/pages/crm/opportunities/lines/hooks/bLines.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkBusinessLine = {
  all: ["business-line"] as const,
  lists: () => [...qkBusinessLine.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkBusinessLine.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkBusinessLine.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkBusinessLine.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkBusinessLine.all, "by-id", id] as const,
};

export function useBusinessLineList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllBLines, isLoadingPerms} = useCrmBLinesPerms();
  const userIdStr = useAuth((s) => s.userId);  
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersBy: number | undefined = canViewAllBLines
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewAllBLines ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewAllBLines || !!userId);  


  return useQuery<Paginated<BusinessLineResponseDto>>({
    queryKey: qkBusinessLine.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchBusinessLineList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useBusinessLineOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 100,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkBusinessLine.select(page, s, pageSize),
    queryFn: () => fetchBusinessLineSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useBusinessLineById(id?: number | null) {
  return useQuery<BusinessLineResponseDto>({
    queryKey: id != null ? qkBusinessLine.byId(id) : qkBusinessLine.byId(-1),
    queryFn: () => fetchBusinessLineById(id as number),
    enabled: id != null,
  });
}

export function useBusinessLineMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<BusinessLineUpsertDto, "businessLineId">
  >({
    mutationFn: createBusinessLine,
    onMutate: () => showLoading("Creando lineas de negocio..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkBusinessLine.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la lineas de negocio."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando lineas de negocio.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, BusinessLineUpsertDto>(
    {
      mutationFn: updateBusinessLine,
      onMutate: () => showLoading("Actualizando lineas de negocio..."),
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          await Promise.all([
            qc.invalidateQueries({ queryKey: qkBusinessLine.lists() }),
            vars.businessLineId
              ? qc.invalidateQueries({
                  queryKey: qkBusinessLine.byId(vars.businessLineId),
                })
              : Promise.resolve(),
          ]);
        } else {
          await showApiError(
            { response: { data: res } },
            "No se pudo actualizar la lineas de negocio."
          );
        }
      },
      onError: async (e) => {
        closeAlert();
        await showApiError(e, "Error actualizando lineas de negocio.");
      },
    }
  );

  const statusMut = useMutation<GlobalResponse, unknown, BusinessLineStatusDto>(
    {
      mutationFn: updateBusinessLineStatus,
      onMutate: () => showLoading("Actualizando estado..."),
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          await Promise.all([
            qc.invalidateQueries({
              queryKey: qkBusinessLine.lists(),
              refetchType: "active",
            }),
            vars.businessLineId
              ? qc.invalidateQueries({
                  queryKey: qkBusinessLine.byId(vars.businessLineId),
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
    }
  );

  return { createMut, updateMut, statusMut };
}
