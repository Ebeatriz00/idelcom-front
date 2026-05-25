import type {
  DocumentTypeResponseDto,
  DocumentTypeStatusDto,
  DocumentTypeUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  createDocumentType,
  fetchDocumentTypeById,
  fetchDocumentTypeSelect,
  fetchDocumentTypesList,
  updateDocumentType,
  updateDocumentTypeStatus,
} from "@/infrastructure";
import { useGeneralDocumentTypePerms } from "@/pages/general/DocumentType/hooks/documentType.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkdocumentType = {
  all: ["documentTypes"] as const,
  lists: () => [...qkdocumentType.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkdocumentType.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkdocumentType.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkdocumentType.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkdocumentType.all, "by-id", id] as const,
};

export function useDocumentTypeList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const {canViewAllDocumentType, isLoadingPerms} = useGeneralDocumentTypePerms();
  const userIdStr = useAuth((s) => s.userId);  
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersBy: number | undefined = canViewAllDocumentType
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewAllDocumentType ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewAllDocumentType || !!userId);  


  return useQuery<Paginated<DocumentTypeResponseDto>>({
    queryKey: qkdocumentType.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchDocumentTypesList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useDocumentTypeOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkdocumentType.select(page, s, pageSize),
    queryFn: () => fetchDocumentTypeSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useDocumentTypeById(id?: number | null) {
  return useQuery<DocumentTypeResponseDto>({
    queryKey: id != null ? qkdocumentType.byId(id) : qkdocumentType.byId(-1),
    queryFn: () => fetchDocumentTypeById(id as number),
    enabled: id != null,
  });
}

export function useDocumentTypeMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<DocumentTypeUpsertDto, "documentTypeId">
  >({
    mutationFn: createDocumentType,

    onMutate: () => showLoading("Creando tipo de documento..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkdocumentType.lists(),
          exact: false,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el tipo de documento."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando tipo de documento.");
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
          await Promise.all([
            qc.invalidateQueries({
              queryKey: qkdocumentType.lists(),
              exact: false,
            }),

            vars.documentTypeId
              ? qc.invalidateQueries({
                  queryKey: qkdocumentType.byId(vars.documentTypeId),
                })
              : Promise.resolve(),
          ]);
        } else {
          await showApiError(
            { response: { data: res } },
            "No se pudo actualizar el tipo de documento."
          );
        }
      },
      onError: async (e) => {
        closeAlert();
        await showApiError(e, "Error actualizando tipo de documento.");
      },
    }
  );

  const statusMut = useMutation<GlobalResponse, unknown, DocumentTypeStatusDto>(
    {
      mutationFn: updateDocumentTypeStatus,
      onMutate: () => showLoading("Actualizando estado..."),
      onSuccess: async (res, vars) => {
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message);
          await Promise.all([
            qc.invalidateQueries({
              queryKey: qkdocumentType.lists(),
              exact: false,
              refetchType: "active",
            }),
            vars.documentTypeId
              ? qc.invalidateQueries({
                  queryKey: qkdocumentType.byId(vars.documentTypeId),
                  refetchType: "active",
                })
              : Promise.resolve(),
          ]);
        } else {
          await showApiError(
            { response: { data: res } },
            "No se pudo cambiar el estado."
          );
        }
      },
      onError: async (e) => {
        closeAlert();
        await showApiError(e, "Error cambiando estado.");
      },
    }
  );

  return { createMut, updateMut, statusMut };
}
