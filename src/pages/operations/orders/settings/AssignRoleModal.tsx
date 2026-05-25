import { Modal } from "@/layouts";
import { AssignRoleForm } from "./AssignRoleForm";
import type { RoleType } from "./useAssignRoleModal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { workerId?: number | null; workerName?: string | null }) => void;
  saving: boolean;
  defaultValues: { workerId?: number | null };
  currentWorkerName?: string;
  roleType: RoleType | null;
  opporNum?: string;
};

export function AssignRoleModal({
  open,
  onClose,
  onSubmit,
  saving,
  defaultValues,
  currentWorkerName,
  roleType,
  opporNum,
}: Props) {
  if (!open) return null;

  const formId = "assign-role-form";
  const title = roleType === "ProjectManager" ? "Asignar Gerente de Proyecto" : "Asignar Supervisor de Calidad";

  return (
    <Modal
      title={`${title} - Orden N° ${opporNum ?? ""}`}
      size="md"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={formId}
            disabled={saving}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50 transition-colors"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      <div className="p-6">
        <AssignRoleForm
          formId={formId}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          workerLabel={currentWorkerName}
        />
      </div>
    </Modal>
  );
}
