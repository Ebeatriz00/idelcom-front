import { Modal } from "@/layouts/components/ui/modal/Modal";
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";
import { PermissionsForm } from "./PermissionsFrom";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: {
    permissionsId?: number;
    permissionsCode?: string
    permissionsName: string;
    permissionsDescription?: string;
  };
  onClose: () => void;
  onSubmit: (dto: {
    permissionsId?: number;
    permissionsName: string;
    permissionsCode?: string;
    permissionsDescription?: string;
  }) => Promise<void>;
  saving: boolean;
};

export function PermissionsFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "permissions-form";
  return (
    <Modal
      title={title}
      subtitle="Define permisos utilizados por los perfiles."
      onClose={onClose}
      size="xl"
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
        <PermissionsForm
          key={defaultValues.permissionsId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}         
          showActions={false}  
        />
      )}
    </Modal>
  );
}
