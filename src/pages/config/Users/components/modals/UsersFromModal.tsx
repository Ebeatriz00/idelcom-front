import { Modal, useModalHistoryLock } from "@/layouts";
import { UsersForm } from "./UsersForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: {
    workerId?: number;
    usersId?: number;
    usersName: string;
    usersLastName: string;
    usersCode: string;
    usersEmail: string;
    documentTypeId?: number;
    profilesId?: number;
    usersDocument: string;
    usersPhoto: string;
    usersPassword: string;
  };

  onClose: () => void;
  onSubmit: (dto: {
    workerId?: number;
    usersId?: number;
    usersName: string;
    usersLastName: string;
    usersCode: string;
    usersEmail: string;
    documentTypeId?: number;
    profilesId?: number;
    usersDocument: string;
    usersPhoto: string;
    usersPassword: string;
  }) => Promise<void>;
  saving: boolean;
  profilesLabel?: string;
  documentTypeLabel?: string;
  workerLabel?: string;
};

export function UsersFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  profilesLabel,
  documentTypeLabel,
  workerLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "users-form";
  return (
    <Modal
      title={title}
      subtitle="Crea o edita un usuario."
      size="2xl"
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
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      {loadingDetail ? (
        <div className="p-2 text-sm">Cargando detalle…</div>
      ) : (
        <UsersForm
          key={
            defaultValues.profilesId ?? defaultValues.documentTypeId ?? "new"
          }
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
          profilesLabel={profilesLabel}
          documentTypeLabel={documentTypeLabel}
          workerLabel={workerLabel}
        />
      )}
    </Modal>
  );
}
