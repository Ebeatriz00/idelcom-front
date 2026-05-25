import type {
  ProcessTypeResponseDto,
  ProcessTypeUpsertDto,
} from "@/application";
import { createProcessType, updateProcessType } from "@/infrastructure";
import {
  closeAlert,
  qkProcessType,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchProcessTypeListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: ProcessTypeResponseDto) => boolean,
  updater: (it: ProcessTypeResponseDto) => ProcessTypeResponseDto
) {
  const caches = qc.getQueriesData<{ items: ProcessTypeResponseDto[] }>({
    queryKey: qkProcessType.lists(),
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

export const useProcessTypeMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ProcessTypeUpsertDto, "ProcessTypeId">
  >({
    mutationFn: createProcessType,
    onMutate: () => showLoading("Registrando tipos de proceso..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkProcessType.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, ProcessTypeUpsertDto>(
    {
      mutationFn: updateProcessType,
      onMutate: () => showLoading("Actualizando tipos de proceso..."),
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          if (vars.processTypeId) {
            patchProcessTypeListsAfterUpdate(
              qc,
              (it) => it.processTypeId === vars.processTypeId,
              (it) => ({
                ...it,
                descType: vars.descType,
              })
            );

            await qc.invalidateQueries({
              queryKey: qkProcessType.byId(vars.processTypeId),
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
    }
  );

  return { createMut, updateMut };
};
