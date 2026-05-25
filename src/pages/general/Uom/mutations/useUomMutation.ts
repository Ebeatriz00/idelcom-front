import type { UomUpsertDto, UomResponseDto } from "@/application";
import { createUom, updateUom } from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { qkUom } from "@/sharedKernel/hooks/general/useUom"; 
import { useMutation, useQueryClient } from "@tanstack/react-query";


function patchUomListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: UomResponseDto) => boolean,
  updater: (it: UomResponseDto) => UomResponseDto
) {
  const caches = qc.getQueriesData<{ items: UomResponseDto[] }>({
    queryKey: qkUom.lists(), 
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

export const useUomMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<UomUpsertDto, "uomId"> 
  >({
    mutationFn: createUom,
    onMutate: () => showLoading("Registrando nueva unidad de medida..."), 
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkUom.lists(), 
          exact: false,
          refetchType: "active",
        });
      } else {
        await showApiError({ response: { data: res } }, "No se pudo registrar.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, UomUpsertDto>({
    mutationFn: updateUom,
    onMutate: () => showLoading("Actualizando unidad de medida..."), 
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.uomId) {
        
          patchUomListsAfterUpdate(
            qc,
            (it) => it.uomId === vars.uomId, // Condición con uomId
            (it) => ({
              ...it,
              
              description: vars.description,
              codeSunat: vars.codeSunat,
              symbol: vars.symbol,
            })
          );
        
          await qc.invalidateQueries({
            queryKey: qkUom.byId(vars.uomId), // Invalida por ID de UOM
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