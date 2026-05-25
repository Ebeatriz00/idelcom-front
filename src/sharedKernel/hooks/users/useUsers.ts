import type {
  Paginated,
  UsersPasswordChangeDto,
  UsersResponseDto,
  UsersResponseIdDto,
  UsersStatusDto,
  UsersUpsertDto,
} from "@/application";
import {
  createUsers,
  fetchUsersById,
  fetchUsersList,
  updatePasswordChange,
  updateUsers,
  updateUsersStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkUsers = {
  all: ["users"] as const,
  lists: () => [...qkUsers.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search?: string) =>
    [...qkUsers.lists(), pageIndex, pageSize, search ?? ""] as const,

  byId: (id: number) => [...qkUsers.all, "by-id", id] as const,
};

export function useUsersList(
  pageIndex: number,
  pageSize: number,
  search?: string
) {
  const s = (search ?? "").trim();
  return useQuery<Paginated<UsersResponseDto>>({
    queryKey: qkUsers.list(pageIndex, pageSize, s),
    queryFn: () => fetchUsersList(pageIndex + 1, pageSize, s),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}
export function useUsersById(id?: number | null) {
  return useQuery<UsersResponseIdDto>({
    queryKey: id != null ? qkUsers.byId(id) : qkUsers.byId(-1),
    queryFn: () => fetchUsersById(id as number),
    enabled: id != null,
  });
}

export function useUsersMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<UsersUpsertDto, "usersId">
  >({
    mutationFn: createUsers,
    onMutate: () => showLoading("Creando usuarios..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkUsers.lists(),
          exact: false,
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear el usuarios."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando usuarios.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, UsersUpsertDto>({
    mutationFn: updateUsers,
    onMutate: () => showLoading("Actualizando usuarios..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkUsers.lists(), exact: false }),
          vars.usersId
            ? qc.invalidateQueries({ queryKey: qkUsers.byId(vars.usersId) })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar el usuarios."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando usuarios.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, UsersStatusDto>({
    mutationFn: updateUsersStatus,
    onMutate: () => showLoading("Actualizando estado..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({
            queryKey: qkUsers.lists(),
            exact: false,
            refetchType: "active",
          }),
          vars.usersId
            ? qc.invalidateQueries({
                queryKey: qkUsers.byId(vars.usersId),
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

  const paswwordChangeMut = useMutation<
    GlobalResponse,
    unknown,
    UsersPasswordChangeDto
  >({
    mutationFn: updatePasswordChange,
    onMutate: () => showLoading("Actualizando contraseña..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          qc.invalidateQueries({ queryKey: qkUsers.lists(), exact: false }),
          vars.usersId
            ? qc.invalidateQueries({ queryKey: qkUsers.byId(vars.usersId) })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la contraseña."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando la contrasena.");
    },
  });
  return { createMut, updateMut, statusMut, paswwordChangeMut };
}
