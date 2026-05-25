import type {
  Paginated,
  ParentModulesResponseDto,
  ParentModulesStatusDto,
  ParentModulesUpsertDto,
} from "@/application";
import {
  createParentModules,
  fetchParentModulesById,
  fetchParentModulesList,
  updateParentModules,
  updateParentModulesStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkParentModules = {
  all: ["parent-modules"] as const,

  lists: () => [...qkParentModules.all, "list"] as const,
  list: (search: string, pageIndex: number, pageSize: number) =>
    [...qkParentModules.lists(), pageIndex, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkParentModules.all, "by-id", id] as const,
};

export function useParentModulesList(
  search: string,
  pageIndex: number,
  pageSize: number
) {
  const s = (search ?? "").trim();
  return useQuery<Paginated<ParentModulesResponseDto>>({
    queryKey: qkParentModules.list(s, pageIndex, pageSize),
    queryFn: () => fetchParentModulesList(s, pageIndex + 1, pageSize),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useParentModulesById(id?: number | null) {
  return useQuery<ParentModulesResponseDto>({
    queryKey: id != null ? qkParentModules.byId(id) : qkParentModules.byId(-1),
    queryFn: () => fetchParentModulesById(id as number),
    enabled: id != null,
  });
}

export function useParentModulesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ParentModulesUpsertDto, "parentModulesId">
  >({
    mutationFn: createParentModules,
    onMutate: () => showLoading("Creando módulo padre..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkParentModules.lists(),
          exact: false,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el módulo padre."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando módulo padre.");
    },
  });

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    ParentModulesUpsertDto
  >({
    mutationFn: updateParentModules,
    onMutate: () => showLoading("Actualizando módulo padre..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkParentModules.lists(),
            exact: false,
          }),
          vars.parentModulesId
            ? qc.invalidateQueries({
                queryKey: qkParentModules.byId(vars.parentModulesId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el módulo padre."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando módulo padre.");
    },
  });

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    ParentModulesStatusDto
  >({
    mutationFn: updateParentModulesStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkParentModules.lists(),
            exact: false,
            refetchType: "active",
          }),
          vars.parentModulesId
            ? qc.invalidateQueries({
                queryKey: qkParentModules.byId(vars.parentModulesId),
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
