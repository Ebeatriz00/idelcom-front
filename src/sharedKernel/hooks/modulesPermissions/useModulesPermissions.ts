import type {
  ModulesPermissionsResponseByIdDto,
  ModulesPermissionsResponseDto,
  ModulesPermissionsStatusDto,
  ModulesPermissionsUpsertDto,
  Paginated,
} from "@/application";
import {
  createModulesPermissions,
  fetchModulesPermissionsById,
  fetchModulesPermissionsList,
  updateModulesPermissions,
  updateModulesPermissionsStatus,
} from "@/infrastructure/api-clients/configurations/modulesPermissions/modulesPermissions.client";
import {
  closeAlert,
  showLoading,
  showSuccess,
} from "@/sharedKernel/alerts/alerts";
import { showApiError } from "@/sharedKernel/alerts/showApiError";
import type { GlobalResponse } from "@/sharedKernel/globalResponse";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkModulesPermissions = {
  all: ["modulesPermissions"] as const,
  lists: () => [...qkModulesPermissions.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search?: string) =>
    [...qkModulesPermissions.lists(), pageIndex, pageSize, search] as const,

  selects: () => [...qkModulesPermissions.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkModulesPermissions.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkModulesPermissions.all, "by-id", id] as const,
};

export function useModulesPermissionsList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();
  return useQuery<Paginated<ModulesPermissionsResponseDto>>({
    queryKey: qkModulesPermissions.list(pageIndex, pageSize, s),
    queryFn: () => fetchModulesPermissionsList(pageIndex + 1, pageSize, s),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useModulesPermissionsById(id?: number | null) {
  return useQuery<ModulesPermissionsResponseByIdDto>({
    queryKey:
      id != null
        ? qkModulesPermissions.byId(id)
        : qkModulesPermissions.byId(-1),
    queryFn: () => fetchModulesPermissionsById(id as number),
    enabled: id != null,
  });
}

export function useModulesPermissionsMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ModulesPermissionsUpsertDto, "modulesPermissionsId">
  >({
    mutationFn: createModulesPermissions,
    onMutate: () => showLoading("Creando permiso..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkModulesPermissions.lists(),
          exact: false,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el permiso."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando permiso.");
    },
  });

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    ModulesPermissionsUpsertDto
  >({
    mutationFn: updateModulesPermissions,
    onMutate: () => showLoading("Actualizando permiso..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkModulesPermissions.lists(),
            exact: false,
          }),
          vars.modulesPermissionsId
            ? qc.invalidateQueries({
                queryKey: qkModulesPermissions.byId(vars.modulesPermissionsId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el permiso."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando permiso.");
    },
  });

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    ModulesPermissionsStatusDto
  >({
    mutationFn: updateModulesPermissionsStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkModulesPermissions.lists(),
            exact: false,
            refetchType: "active",
          }),
          vars.modulesPermissionsId
            ? qc.invalidateQueries({
                queryKey: qkModulesPermissions.byId(vars.modulesPermissionsId),
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
