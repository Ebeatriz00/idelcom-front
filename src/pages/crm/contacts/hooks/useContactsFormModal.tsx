import type { ContactsUpsertDto } from "@/application/dtos/crm/contacts/Contacts.dto";
import { closeAlert, showApiError } from "@/sharedKernel";
import {
  useContactsById,
  useContactsMutations,
} from "@/sharedKernel/hooks/crm/contacts/useContacts";
import { useMemo, useState } from "react";

export function useContactsFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useContactsById(editingId);
  const { createMut, updateMut } = useContactsMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        contactName: "",
        jobTitle: "",
        phone: "",
        movil: "",
        email: "",
        workerId: 0,
        clientsId: 0,
        leadsSourcesId: 0,
        contactTypeId: 0,
      };
    }

    return {
      contactsCrmId: detail?.contactsCrmId ?? editingId,
      contactName: detail?.contactName ?? "",
      jobTitle: detail?.jobTitle ?? "",
      phone: detail?.phone ?? "",
      movil: detail?.movil ?? "",
      email: detail?.email ?? "",
      workerId: detail?.workerId,
      clientsId: detail?.clientsId,
      leadsSourcesId: detail?.leadsSourcesId,
      contactTypeId: detail?.contactTypeId,
    };
  }, [editingId, detail]);

  function openCreate() {
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(id: number) {
    setEditingId(id);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
  }

  async function submit(dto: ContactsUpsertDto) {
    try {
      if (dto.contactsCrmId == null) {
        await createMut.mutateAsync(dto);
      } else {
        await updateMut.mutateAsync(dto);
      }
      close();
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
    }
  }

  const saving = createMut.isPending || updateMut.isPending;

  return {
    open,
    isFetching,
    defaultValues,
    detail,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
    clientsId: detail?.clientsId,
  };
}
