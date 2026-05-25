import type { Paginated, AreaUpsertDto, PagedSelect, OptionItem } from "@/application";
import type { AreaResponseDto } from "@/application/dtos/rrhh/Area/AreaResponse.dto";
import type {AreaStatusDto } from "@/application/dtos/rrhh/Area/Area.dto";
import { closeAlert, showApiError, showLoading, showSuccess, type GlobalResponse } from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createArea, fetchAreaById, fetchAreaList, fetchAreaSelect, updateArea, updateAreaStatus } from "@/infrastructure/api-clients/rrhh/area/area.client";
import { useHrAreaPerms } from "@/pages/rrhh/Area/hooks/area.perms";
import { useAuth } from "@/stores/auth";

export const qkarea = {
  all: ["area"] as const,
  lists: () => [...qkarea.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkarea.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkarea.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkarea.selects(), page, search ?? "", pageSize] as const,
  byId: (id: number) => [...qkarea.all, "by-id", id] as const,
};


export function useAreaList(
  pageIndex: number, 
  pageSize: number, 
  search?: string
) {
  const s = (search ?? "").trim();

  const {canViewAllArea, isLoadingPerms} = useHrAreaPerms();
  const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllArea
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllArea ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllArea || !!userId);  



  return useQuery<Paginated<AreaResponseDto>>({
    queryKey: qkarea.list(pageIndex, pageSize, s,usersKeyPart),
    queryFn: () => fetchAreaList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useAreaOption(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkarea.select(page, s, pageSize),
    queryFn: () => fetchAreaSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000, // 30 segundos
  });
}


export function useAreaById(id?: number | null) {
  return useQuery<AreaResponseDto>({
    queryKey: id != null ? qkarea.byId(id) : qkarea.byId(-1),
    queryFn: () => fetchAreaById(id as number),
    enabled: id != null,
  });
}

export function useAreaMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<GlobalResponse, unknown, Omit<AreaUpsertDto, "profilesId">>({
    mutationFn: createArea,
    onMutate: () => showLoading("Creando área..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkarea.lists(), exact: false });
      } else {
        await showApiError({ response: { data: res } }, "No se pudo crear el área.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando área.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, AreaUpsertDto>({
    mutationFn: updateArea,
    onMutate: () => showLoading("Actualizando área..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkarea.lists(), exact: false }),
          vars.areaId ? qc.invalidateQueries({ queryKey: qkarea.byId(vars.areaId) }) : Promise.resolve(),
        ]);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo actualizar el área.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando área.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, AreaStatusDto>({
    mutationFn: updateAreaStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkarea.lists(), exact: false, refetchType: "active" }),
          vars.areaId
            ? qc.invalidateQueries({ queryKey: qkarea.byId(vars.areaId), refetchType: "active" })
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
