import type { ContactsUpsertDto } from "@/application/dtos/crm/contacts/Contacts.dto";
import {
  closeAlert,
  showApiError,
  showSuccess,
} from "@/sharedKernel";
import { useContactsMutations } from "@/sharedKernel/hooks/crm/contacts/useContacts";
import { useState } from "react";

export function useLinkContactDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentClientsId, setCurrentClientsId] = useState<number | null>(null);

  const { createMut } = useContactsMutations();

  const open = (clientsId: number) => {
    setCurrentClientsId(clientsId);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setCurrentClientsId(null);
  };

  const handleSubmit = async (dto: ContactsUpsertDto) => {
    if (!currentClientsId) return;

    try {
      const contactDto: ContactsUpsertDto = {
        ...dto,
        clientsId: currentClientsId,
      };
      await createMut.mutateAsync(contactDto);
      showSuccess("Contacto creado y asociado exitosamente.");
      close();
    } catch (err) {
      showApiError(err, "Error creando contacto");
    } finally {
      closeAlert();
    }
  };

  return {
    isOpen,
    currentClientsId,
    open,
    close,
    onSubmit: handleSubmit,
    saving: createMut.isPending,
  };
}