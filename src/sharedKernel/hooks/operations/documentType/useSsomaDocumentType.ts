import type {
  SsomaDocumentTypeByIdDto,
  SsomaDocumentTypeResponseDto,
  SsomaDocumentTypeStatusDto,
  SsomaDocumentTypeUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  fetchSsomaDocumentTypesList,
  fetchSsomaDocumentTypeSelect,
  fetchSsomaDocumentTypeById,
  fetchCreateSsomaDocumentType,
  fetchUpdateSsomaDocumentType,
  fetchUpdateSsomaDocumentTypeStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkSsomaDocumentType } from "./keys/qkSsomaDocumentType";

export function useSsomaDocumentTypeList(
  pageIndex: number,
  pageSize: number,
  search?: string,
) {
  const s = (search ?? "").trim();
  return useQuery<Paginated<SsomaDocumentTypeResponseDto>>({
    queryKey: qkSsomaDocumentType.list(pageIndex, pageSize, s),
    queryFn: () => fetchSsomaDocumentTypesList(s, pageIndex + 1, pageSize),
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useSsomaDocumentTypeOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkSsomaDocumentType.select(page, s, pageSize),
    queryFn: () => fetchSsomaDocumentTypeSelect(page, s, pageSize),
    placeholderData: undefined,
    enabled: opts?.enabled ?? true,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useSsomaDocumentTypeById(id?: number | null) {
  return useQuery<SsomaDocumentTypeByIdDto>({
    queryKey:
      id != null ? qkSsomaDocumentType.byId(id ?? -1) : qkSsomaDocumentType.byId(-1),
    queryFn: () => fetchSsomaDocumentTypeById(id as number),
    placeholderData: undefined,
    enabled: id != null,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useSsomaDocumentTypeMutations() {
  const queryClient = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<SsomaDocumentTypeUpsertDto, "ssomaDocumentTypeId">
  >({
    mutationFn: fetchCreateSsomaDocumentType,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await queryClient.invalidateQueries({
          queryKey: qkSsomaDocumentType.all,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el tipo de documento SSOMA.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando tipo de documento SSOMA.");
    },
  });

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    SsomaDocumentTypeUpsertDto
  >({
    mutationFn: fetchUpdateSsomaDocumentType,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: qkSsomaDocumentType.all }),
          queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el tipo de documento SSOMA.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando tipo de documento SSOMA.");
    },
  });

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    SsomaDocumentTypeStatusDto
  >({
    mutationFn: fetchUpdateSsomaDocumentTypeStatus,
    retry: false,
    onMutate: (vars) =>
      showLoading(
        vars.status === "1"
          ? "Activando tipo de documento SSOMA..."
          : "Desactivando tipo de documento SSOMA...",
      ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await queryClient.invalidateQueries({
          queryKey: qkSsomaDocumentType.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
  });

  return { createMut, updateMut, statusMut };
}
