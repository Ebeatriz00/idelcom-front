import type {
  BusinessLineResponseDto,
  BusinessLineUpsertDto,
} from "@/application";
import { createBusinessLine, updateBusinessLine } from "@/infrastructure";
import {
  closeAlert,
  qkBusinessLine,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchBusinessLineListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: BusinessLineResponseDto) => boolean,
  updater: (it: BusinessLineResponseDto) => BusinessLineResponseDto
) {
  const caches = qc.getQueriesData<{ items: BusinessLineResponseDto[] }>({
    queryKey: qkBusinessLine.lists(),
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

export const useBusinessLineMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<BusinessLineUpsertDto, "businessLineId">
  >({
    mutationFn: createBusinessLine,
    onMutate: () => showLoading("Registrando lineas de negocio..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkBusinessLine.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, BusinessLineUpsertDto>(
    {
      mutationFn: updateBusinessLine,
      onMutate: () => showLoading("Actualizando lineas de negocio..."),
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          if (vars.businessLineId) {
            patchBusinessLineListsAfterUpdate(
              qc,
              (it) => it.businessLineId === vars.businessLineId,
              (it) => ({
                ...it,
                descLine: vars.descLine,
              })
            );

            await qc.invalidateQueries({
              queryKey: qkBusinessLine.byId(vars.businessLineId),
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
