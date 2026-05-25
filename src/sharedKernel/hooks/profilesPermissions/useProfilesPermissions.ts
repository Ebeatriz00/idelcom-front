import type {
  Paginated,
  ProfilesPermissionsStatusDto,
  ProfilesPermissionsUpsertDto,
} from "@/application";
import type {
  ProfilesPermissionsByIdDto,
  ProfilesPermissionsResponseDto,
} from "@/application/dtos/configurations/ProfilesPermissions/ProfilesPermissionsResponse.dto";
import {
  createProfilesPermissions,
  fetchProfilesPermissionsById,
  fetchProfilesPermissionsList,
  updateProfilesPermissions,
  updateProfilesPermissionsStatus,
} from "@/infrastructure/api-clients/configurations/profilesPermissions/profilesPermissions.client";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkProfilesPermissions = {
  all: ["profilesPermissions"] as const,

  lists: (profilesId?: number | null) =>
    [...qkProfilesPermissions.all, "list", profilesId ?? "none"] as const,

  list: (
    profilesId: number,
    pageIndex: number,
    pageSize: number,
    search?: string
  ) =>
    [
      ...qkProfilesPermissions.lists(profilesId),
      pageIndex,
      pageSize,
      search ?? "",
    ] as const,

  selects: (profilesId?: number | null) =>
    [...qkProfilesPermissions.all, "select", profilesId ?? "none"] as const,

  select: (
    profilesId: number | null,
    page: number,
    search: string,
    pageSize: number
  ) =>
    [
      ...qkProfilesPermissions.selects(profilesId),
      page,
      search ?? "",
      pageSize,
    ] as const,

  byId: (id: number) => [...qkProfilesPermissions.all, "by-id", id] as const,
};

export function useProfilesPermissionsList(
  profilesId: number | null,
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();
  return useQuery<Paginated<ProfilesPermissionsResponseDto>>({
    enabled: !!profilesId,
    queryKey: qkProfilesPermissions.list(profilesId ?? 0, pageIndex, pageSize,s),
    queryFn: () =>
      fetchProfilesPermissionsList(profilesId!, pageIndex + 1, pageSize, s),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}
export function useProfilesPermissionsById(id?: number | null) {
  return useQuery<ProfilesPermissionsByIdDto>({
    queryKey:
      id != null
        ? qkProfilesPermissions.byId(id)
        : qkProfilesPermissions.byId(-1),
    queryFn: () => fetchProfilesPermissionsById(id as number),
    enabled: id != null,
  });
}

export function useProfilesPermissionsMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ProfilesPermissionsUpsertDto, "ProfilesPermissionsId">
  >({
    mutationFn: createProfilesPermissions,
    onMutate: () => showLoading("Creando permisos del perfil..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkProfilesPermissions.lists(),
          exact: false,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el permiso del perfil."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando permisos del perfil.");
    },
  });

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    ProfilesPermissionsUpsertDto
  >({
    mutationFn: updateProfilesPermissions,
    onMutate: () => showLoading("Actualizando permisos del perfil..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkProfilesPermissions.lists(),
            exact: false,
          }),
          vars.profilesPermissionsId
            ? qc.invalidateQueries({
                queryKey: qkProfilesPermissions.byId(
                  vars.profilesPermissionsId
                ),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el permiso del perfil."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando permisos del perfil.");
    },
  });

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    ProfilesPermissionsStatusDto
  >({
    mutationFn: updateProfilesPermissionsStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkProfilesPermissions.lists(),
            exact: false,
            refetchType: "active",
          }),
          vars.profilesPermissionsId
            ? qc.invalidateQueries({
                queryKey: qkProfilesPermissions.byId(
                  vars.profilesPermissionsId
                ),
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
