import type {
  ParentModulesResponseDto,
  ParentModulesUpsertDto,
} from "@/application";
import { createParentModules, updateParentModules } from "@/infrastructure";
import {
  closeAlert,
  qkParentModules,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchParentModulesAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: ParentModulesResponseDto) => boolean,
  updater: (it: ParentModulesResponseDto) => ParentModulesResponseDto
) {
  const caches = qc.getQueriesData<{ items: ParentModulesResponseDto[] }>({
    queryKey: qkParentModules.lists(),
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

export const useParentModulesMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ParentModulesUpsertDto, "parentModulesId">
  >({
    mutationFn: createParentModules,
    onMutate: () => showLoading("Registrando nuevo módulo padre..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkParentModules.lists(),
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
    ParentModulesUpsertDto
  >({
    mutationFn: updateParentModules,
    onMutate: () => showLoading("Actualizando módulo padre..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.parentModulesId) {
          patchParentModulesAfterUpdate(
            qc,
            (it) => it.parentModulesId === vars.parentModulesId,
            (it) => ({
              ...it,
              code: vars.code ?? "",
              title: vars.title ?? "",
              stickyBottom: vars.stickyBottom ?? true,
              orderNo: vars.orderNo,
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
