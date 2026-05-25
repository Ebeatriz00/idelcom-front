import type { ProfilesPermissionsResponseDto, ProfilesPermissionsUpsertDto } from "@/application";
import { createProfilesPermissions, updateProfilesPermissions } from "@/infrastructure/api-clients/configurations/profilesPermissions/profilesPermissions.client";
import { closeAlert, showApiError, showLoading, showSuccess, type GlobalResponse } from "@/sharedKernel";
import { qkProfilesPermissions } from "@/sharedKernel/hooks/profilesPermissions/useProfilesPermissions";
import { useMutation, useQueryClient } from "@tanstack/react-query";



function patchProfilesPermissionsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: ProfilesPermissionsResponseDto) => boolean,
  updater: (it: ProfilesPermissionsResponseDto) => ProfilesPermissionsResponseDto
) {
  const caches = qc.getQueriesData<{ items: ProfilesPermissionsResponseDto[] }>({
    queryKey: qkProfilesPermissions.lists(),
    exact: false,
  });
  for (const [key, data] of caches) {
    if (!data?.items) continue;
    const next = {
      ...data,
      items: data.items.map((it) => (predicate(it) ? updater(it) : it)),
    };
    qc.setQueryData(key, next);
  }
}

export const useProfilesPermissionsMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
      GlobalResponse,
      unknown,
      Omit<ProfilesPermissionsUpsertDto, "profilesPermissionsId">
    >({
      mutationFn: createProfilesPermissions,
      onMutate: () => showLoading("Registrando nuevo permiso del perfil..."),
      onSuccess: async (res) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          await qc.invalidateQueries({
            queryKey: qkProfilesPermissions.lists(),
            exact: false,
            refetchType: "active",
          });
        } else {
          await showApiError(
            { response: { data: res } },
            "No se pudo registrar."
          );
        }
      },
      onError: async (e) => {
        closeAlert();
        await showApiError(e, "Error registrando.");
      },
    });
  
    const updateMut = useMutation<GlobalResponse, unknown, ProfilesPermissionsUpsertDto>({
      mutationFn: updateProfilesPermissions,
      onMutate: () => showLoading("Actualizando permiso del perfil..."),
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          if (vars.profilesPermissionsId) {
            patchProfilesPermissionsAfterUpdate(
              qc,
              it => it.profilesPermissionsId === vars.profilesPermissionsId,
              it => ({ ...it, profilesId: vars.profilesId, modulesPermissionsId: vars.modulesPermissionsId })
            );
          }
        } else {
          await showApiError(
            { response: { data: res } },
            "No se pudo actualizar."
          );
        }
      },
      onError: async (e) => {
        closeAlert();
        await showApiError(e, "Error actualizando.");
      },
    });
  
    return { createMut, updateMut };
};