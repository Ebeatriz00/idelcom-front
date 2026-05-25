
import type { ContactsUpsertDto } from "@/application/dtos/crm/contacts/Contacts.dto";
import type { ContactsResponseDto } from "@/application/dtos/crm/contacts/ContactsResponse.dto";
import { createContacts, updateContacts } from "@/infrastructure/api-clients/crm/contacts/contacts.client";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { qkContacts } from "@/sharedKernel/hooks/crm/contacts/useContacts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchContactsListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: ContactsResponseDto) => boolean, 
  updater: (it: ContactsResponseDto) => ContactsResponseDto
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


export const useContactsMutations = () => { 
  const qc = useQueryClient();


  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<ContactsUpsertDto, "contactsId"> 
  >({
    mutationFn: createContacts, 
    onMutate: () => showLoading("Registrando nuevo contacto..."), 
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkContacts.all,
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


  const updateMut = useMutation<GlobalResponse, unknown, ContactsUpsertDto>({ 
    mutationFn: updateContacts, 
    onMutate: () => showLoading("Actualizando contacto..."), 
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
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
            })
          );

          await qc.invalidateQueries({
            queryKey: qkContacts.byId(vars.contactsCrmId),
          });
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

  return { createMut, updateMut };
};