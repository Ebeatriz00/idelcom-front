import type {
  HomologationPersonnelRequestDto,
  OptionItem,
  PagedSelect,
  PersonnelOperationsItem,
  SsomaHomologationPersonnelDocumentReplaceDto,
  SsomaHomologationPersonnelDocumentReplaceRequestDto,
} from "@/application";
import {
  fetchByPersonnelHomologationList,
  fetchDetailPersonnelOperations,
  fetchPersonnelHomologationCreate,
  fetchPersonnelHomologationList,
  fetchReplaceSsomaHomologationPersonnelDocument,
  fetchSelectOperationsForHomologation,
} from "@/infrastructure";
import { closeAlert, showApiError, showSuccess } from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkPersonnelHomologation } from "./personnelHomologation.qk";

export function usePersonnelHomologationList(
  page: number,
  pageSize: number,
  search: string = "",
) {
  return useQuery({
    queryKey: qkPersonnelHomologation.list(page, pageSize, search),
    queryFn: () => fetchPersonnelHomologationList(page + 1, pageSize, search),
    retry: false,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useDetailPersonnelHomologation(personnelOperationsId?: number) {
  return useQuery<PersonnelOperationsItem>({
    queryKey: qkPersonnelHomologation.detailById(personnelOperationsId ?? 0),
    queryFn: () =>
      fetchDetailPersonnelOperations(personnelOperationsId as number),
    enabled:
      personnelOperationsId !== null && personnelOperationsId !== undefined,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
}

export function useByPersonnelHomologationList(
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
  operationsId?: number,
  workerId?: number,
  opts?: { enabled?: boolean },
) {
  const enabled = opts?.enabled ?? true;

  return useQuery({
    queryKey: qkPersonnelHomologation.listByWorker(
      operationsId,
      workerId ?? 0,
      page,
      pageSize,
      search,
    ),
    queryFn: () =>
      fetchByPersonnelHomologationList(
        operationsId,
        workerId ?? 0,
        page,
        pageSize,
        search,
      ),
    retry: false,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    enabled,
  });
}

export function useRequirementOptions(
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkPersonnelHomologation.SelectOperationForHomologation(
      page,
      pageSize,
      s,
    ),
    queryFn: () => fetchSelectOperationsForHomologation(page, pageSize, s),
    placeholderData: undefined,
    enabled: opts?.enabled ?? true,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreatePersonnelHomologation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: HomologationPersonnelRequestDto) => {
      return fetchPersonnelHomologationCreate(dto);
    },
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkPersonnelHomologation.all,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la homologación.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando la homologación.");
    },
  });
}

export function useReplaceSsomaHomologationPersonnelDocument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      dto:
        | SsomaHomologationPersonnelDocumentReplaceDto
        | SsomaHomologationPersonnelDocumentReplaceRequestDto,
    ) => fetchReplaceSsomaHomologationPersonnelDocument(dto),
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Exito", res.message);
        await qc.invalidateQueries({
          queryKey: qkPersonnelHomologation.all,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo reemplazar el documento.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error reemplazando el documento.");
    },
  });
}
