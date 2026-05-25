import type {
  Paginated,
  UomUpsertDto,
  UomResponseDto,
  UomStatusDto,
  PagedSelect,
  OptionItem,
} from "@/application";
import {
  createUom,
  fetchUomById,
  fetchUomList,
  fetchUomSelect,
  updateUom,
  updateUomStatus,
} from "@/infrastructure";
import { useGeneralUomPerms } from "@/pages/general/Uom/hooks/Uom.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkUom = {
  all: ["uom"] as const,
  lists: () => [...qkUom.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkUom.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkUom.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkUom.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkUom.all, "by-id", id] as const,
};

export function useUomList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const {canViewAllUom, isLoadingPerms} = useGeneralUomPerms();
  const userIdStr = useAuth((s) => s.userId);  
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersBy: number | undefined = canViewAllUom
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewAllUom ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewAllUom || !!userId);  



  return useQuery<Paginated<UomResponseDto>>({
    queryKey: qkUom.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchUomList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useUomOptions(
  page: number = 1 ,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkUom.select(page, s, pageSize),
    queryFn: () => fetchUomSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useUomById(id?: number | null) {
  return useQuery<UomResponseDto>({
    queryKey: id != null ? qkUom.byId(id) : qkUom.byId(-1),
    queryFn: () => fetchUomById(id as number),
    enabled: id != null,
  });
}

export function useUomMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<UomUpsertDto, "uomId"> 
  >({
    mutationFn: createUom,
    onMutate: () => showLoading("Creando unidad de medida..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkUom.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la unidad de medida."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando unidad de medida.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, UomUpsertDto>({
    mutationFn: updateUom,
    onMutate: () => showLoading("Actualizando unidad de medida..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkUom.lists() }),
          vars.uomId // Se usa 'uomId' para invalidar la caché individual
            ? qc.invalidateQueries({ queryKey: qkUom.byId(vars.uomId) })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la unidad de medida."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando unidad de medida.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, UomStatusDto>({
    mutationFn: updateUomStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkUom.lists(),
            refetchType: "active",
          }),
          vars.uomId 
            ? qc.invalidateQueries({
                queryKey: qkUom.byId(vars.uomId),
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