import { Modal } from "@/layouts/components/ui/modal/Modal";
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";
import { ModulesPermissionsForm } from "./ModulesPermissionsForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: {
    modulesPermissionsId?: number;
    modulesId?: number;
    permissionsId?: number;
  };
  onClose: () => void;
  onSubmit: (dto: {
    modulesPermissionsId?: number;
    modulesId?: number;
    permissionsId?: number;
  }) => Promise<void>;
  saving: boolean;
  lockModule?: boolean;
  moduleLabel?: string;
  permissionLabel?: string;
};

export function ModulesPermissionsFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  lockModule = false,
  moduleLabel,
  permissionLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "modules-permissions-form";

  return (
    <Modal
      title={title}
      subtitle="Vincula un permiso a un módulo."
      onClose={onClose}
      size="2xl"
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
        <ModulesPermissionsForm
          key={defaultValues.modulesPermissionsId ?? defaultValues.modulesId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}         
          showActions={false}     
          lockModule={lockModule}
          moduleLabel={moduleLabel}
          permissionLabel={permissionLabel}
        />
      )}
    </Modal>
  );
}
