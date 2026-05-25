import type { PreSaleProyectsUpsertDto } from "@/application/dtos/presale/PreSaleProyects.dto"; 
import { createPreSaleProyects } from "@/infrastructure/api-clients/presale/preSaleProyects.client";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { qkPreSaleProyects } from "@/sharedKernel/hooks/presale/usePreSaleProyects"; 
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const usePreSaleProyectsMutations = () => { 
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<PreSaleProyectsUpsertDto, "linkToken"> 
  >({
    mutationFn: createPreSaleProyects, 
    onMutate: () => showLoading("Registrando nuevo proyecto..."), 
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkPreSaleProyects.all, 
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar el proyecto."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando el proyecto.");
    },
  });

  return { createMut };
};