import type { Paginated } from "@/application";
import type { SsomaOperationsRequirementCreateDto } from "@/application/dtos/operations/ssomaOperationsRequirement/ssomaOperationsRequirement.dto";
import type { SsomaOperationsRequirementItem } from "@/application/dtos/operations/ssomaOperationsRequirement/ssomaOperationsRequirementItem.dto";
import { createSsomaOperationsRequirement, deleteSsomaOperationsRequirement, fetchSsomaOperationsRequirementList } from "@/infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkSsomaOperationsRequirement = {
  all: ["ssoma-operations-requirements"] as const,
  lists: () => [...qkSsomaOperationsRequirement.all, "list"] as const,
  list: (operationsId: number, page: number, pageSize: number, search: string) =>
    [...qkSsomaOperationsRequirement.lists(), operationsId, page, pageSize, search] as const,
};

/**
 * Hook para obtener el listado de requerimientos asignados a una operación.
 */
export function useSsomaOperationsRequirementList(
  operationsId: number,
  page: number,
  pageSize: number,
  search: string = ""
) {
  const s = search.trim();
  return useQuery<Paginated<SsomaOperationsRequirementItem>>({
    queryKey: qkSsomaOperationsRequirement.list(operationsId, page, pageSize, s),
    queryFn: () => fetchSsomaOperationsRequirementList(operationsId, page, pageSize, s),
    placeholderData: undefined,
    enabled: operationsId > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

/**
 * Hook para las mutaciones de requerimientos por operación SSOMA.
 */
export function useSsomaOperationsRequirementMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<any, unknown, SsomaOperationsRequirementCreateDto>({
    mutationFn: createSsomaOperationsRequirement,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qkSsomaOperationsRequirement.lists(), exact: false });
    },
  });

  const deleteMut = useMutation<any, unknown, number>({ // Ahora recibe directamente el número ID
    mutationFn: (id: number) => deleteSsomaOperationsRequirement(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qkSsomaOperationsRequirement.lists(), exact: false });
    },
  });

  return { createMut, deleteMut };
}
