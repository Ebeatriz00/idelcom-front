import type { UsersResponseIdDto, UsersUpsertDto } from "@/application";
import { createUsers, updateUsers } from "@/infrastructure";
import {
  closeAlert,
  qkUsers,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchUsersfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: UsersResponseIdDto) => boolean,
  updater: (it: UsersResponseIdDto) => UsersResponseIdDto
) {
  const caches = qc.getQueriesData<{ items: UsersResponseIdDto[] }>({
    queryKey: qkUsers.lists(),
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

export const useUsersMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<UsersUpsertDto, "UsersId">
  >({
    mutationFn: createUsers,
    onMutate: () => showLoading("Registrando nuevo usuario..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkUsers.lists(),
          exact: false,
          refetchType: "active",
        });
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

  const updateMut = useMutation<GlobalResponse, unknown, UsersUpsertDto>({
    mutationFn: updateUsers,
    onMutate: () => showLoading("Actualizando usuario..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.usersId) {
          patchUsersfterUpdate(
            qc,
            (it) => it.usersId === vars.usersId,
            (it) => ({
              ...it,
              workerId: vars.workerId,
              usersName: vars.usersName,
              usersLastName: vars.usersLastName,
              usersCode: vars.usersCode,
              usersEmail: vars.usersEmail,
              documentTypeId: vars.documentTypeId,
              profilesId: vars.profilesId,
              usersDocument: vars.usersDocument,
              usersPhoto: vars.usersPhoto,
            })
          );
        }
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

  const updatePassMut = useMutation<GlobalResponse, unknown, UsersUpsertDto>({
    mutationFn: updateUsers,
    onMutate: () => showLoading("Actualizando usuario..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.usersId) {
          patchUsersfterUpdate(
            qc,
            (it) => it.usersId === vars.usersId,
            (it) => ({
              ...it,
              usersPassword: vars.usersPassword,
            })
          );
        }
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

  return { createMut, updateMut, updatePassMut };
};
