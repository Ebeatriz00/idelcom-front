import type {
  ModulesPermissionsResponseDto,
  ModulesPermissionsUpsertDto,
} from "@/application";
import {
  createModulesPermissions,
  updateModulesPermissions,
} from "@/infrastructure";
import {
  closeAlert,
  qkModulesPermissions,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchModulesPermissionsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: ModulesPermissionsResponseDto) => boolean,
  updater: (it: ModulesPermissionsResponseDto) => ModulesPermissionsResponseDto
) {
  const caches = qc.getQueriesData<{ items: ModulesPermissionsResponseDto[] }>({
    queryKey: qkModulesPermissions.lists(),
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

export const useModulesPermissionsMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ModulesPermissionsUpsertDto, "modulesPermissionsId">
  >({
    mutationFn: createModulesPermissions,
    onMutate: () => showLoading("Registrando nuevo permiso del módulo..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkModulesPermissions.lists(),
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

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    ModulesPermissionsUpsertDto
  >({
    mutationFn: updateModulesPermissions,
    onMutate: () => showLoading("Actualizando permiso del módulo..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.modulesId) {
          patchModulesPermissionsAfterUpdate(
            qc,
            (it) => it.modulesPermissionsId === vars.modulesPermissionsId,
            (it) => ({
              ...it,
              modulesId: vars.modulesId,
              permissionsId: vars.permissionsId,
            })
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
