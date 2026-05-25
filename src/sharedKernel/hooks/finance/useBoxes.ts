import type {
  Paginated,
  BoxesUpsertDto,
  BoxesResponseDto,
  BoxesStatusDto,
  PagedSelect,
  OptionItem,
} from "@/application";
import {
  createBoxes,
  fetchBoxesById,
  fetchBoxesList,
  fetchBoxesSelect,
  updateBoxes,
  updateBoxesStatus,
} from "@/infrastructure";
import { useFinBoxesPerms } from "@/pages/finance/boxes/hooks/boxes.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkBoxes = {
  all: ["boxes"] as const,
  lists: () => [...qkBoxes.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string, usersKey: string) =>
    [...qkBoxes.lists(), pageIndex, pageSize, search ?? "", usersKey] as const,

  selects: () => [...qkBoxes.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkBoxes.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkBoxes.all, "by-id", id] as const,
};

export function useBoxesOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkBoxes.select(page, s, pageSize),
    queryFn: () => fetchBoxesSelect(page, s, pageSize), 
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}



export function useBoxesList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();

  const {canViewAllBoxes, isLoadingPerms} = useFinBoxesPerms();
  const userIdStr = useAuth((s) => s.userId);  
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersBy: number | undefined = canViewAllBoxes
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewAllBoxes ? "all" : userIdStr ?? "all";  
  const enabled = !isLoadingPerms && (canViewAllBoxes || !!userId);  

  return useQuery<Paginated<BoxesResponseDto>>({
    queryKey: qkBoxes.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchBoxesList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useBoxesById(id?: number | null) {
  return useQuery<BoxesResponseDto>({
    queryKey: id != null ? qkBoxes.byId(id) : qkBoxes.byId(-1),
    queryFn: () => fetchBoxesById(id as number),
    enabled: id != null,
  });
}

export function useBoxesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<BoxesUpsertDto, "boxesId">
  >({
    mutationFn: createBoxes,
    onMutate: () => showLoading("Registrando nueva caja..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkBoxes.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo registrar.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando.");
    },
  });

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    BoxesUpsertDto
  >({
    mutationFn: updateBoxes,
    onMutate: () => showLoading("Actualizando caja..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkBoxes.lists() }),
          vars.boxesId
            ? qc.invalidateQueries({
                queryKey: qkBoxes.byId(vars.boxesId),
              })
            : Promise.resolve(),
        ]);

      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la caja."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando caja.");
    },
  });

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    BoxesStatusDto
  >({
    mutationFn: updateBoxesStatus,
    onMutate: (vars) =>
      showLoading(vars.status === "1" ? "Activando caja..." : "Desactivando caja..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkBoxes.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo cambiar el estado.");
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
  });

  return { createMut, updateMut, statusMut };
}