import type {
  OptionItem,
  PagedSelect,
  Paginated,
  SectorResponseDto,
  SectorStatusDto,
  SectorUpsertDto,
} from "@/application";
import {
  createSector,
  fetchSectorById,
  fetchSectorList,
  fetchSectorSelect,
  updateSector,
  updateSectorStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkSector = {
  all: ["sector"] as const,
  lists: () => [...qkSector.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search?: string) =>
    [...qkSector.lists(), pageIndex, pageSize, search ?? ""] as const,

  selects: () => [...qkSector.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkSector.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkSector.all, "by-id", id] as const,
};

export function useSectorList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();
  return useQuery<Paginated<SectorResponseDto>>({
    queryKey: qkSector.list(pageIndex, pageSize, s),
    queryFn: () => fetchSectorList(pageIndex + 1, pageSize, s),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useSectorOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 100,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkSector.select(page, s, pageSize),
    queryFn: () => fetchSectorSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useSectorById(id?: number | null) {
  return useQuery<SectorResponseDto>({
    queryKey: id != null ? qkSector.byId(id) : qkSector.byId(-1),
    queryFn: () => fetchSectorById(id as number),
    enabled: id != null,
  });
}

export function useSectorMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<SectorUpsertDto, "SectorId">
  >({
    mutationFn: createSector,
    onMutate: () => showLoading("Creando fuente leads..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({ queryKey: qkSector.lists() });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la fuente leads."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando fuente leads.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, SectorUpsertDto>({
    mutationFn: updateSector,
    onMutate: () => showLoading("Actualizando fuente leads..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkSector.lists() }),
          vars.sectorId
            ? qc.invalidateQueries({
                queryKey: qkSector.byId(vars.sectorId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la fuente leads."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando fuente leads.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, SectorStatusDto>({
    mutationFn: updateSectorStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkSector.lists(),
            refetchType: "active",
          }),
          vars.sectorId
            ? qc.invalidateQueries({
                queryKey: qkSector.byId(vars.sectorId),
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
