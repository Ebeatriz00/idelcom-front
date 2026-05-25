// features/modules-permissions/components/PermissionsMiniListModal.tsx
import { Modal } from "@/layouts/components/ui/modal/Modal";
import { PermissionsMiniList, type MiniPermission } from "./table/PermissionsList";

export function PermissionsMiniListModal({
  open,
  onClose,
  moduleName,
  items,
  onEditPermission,
}: {
  open: boolean;
  onClose: () => void;
  moduleName: string;
  items: MiniPermission[];
  onEditPermission: (perm: MiniPermission) => void;
}) {
  if (!open) return null;

  return (
    <Modal
      title={`Permisos de ${moduleName}`}
      subtitle="Lista de permisos vinculados al módulo."
      onClose={onClose}
      size="md"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-3 py-2 text-sm hover:bg-gray-100"
        >
          Cerrar
        </button>
      }
    >
      <PermissionsMiniList items={items} pageSize={10} onEdit={onEditPermission} />
    </Modal>
  );
}
