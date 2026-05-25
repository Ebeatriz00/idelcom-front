import type {
  MovementTypesResponseDto,
  MovementTypesStatusDto,
  MovementTypesUpsertDto,
  Paginated,
} from "@/application";
import {
  createMovementTypes,
  fetchMovementTypesById,
  fetchMovementTypesList,
  updateMovementTypes,
  updateMovementTypesStatus,
} from "@/infrastructure";
import { useMassMovTypePerms } from "@/pages/logistic/masters/movementtypes/hooks/movType.perms";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkMovementTypes } from "../keys/qkMovementTypes";

export function useMovementTypesList(
  pageIndex: number,
  pageSize: number,
  search?: string,
) {
  const s = (search ?? "").trim();

  const { canViewAllMovType, isLoadingPerms } = useMassMovTypePerms();
  const userIdStr = useAuth((s) => s.userId);
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersBy: number | undefined = canViewAllMovType
    ? undefined
    : (userId ?? undefined);
  const usersKeyPart: string = canViewAllMovType ? "all" : (userIdStr ?? "all");
  const enabled = !isLoadingPerms && (canViewAllMovType || !!userId);

  return useQuery<Paginated<MovementTypesResponseDto>>({
    queryKey: qkMovementTypes.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchMovementTypesList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useMovementTypesById(id?: number | null) {
  return useQuery<MovementTypesResponseDto>({
    queryKey: id != null ? qkMovementTypes.byId(id) : qkMovementTypes.byId(-1),
    queryFn: () => fetchMovementTypesById(id as number),
    enabled: id != null,
  });
}

export function useMovementTypesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<MovementTypesUpsertDto, "movementTypesId">
  >({
    mutationFn: createMovementTypes,
    onMutate: () => showLoading("Registrando nuevo tipo de movimiento..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkMovementTypes.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar el tipo de movimiento.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando el tipo de movimiento.");
    },
  });

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    MovementTypesUpsertDto
  >({
    mutationFn: updateMovementTypes,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkMovementTypes.lists() }),
          vars.movementTypesId
            ? qc.invalidateQueries({
                queryKey: qkMovementTypes.byId(vars.movementTypesId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el tipo de movimiento.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando el tipo de movimiento.");
    },
  });

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    MovementTypesStatusDto
  >({
    mutationFn: updateMovementTypesStatus,
    onMutate: (vars) =>
      showLoading(
        vars.status === "1"
          ? "Activando tipo de movimiento..."
          : "Desactivando tipo de movimiento...",
      ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkMovementTypes.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado del tipo de movimiento.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(
        e,
        "Error al cambiar el estado del tipo de movimiento.",
      );
    },
  });

  return { createMut, updateMut, statusMut };
}
