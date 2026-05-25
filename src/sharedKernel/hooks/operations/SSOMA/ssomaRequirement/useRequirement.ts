import type {
  OptionItem,
  PagedSelect,
  PersonnelOperationsByWorkerItemDto,
} from "@/application";
import type { RequirementUpsertDto } from "@/application/dtos/operations/requirement/requeriment.dto";
import {
  fetchCreateRequirement,
  fetchDeleteRequirement,
  fetchUpdateRequirement,
  fetchRequirementById,
  fetchRequirementList,
  fetchRequirementSelect,
  fetchRequirementSpecifications,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkRequirement } from "./requirement.qk";

export function useRequirementList(
  spodeId: number,
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
) {
  return useQuery({
    queryKey: qkRequirement.list(spodeId,page, pageSize, search),
    queryFn: () => fetchRequirementList(spodeId, page, pageSize, search),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useRequirementListItem(
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
  scopeId: number = 0,
) {
  return useQuery({
    queryKey: qkRequirement.listItem(page, pageSize, search),
    queryFn: () => fetchRequirementList(scopeId, page, pageSize, search),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useRequirementOptions(
  scopedId: number,
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkRequirement.select(scopedId, page, pageSize, s),
    queryFn: () => fetchRequirementSelect(scopedId, page, pageSize, s),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useRequirementSpecifications(
  requirementId?: number,
  opts?: { enabled?: boolean },
) {
  return useQuery<PersonnelOperationsByWorkerItemDto>({
    queryKey: qkRequirement.specifications(requirementId ?? 0),
    queryFn: () => fetchRequirementSpecifications(requirementId ?? 0),
    enabled: opts?.enabled ?? !!requirementId,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
    retry: false,
  });
}

export function useRequirementById(id?: number) {
  return useQuery({
    queryKey: qkRequirement.byId(id ?? 0),
    queryFn: () => fetchRequirementById(id ?? 0),
    enabled: !!id,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
    retry: false,
  });
}

export function useRequirementMutations() {
  const queryClient = useQueryClient();
  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<RequirementUpsertDto, "requirementId">
  >({
    mutationFn: fetchCreateRequirement,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await queryClient.invalidateQueries({
          queryKey: qkRequirement.lists(),
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el requisito.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando el requisito.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, RequirementUpsertDto>({
    mutationFn: fetchUpdateRequirement,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: qkRequirement.lists() }),
          vars.requirementId
            ? queryClient.invalidateQueries({
                queryKey: qkRequirement.byId(vars.requirementId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el requisito.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando el requisito.");
    },
  });

  const deleteMut = useMutation<GlobalResponse, unknown, number>({
    mutationFn: fetchDeleteRequirement,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await queryClient.invalidateQueries({
          queryKey: qkRequirement.lists(),
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo eliminar el requisito.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error eliminando el requisito.");
    },
  });

  return { createMut, updateMut, deleteMut };
}
