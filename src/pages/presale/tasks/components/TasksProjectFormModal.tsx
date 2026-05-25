import { Modal, useModalHistoryLock } from "@/layouts";
import { TasksProjectForm } from "./TasksProjectForm";
import type { TasksProjectUpsertDto } from "@/application";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: TasksProjectUpsertDto;
  onClose: () => void;
  onSubmit: (dto: TasksProjectUpsertDto) => Promise<void>;
  saving: boolean;
  projectLabel?: string;
  stateTaskLabel?: string;
  workerLabel?: string;
  priorityStateLabel?: string;
};

export function TasksProjectFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  projectLabel,
  stateTaskLabel,
  workerLabel,
  priorityStateLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "tasks-project-form";

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
        <TasksProjectForm
          key={defaultValues.tasksId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
          projectLabel={projectLabel}
          stateTaskLabel={stateTaskLabel}
          workerLabel={workerLabel}
          priorityStateLabel={priorityStateLabel}
        />
      )}
    </Modal>
  );
}