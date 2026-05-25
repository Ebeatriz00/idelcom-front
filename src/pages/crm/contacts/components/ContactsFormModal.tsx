import type { ContactsUpsertDto } from "@/application/dtos/crm/contacts/Contacts.dto";
import { Modal, useModalHistoryLock } from "@/layouts";
import { ContactsForm } from "./ContactsForm";

type Props = {
  open: boolean;
  title: string;
  clientsId?: number;
  loadingDetail: boolean;
  defaultValues: ContactsUpsertDto;
  onClose: () => void;
  onSubmit: (dto: ContactsUpsertDto) => Promise<void>;
  saving: boolean;
  workerLabel?: string;
  leadsSourcesLabel?: string;
  contactTypeLabel?: string;
  clientsLabel?: string;
};

export function ContactsFormModal({
  open,
  title,
  clientsId,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  workerLabel,
  leadsSourcesLabel,
  contactTypeLabel,
  clientsLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "contacts-form-from-client";

  return (
    <Modal
      title={title}
      subtitle="Crear nuevo contacto para este cliente."
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
            {saving ? "Guardando..." : "Guardar Contacto"}
          </button>
        </>
      }
    >
      {loadingDetail ? (
        <div className="p-2 text-sm">Cargando...</div>
      ) : (
        <ContactsForm
          clientsId = {clientsId}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          formId={formId}
          hideClientSelector={false}
          workerLabel={workerLabel}
          leadsSourcesLabel={leadsSourcesLabel}
          contactTypeLabel={contactTypeLabel}
          clientsLabel={clientsLabel}
        />
      )}
    </Modal>
  );
}
