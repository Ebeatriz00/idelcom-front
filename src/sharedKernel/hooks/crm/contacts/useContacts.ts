import type { OptionItem, PagedSelect, Paginated } from "@/application";
import type {
  ContactsStatusDto,
  ContactsUpsertDto,
} from "@/application/dtos/crm/contacts/Contacts.dto";
import type { ContactsResponseDto } from "@/application/dtos/crm/contacts/ContactsResponse.dto";
import {
  createContacts,
  fetchContactsById,
  fetchContactsList,
  fetchContactsSelect,
  updateContacts,
  updateContactsStatus,
} from "@/infrastructure/api-clients/crm/contacts/contacts.client";
import { useCrmContactsPerms } from "@/pages/crm/contacts/hooks/permissions/contacts.perms";

import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkContacts = {
  all: ["contacts"] as const,
  lists: () => [...qkContacts.all, "list"] as const,
  list: (
    pageIndex: number,
    pageSize: number,
    search: string,
    usersKey: string,
  ) =>
    [
      ...qkContacts.lists(),
      pageIndex,
      pageSize,
      search ?? "",
      usersKey,
    ] as const,

  selects: () => [...qkContacts.all, "select"] as const,
  select: (
    clientsId: number,
    page: number,
    search: string,
    pageSize: number,
    workerId: string,
  ) =>
    [
      ...qkContacts.selects(),
      clientsId,

      page,
      search ?? "",
      pageSize,
      workerId,
    ] as const,

  byId: (id: number) => [...qkContacts.all, "by-id", id] as const,
};

function patchContactsListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: ContactsResponseDto) => boolean,
  updater: (it: ContactsResponseDto) => ContactsResponseDto,
) {
  const caches = qc.getQueriesData<{ items: ContactsResponseDto[] }>({
    queryKey: qkContacts.lists(),
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

export function useContactsSelects(
  clientsId: number,
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();

  const { canViewAllContacts, isLoadingPerms } = useCrmContactsPerms();

  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr != null ? Number(workerIdStr) : undefined;

  const usersBy = canViewAllContacts ? undefined : workerId;
  const usersKeyPart = canViewAllContacts ? "all" : (workerIdStr ?? "all");

  const enabledInternal = !isLoadingPerms && (canViewAllContacts || !!workerId);

  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkContacts.select(clientsId, page, s, pageSize, usersKeyPart),
    queryFn: () => fetchContactsSelect(clientsId, page, s, pageSize, usersBy),
    retry: false,
    placeholderData: (prev) => prev,
    enabled: (opts?.enabled ?? true) && enabledInternal,
    staleTime: 30_000,
  });
}

export function useContactsList(
  pageIndex: number,
  pageSize: number,
  search?: string,
) {
  const s = (search ?? "").trim();

  const { canViewAllContacts, isLoadingPerms } = useCrmContactsPerms();
  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr != null ? Number(workerIdStr) : undefined;
  const usersBy: number | undefined = canViewAllContacts
    ? undefined
    : (workerId ?? undefined);
  const usersKeyPart: string = canViewAllContacts
    ? "all"
    : (workerIdStr ?? "all");

  const enabled = !isLoadingPerms && (canViewAllContacts || !!workerId);

  return useQuery<Paginated<ContactsResponseDto>>({
    queryKey: qkContacts.list(pageIndex, pageSize, s, usersKeyPart),
    queryFn: () => fetchContactsList(pageIndex + 1, pageSize, s, usersBy),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useContactsById(id?: number | null) {
  return useQuery<ContactsResponseDto>({
    queryKey: id != null ? qkContacts.byId(id) : qkContacts.byId(-1),
    queryFn: () => fetchContactsById(id as number),
    enabled: id != null,
  });
}

export function useContactsMutations() {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ContactsUpsertDto, "contactsId">
  >({
    mutationFn: createContacts,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkContacts.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, ContactsUpsertDto>({
    mutationFn: updateContacts,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        if (vars.contactsCrmId) {
          patchContactsListsAfterUpdate(
            qc,
            (it) => it.contactsCrmId === vars.contactsCrmId,
            (it) => ({
              ...it,
              contactName: vars.contactName,
              jobTitle: vars.jobTitle,
              phone: vars.phone,
              movil: vars.movil,
              email: vars.email,
              workerId: vars.workerId,
              clientsId: vars.clientsId,
              leadsSourcesId: vars.leadsSourcesId,
              contactTypeId: vars.contactTypeId,
            }),
          );

          await qc.invalidateQueries({
            queryKey: qkContacts.all,
          });
        }
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando.");
    },
  });

  const statusMut = useMutation<GlobalResponse, unknown, ContactsStatusDto>({
    mutationFn: updateContactsStatus,
    onMutate: (vars) =>
      showLoading(
        vars.status === "1"
          ? "Activando contacto..."
          : "Desactivando contacto...",
      ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await qc.invalidateQueries({
          queryKey: qkContacts.all,
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
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
