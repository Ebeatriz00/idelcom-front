import { Modal, useModalHistoryLock } from "@/layouts";
import { PasswordChangeForm } from "./PassowordChangeForm";

type Props = {
  open: boolean;
  usersId?: number | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (dto: { usersId: number; usersPassword: string }) => Promise<void>;
};

export function PasswordChangeFormModal({
  open,
  usersId,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "users-password-form";

  return (
    <Modal
      title="Cambiar contraseña"
      size="md"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm hover:bg-gray-100"
            disabled={saving}
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
      <PasswordChangeForm
        formId={formId}
        usersId={usersId ?? undefined}
        saving={saving}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
