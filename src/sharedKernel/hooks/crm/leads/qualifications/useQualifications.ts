import type {
  OptionItem,
  PagedSelect,
  Paginated,
  QualificationsResponseDto,
  QualificationsStatusDto,
  QualificationsUpsertDto,
} from "@/application";
import {
  createQualifications,
  fetchQualificationsById,
  fetchQualificationsList,
  fetchQualificationsSelect,
  updateQualifications,
  updateQualificationsStatus,
} from "@/infrastructure";
import { useCrmQualificationPerms } from "@/pages/crm/leads/qualifications/hooks/permissions/qual.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkQualifications = {
  all: ["payment-type"] as const,
  lists: () => [...qkQualifications.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkQualifications.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkQualifications.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkQualifications.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkQualifications.all, "by-id", id] as const,
};

export function useQualificationsList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllQualification, isLoadingPerms} = useCrmQualificationPerms();
    const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllQualification
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllQualification ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllQualification || !!userId);  


  return useQuery<Paginated<QualificationsResponseDto>>({
    queryKey: qkQualifications.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchQualificationsList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useQualificationsOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkQualifications.select(page, s, pageSize),
    queryFn: () => fetchQualificationsSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useQualificationsById(id?: number | null) {
  return useQuery<QualificationsResponseDto>({
    queryKey:
      id != null ? qkQualifications.byId(id) : qkQualifications.byId(-1),
    queryFn: () => fetchQualificationsById(id as number),
    enabled: id != null,
  });
}

export function useQualificationsMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<QualificationsUpsertDto, "QualificationsId">
  >({
    mutationFn: createQualifications,
    onMutate: () => showLoading("Creando leads de calificación..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkQualifications.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la leads de calificación."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando leads de calificación.");
    },
  });

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    QualificationsUpsertDto
  >({
    mutationFn: updateQualifications,
    onMutate: () => showLoading("Actualizando leads de calificación..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkQualifications.lists() }),
          vars.leadsQualificationsId
            ? qc.invalidateQueries({
                queryKey: qkQualifications.byId(vars.leadsQualificationsId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la leads de calificación."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando leads de calificación.");
    },
  });

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    QualificationsStatusDto
  >({
    mutationFn: updateQualificationsStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkQualifications.lists(),
            refetchType: "active",
          }),
          vars.leadsQualificationsId
            ? qc.invalidateQueries({
                queryKey: qkQualifications.byId(vars.leadsQualificationsId),
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
