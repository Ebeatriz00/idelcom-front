import type {
  ContactTypeResponseDto,
  ContactTypeStatusDto,
  ContactTypeUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  createContactType,
  fetchContactTypeById,
  fetchContactTypeList,
  fetchContactTypeSelect,
  updateContactType,
  updateContactTypeStatus,
} from "@/infrastructure";
import { useCrmContactsTypePerms } from "@/pages/crm/leads/contact-type/hooks/permissions/contact-type.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkContactType = {
  all: ["contact-type"] as const,
  lists: () => [...qkContactType.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkContactType.lists(), pageIndex, pageSize, search ?? "",usersKey] as const,

  selects: () => [...qkContactType.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkContactType.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkContactType.all, "by-id", id] as const,
};

export function useContactTypeList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim()
 
 
  const{canViewAllContactsType, isLoadingPerms} = useCrmContactsTypePerms();
    const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllContactsType
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllContactsType ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllContactsType || !!userId);  ;




  return useQuery<Paginated<ContactTypeResponseDto>>({
    queryKey: qkContactType.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchContactTypeList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });

}

export function useContactTypeOptions(
  page: number,
  search: string,
  pageSize: number,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkContactType.select(page, s, pageSize),
    queryFn: () => fetchContactTypeSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useContactTypeById(id?: number | null) {
  return useQuery<ContactTypeResponseDto>({
    queryKey: id != null ? qkContactType.byId(id) : qkContactType.byId(-1),
    queryFn: () => fetchContactTypeById(id as number),
    enabled: id != null,
  });
}

export function useContactTypeMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ContactTypeUpsertDto, "contactTypeId">
  >({
    mutationFn: createContactType,
    onMutate: () => showLoading("Creando tipo de contacto..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkContactType.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la tipo de contacto."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando tipo de contacto.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, ContactTypeUpsertDto>({
    mutationFn: updateContactType,
    onMutate: () => showLoading("Actualizando tipo de contacto..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkContactType.lists() }),
          vars.contactTypeId
            ? qc.invalidateQueries({
                queryKey: qkContactType.byId(vars.contactTypeId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la tipo de contacto."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando tipo de contacto.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, ContactTypeStatusDto>({
    mutationFn: updateContactTypeStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkContactType.lists(),
            refetchType: "active",
          }),
          vars.contactTypeId
            ? qc.invalidateQueries({
                queryKey: qkContactType.byId(vars.contactTypeId),
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
  });

  return { createMut, updateMut, statusMut };
}
