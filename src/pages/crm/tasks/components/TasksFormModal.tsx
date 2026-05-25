import { Modal, useModalHistoryLock } from "@/layouts";
import { TasksForm } from "./TasksForm";
import type { TasksUpsertDto } from "@/application";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: Partial<TasksUpsertDto>; 
  onClose: () => void;
  onSubmit: (dto: TasksUpsertDto) => Promise<void>;
  saving: boolean;
  opportunityLabel?: string;
  stateTaskLabel?: string;
  workerLabel?: string;
  priorityStateLabel?: string;
};

export function TasksFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  opportunityLabel,
  stateTaskLabel,
  workerLabel,
  priorityStateLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "tasks-form";

  return (
    <Modal
      title={title}
      subtitle="Crea o edita una tarea."
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
        <TasksForm
          key={defaultValues.linkToken ?? "new"} 
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
          opportunityLabel={opportunityLabel}
          stateTaskLabel={stateTaskLabel}
          workerLabel={workerLabel}
          priorityStateLabel={priorityStateLabel}
        />
      )}
    </Modal>
  );
}