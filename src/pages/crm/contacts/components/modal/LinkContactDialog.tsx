import type { ContactsUpsertDto } from "@/application/dtos/crm/contacts/Contacts.dto";
import { Modal, useModalHistoryLock } from "@/layouts";
import { useAuth } from "@/stores/auth"; // 1. Nuevo import
import { useMemo } from "react"; // 2. Nuevo import
import { ContactsForm } from "../ContactsForm";

interface LinkContactDialogProps {
  open: boolean;
  clientsId: number;
  onClose: () => void;
  onSubmit: (dto: ContactsUpsertDto) => Promise<void>;
  saving?: boolean;
}

export function LinkContactDialog({
  open,
  clientsId,
  onClose,
  onSubmit,
  saving = false,
}: LinkContactDialogProps) {
  useModalHistoryLock(open, onClose);

  // 3. Obtenemos el ID del trabajador actual desde el store
  const currentWorkerId = useAuth((s) => s.workerId);

  // 4. Memoizamos los valores por defecto. 
  // Esto es CRÍTICO: evita que el objeto se regenere en cada render,
  // lo que causaba que el formulario se reseteara a 0 constantemente.
  const defaultValues = useMemo<Partial<ContactsUpsertDto>>(
    () => ({
      contactName: "",
      jobTitle: "",
      phone: "",
      movil: "",
      email: "",
      // Si ya cargó el usuario, usamos su ID. Si no, 0.
      workerId: currentWorkerId ? Number(currentWorkerId) : 0,
      clientsId: clientsId,
      leadsSourcesId: 0,
      contactTypeId: 0,
    }),
    [clientsId, currentWorkerId]
  );

  if (!open) return null;
  const formId = "link-contact-form";

  return (
    <Modal
      title="Asociar Contacto al Cliente"
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={formId}
            disabled={saving}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Creando..." : "Crear Contacto"}
          </button>
        </>
      }
    >
      <ContactsForm
        clientsId={clientsId}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        // saving={saving} // Nota: ContactsForm no recibía 'saving' en tu código, verifica si lo necesitas
        hideClientSelector={true}
        formId={formId}
        // showActions={false} // Comentado porque ContactsForm no tiene esta propiedad definida
      />
    </Modal>
  );
}