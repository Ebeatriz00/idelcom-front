import type {
  BankResponseDto, 
  BankUpsertDto,  
} from "@/application";
import { 
  createBank, 
  updateBank, 
} from "@/infrastructure";
import {
  closeAlert,
  qkBank, 
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";


function patchBankListsAfterUpdate( 
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: BankResponseDto) => boolean, 
  updater: (it: BankResponseDto) => BankResponseDto 
) {
  const caches = qc.getQueriesData<{ items: BankResponseDto[] }>({
    queryKey: qkBank.lists(), 
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


export const useBankMutations = () => { 
  const qc = useQueryClient();


  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<BankUpsertDto, "bankId"> 
  >({
    mutationFn: createBank, 
    onMutate: () => showLoading("Registrando nuevo banco..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkBank.all, 
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


  const updateMut = useMutation<GlobalResponse, unknown, BankUpsertDto>({ 
    mutationFn: updateBank, 
    onMutate: () => showLoading("Actualizando banco..."), 
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        

        if (vars.bankId) { 
          patchBankListsAfterUpdate( 
            qc,
            (it) => it.bankId === vars.bankId,
            (it) => ({
              ...it,
              description: vars.description,
              abrv: vars.abrv, 
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
}