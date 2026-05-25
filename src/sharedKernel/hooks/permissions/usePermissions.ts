import type { OptionItem, PagedSelect, Paginated } from "@/application";
import type {
  PermissionsStatusDto,
  PermissionsUpsertDto,
} from "@/application/dtos/configurations/Permissions/Permissions.dto";
import type { PermissionsResponseDto } from "@/application/dtos/configurations/Permissions/PermissionsResponse.dto";
import {
  createPermissions,
  fetchPermissionsById,
  fetchPermissionsList,
  fetchPermissionsSelect,
  updatePermissions,
  updatePermissionsStatus,
} from "@/infrastructure/api-clients/configurations/permissions/permission.client";
import {
  closeAlert,
  showLoading,
  showSuccess,
} from "@/sharedKernel/alerts/alerts";
import { showApiError } from "@/sharedKernel/alerts/showApiError";
import type { GlobalResponse } from "@/sharedKernel/globalResponse";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkPermissions = {
  all: ["permissions"] as const,
  lists: () => [...qkPermissions.all, "list"] as const,
  list: (pageIndex: number, pageSize: number) =>
    [...qkPermissions.lists(), pageIndex, pageSize] as const,


  selects: () => [...qkPermissions.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkPermissions.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkPermissions.all, "by-id", id] as const,
};

export function usePermissionsList(pageIndex: number, pageSize: number) {
  return useQuery<Paginated<PermissionsResponseDto>>({
    queryKey: qkPermissions.list(pageIndex, pageSize),
    queryFn: () => fetchPermissionsList(pageIndex + 1, pageSize),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function usePermissionsOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkPermissions.select(page, s, pageSize),
    queryFn: () => fetchPermissionsSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function usePermissionsById(id?: number | null) {
  return useQuery<PermissionsResponseDto>({
    queryKey: id != null ? qkPermissions.byId(id) : qkPermissions.byId(-1),
    queryFn: () => fetchPermissionsById(id as number),
    enabled: id != null,
  });
}

export function usePermissionsMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<PermissionsUpsertDto, "permissionsId">
  >({
    mutationFn: createPermissions,
    onMutate: () => showLoading("Creando permiso..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkPermissions.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, PermissionsUpsertDto>({
    mutationFn: updatePermissions,
    onMutate: () => showLoading("Actualizando permiso..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkPermissions.lists(),
            exact: false,
          }),
          vars.permissionsId
            ? qc.invalidateQueries({
                queryKey: qkPermissions.byId(vars.permissionsId),
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

  const statusMut = useMutation<GlobalResponse, unknown, PermissionsStatusDto>({
    mutationFn: updatePermissionsStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkPermissions.lists(),
            exact: false,
            refetchType: "active",
          }),
          vars.permissionsId
            ? qc.invalidateQueries({
                queryKey: qkPermissions.byId(vars.permissionsId),
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
