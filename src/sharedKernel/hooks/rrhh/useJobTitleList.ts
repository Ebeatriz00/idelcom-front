import type { OptionItem, PagedSelect, Paginated } from "@/application";
import type {
  JobTitleStatusDto,
  JobTitleUpsertDto,
} from "@/application/dtos/rrhh/JobTitle/JobTitle.dto";
import type {
  JobTitleResponseByIdDto,
  JobTitleResponseDto,
} from "@/application/dtos/rrhh/JobTitle/JobTitleResponse.dto";
import {
  createJobTitle,
  fetchJobTitleById,
  fetchJobTitleList,
  fetchJobTitleSelect,
  updateJobTitle,
  updateJobTitleStatus,
} from "@/infrastructure/api-clients/rrhh/jobtitle/jobtitle.client";
import { useHrJobTitlePerms } from "@/pages/rrhh/JobTitle/hooks/jobTitle.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkJobTitle = {
  all: ["jobTitle"] as const,
  lists: () => [...qkJobTitle.all, "list"] as const,
  list: (page: number, pageSize: number, search: string, usersKey: string) =>
    [...qkJobTitle.lists(), page, pageSize, search ?? "",usersKey] as const,

  selects: () => [...qkJobTitle.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkJobTitle.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkJobTitle.all, "by-id", id] as const,
};

function patchJobTitleListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: JobTitleResponseDto) => boolean,
  updater: (it: JobTitleResponseDto) => JobTitleResponseDto
) {
  const caches = qc.getQueriesData<{ items: JobTitleResponseDto[] }>({
    queryKey: qkJobTitle.lists(),
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

export function useJobTitleList(
  page: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const{canViewAllJobTitle, isLoadingPerms} = useHrJobTitlePerms();
    const userIdStr = useAuth((s) => s.userId);  
    const userId = userIdStr != null ? Number(userIdStr) : undefined;
    const usersBy: number | undefined = canViewAllJobTitle
      ? undefined
      : userId ?? undefined;
    const usersKeyPart: string = canViewAllJobTitle ? "all" : userIdStr ?? "all";
    const enabled = !isLoadingPerms && (canViewAllJobTitle || !!userId);  



  return useQuery<Paginated<JobTitleResponseDto>>({
    queryKey: qkJobTitle.list(page, pageSize, s, usersKeyPart),
    queryFn: () => fetchJobTitleList(page + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useJobTitleOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 1000,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkJobTitle.select(page, s, pageSize),
    queryFn: () => fetchJobTitleSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useJobTitleById(id?: number | null) {
  return useQuery<JobTitleResponseByIdDto>({
    queryKey: id != null ? qkJobTitle.byId(id) : qkJobTitle.byId(-1),
    queryFn: () => fetchJobTitleById(id as number),
    enabled: id != null,
  });
}

export function useJobTitleMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<JobTitleUpsertDto, "jobTitleId">
  >({
    mutationFn: createJobTitle,
    onMutate: () => showLoading("Registrando nuevo cargo..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkJobTitle.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, JobTitleUpsertDto>({
    mutationFn: updateJobTitle,
    onMutate: () => showLoading("Actualizando cargo..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        if (vars.jobTitleId) {
          patchJobTitleListsAfterUpdate(
            qc,
            (it) => it.jobTitleId === vars.jobTitleId,
            (it) => ({
              ...it,

              description: vars.description ?? it.description,
              areaId: vars.areaId ?? it.areaId,
            })
          );

          await qc.invalidateQueries({
            queryKey: qkJobTitle.byId(vars.jobTitleId),
          });
        }
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, JobTitleStatusDto>({
    mutationFn: updateJobTitleStatus,
    onMutate: (vars) =>
      showLoading(
        vars.status === "1" ? "Activando cargo..." : "Desactivando cargo..."
      ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkJobTitle.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado."
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
