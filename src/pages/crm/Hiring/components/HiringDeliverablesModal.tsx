import type { OpportunitiesStateUpdateDto } from "@/application";
import { Modal } from "@/layouts";
import { HiringDeliverablesForm } from "./HiringDeliverablesForm";

type Props = {
  open: boolean;
  loadingDetail?: boolean;
  defaultValues: Partial<OpportunitiesStateUpdateDto>;
  onClose: () => void;
  onSubmit: (dto: OpportunitiesStateUpdateDto) => Promise<void> | void;
  saving?: boolean;

  taskStateOptions?: any[];
  onTaskStatusChange?: (taskId: string, newStateId: string) => void;
  isReadOnly?: boolean;
  
};

export function HiringDeliverablesModal({
  open,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  taskStateOptions,
  onTaskStatusChange,
  isReadOnly = false
}: Props) {
  if (!open) return null;

  return (
    <Modal
      title="Gestión de Consultas de Contratación"
      size="2xl"
      onClose={onClose}
      footer={null}
    >
      {loadingDetail ? (
        <div className="p-10 flex justify-center text-sm text-gray-500">
          Cargando información...
        </div>
      ) : (
        <div className="p-6">
          <HiringDeliverablesForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            saving={saving}
            onClose={onClose}
            taskStateOptions={taskStateOptions}
            onTaskStatusChange={onTaskStatusChange}
            isReadOnly={isReadOnly}
          />
        </div>
      )}
    </Modal>
  );
}