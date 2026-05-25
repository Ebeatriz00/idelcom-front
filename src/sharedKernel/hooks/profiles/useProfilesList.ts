import type {
  OptionItem,
  PagedSelect,
  Paginated,
  ProfileUpsertDto,
} from "@/application";
import type { ProfilesResposeDto } from "@/application/dtos/configurations/Profiles/PorfilesResponse.dto";
import type { ProfileStatusDto } from "@/application/dtos/configurations/Profiles/Profiles.dto";
import {
  createProfile,
  fetchProfileById,
  fetchProfilesList,
  fetchProfilesSelect,
  updateProfile,
  updateProfileStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qk = {
  all: ["profiles"] as const,
  lists: () => [...qk.all, "list"] as const,
  list: (search: string, pageIndex: number, pageSize: number) =>
    [...qk.lists(), search ?? "", pageIndex, pageSize] as const,

  selects: () => [...qk.all, "select"] as const,
  select: (search: string, page: number, pageSize: number) =>
    [...qk.selects(), search ?? "", page, pageSize] as const,

  byId: (id: number) => [...qk.all, "by-id", id] as const,
};

export function useProfilesList(
  search: string,
  pageIndex: number,
  pageSize: number
) {
  const s = (search ?? "").trim();
  return useQuery<Paginated<ProfilesResposeDto>>({
    queryKey: qk.list(s, pageIndex, pageSize),
    queryFn: () => fetchProfilesList(s, pageIndex + 1, pageSize),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useProfilesOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();

  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qk.select(s, page, pageSize), 
    queryFn: () => fetchProfilesSelect(s, page, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}
export function useProfileById(id?: number | null) {
  return useQuery<ProfilesResposeDto>({
    queryKey: id != null ? qk.byId(id) : qk.byId(-1),
    queryFn: () => fetchProfileById(id as number),
    enabled: id != null,
  });
}

export function useProfileMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ProfileUpsertDto, "profilesId">
  >({
    mutationFn: createProfile,
    onMutate: () => showLoading("Creando perfil..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qk.lists(), exact: false });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el perfil."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando perfil.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, ProfileUpsertDto>({
    mutationFn: updateProfile,
    onMutate: () => showLoading("Actualizando perfil..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qk.lists(), exact: false }),
          vars.profilesId
            ? qc.invalidateQueries({ queryKey: qk.byId(vars.profilesId) })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el perfil."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando perfil.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, ProfileStatusDto>({
    mutationFn: updateProfileStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qk.lists(),
            exact: false,
            refetchType: "active",
          }),
          vars.profilesId
            ? qc.invalidateQueries({
                queryKey: qk.byId(vars.profilesId),
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
