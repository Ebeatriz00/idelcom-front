import type { JobTitleResponseDto, JobTitleUpsertDto } from "@/application";
import { createJobTitle, updateJobTitle } from "@/infrastructure";

import {
  closeAlert,
  qkJobTitle,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchJobTitleListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: JobTitleResponseDto) => boolean,
  updater: (it: JobTitleResponseDto) => JobTitleResponseDto
) {
  const caches = qc.getQueriesData<{ items: JobTitleResponseDto[] }>({
    queryKey: qkJobTitle.lists(),
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

export const useJobTitleMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<JobTitleUpsertDto, "jobTitleId">
  >({
    mutationFn: createJobTitle,
    onMutate: () => showLoading("Registrando nuevo cargo..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkJobTitle.all,
          exact: false,
          type: "active",
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

  const updateMut = useMutation<GlobalResponse, unknown, JobTitleUpsertDto>({
    mutationFn: updateJobTitle,
    onMutate: () => showLoading("Actualizando cargo..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.jobTitleId) {
          patchJobTitleListsAfterUpdate(
            qc,
            (it) => it.jobTitleId === vars.jobTitleId,
            (it) => ({
              ...it,
              description: vars.description ?? it.description,
              areaId: vars.areaId ?? it.areaId,
            })
          );
          await qc.invalidateQueries({
            queryKey: qkJobTitle.byId(vars.jobTitleId),
          });
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
