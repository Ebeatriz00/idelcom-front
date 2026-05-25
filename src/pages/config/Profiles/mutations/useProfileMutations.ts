import type { ProfileUpsertDto } from "@/application";
import type { ProfilesResposeDto } from "@/application/dtos/configurations/Profiles/PorfilesResponse.dto";
import { createProfile, updateProfile } from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { qk } from "@/sharedKernel/hooks/profiles/useProfilesList";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: ProfilesResposeDto) => boolean,
  updater: (it: ProfilesResposeDto) => ProfilesResposeDto
) {
  const caches = qc.getQueriesData<{ items: ProfilesResposeDto[] }>(
    { queryKey: qk.lists(), exact: false }
  );
  for (const [key, data] of caches) {
    if (!data?.items) continue;
    const next = {
      ...data,
      items: data.items.map((it) => (predicate(it) ? updater(it) : it)),
    };
    qc.setQueryData(key, next);
  }
}


export const useProfileMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ProfileUpsertDto, "profilesId">
  >({
    mutationFn: createProfile,
    onMutate: () => showLoading("Registrando nuevo perfil..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qk.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, ProfileUpsertDto>({
    mutationFn: updateProfile,
    onMutate: () => showLoading("Actualizando perfil..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.profilesId) {
          patchListsAfterUpdate(
            qc,
            it => it.profilesId === vars.profilesId,
            it => ({ ...it, name: vars.name, description: vars.description })
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
