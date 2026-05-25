import type { OptionItem, PagedSelect } from "@/application";
import type {
  ModulesStatusDto,
  ModulesUpsertDto,
} from "@/application/dtos/configurations/Modules/Modules.dto";
import type { ModulesResponseDto } from "@/application/dtos/configurations/Modules/ModulesResponse.dto";
import {
  createModules,
  fetchModulesById,
  fetchModulesList,
  fetchModulesSelect,
  updateModules,
  updateModulesStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import type { GlobalResponse } from "@/sharedKernel/globalResponse";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkModules = {

  all: ["modules"] as const,


  lists: () => [...qkModules.all, "list"] as const,
  list: (parentModulesId: number | null, search?: string, usersId?: number) =>
    [
      ...qkModules.lists(),
      parentModulesId ?? "root",
      search ?? "",
      usersId ?? "none",
    ] as const,


  selects: () => [...qkModules.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkModules.selects(), page, search ?? "", pageSize] as const,


  byId: (id: number) => [...qkModules.all, "by-id", id] as const,
};

export function useModulesList(
  parentModulesId: number | null,
  search?: string,
  usersId?: number
) {
  const enabled = parentModulesId != null;

  return useQuery<ModulesResponseDto[]>({
    queryKey: qkModules.list(parentModulesId, search, usersId),
    queryFn: () => fetchModulesList(parentModulesId!, search, usersId),
    enabled,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useModulesOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkModules.select(page, s, pageSize),
    queryFn: () => fetchModulesSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useModulesById(id?: number | null) {
  return useQuery<ModulesResponseDto>({
    queryKey: id != null ? qkModules.byId(id) : qkModules.byId(-1),
    queryFn: () => fetchModulesById(id as number),
    enabled: id != null,
  });
}

export function useModulesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ModulesUpsertDto, "modulesId">
  >({
    mutationFn: createModules,
    onMutate: () => showLoading("Creando módulo..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkModules.lists(),
          exact: false,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el módulo."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando módulo.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, ModulesUpsertDto>({
    mutationFn: updateModules,
    onMutate: () => showLoading("Actualizando módulo..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkModules.lists(), exact: false }),
          vars.modulesId
            ? qc.invalidateQueries({ queryKey: qkModules.byId(vars.modulesId) })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el módulo."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando módulo.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, ModulesStatusDto>({
    mutationFn: updateModulesStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkModules.lists(),
            exact: false,
            refetchType: "active",
          }),
          vars.modulesId
            ? qc.invalidateQueries({
                queryKey: qkModules.byId(vars.modulesId),
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
