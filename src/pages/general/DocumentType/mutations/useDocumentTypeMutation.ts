import type { DocumentTypeUpsertDto, DocumentTypeResponseDto } from "@/application";
import { createDocumentType, updateDocumentType } from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { qkdocumentType } from "@/sharedKernel/hooks/general/useDocumentType";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchDocTypeListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: DocumentTypeResponseDto) => boolean,
  updater: (it: DocumentTypeResponseDto) => DocumentTypeResponseDto
) {
  const caches = qc.getQueriesData<{ items: DocumentTypeResponseDto[] }>({
    queryKey: qkdocumentType.lists(),
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

export const useDocumentTypeMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<DocumentTypeUpsertDto, "documentTypeId">
  >({
    mutationFn: createDocumentType,
    onMutate: () => showLoading("Registrando nuevo tipo de documento..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkdocumentType.lists(),
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

  const updateMut = useMutation<GlobalResponse, unknown, DocumentTypeUpsertDto>(
    {
      mutationFn: updateDocumentType,
      onMutate: () => showLoading("Actualizando tipo de documento..."),
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          if (vars.documentTypeId) {
            patchDocTypeListsAfterUpdate(
              qc,
              (it) => it.documentTypeId === vars.documentTypeId,
              (it) => ({
                ...it,
                description: vars.description,
                codeSunat: vars.codeSunat ,
              })
            );
            await qc.invalidateQueries({ queryKey: qkdocumentType.byId(vars.documentTypeId) });
          }
        } else {
          await showApiError({ response: { data: res } }, "No se pudo actualizar.");
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