import type { ActivityOpporCreateDto } from "@/application";
import { Modal, useModalHistoryLock } from "@/layouts";
import { ActivityForm } from "./activityForm";

type Props = {
  open: boolean;
  title: string;
  defaultValues: ActivityOpporCreateDto;
  onClose: () => void;
  onSubmit: (dto: ActivityOpporCreateDto) => Promise<void>;
  saving: boolean;
  workerSenderLabel?: string;
  activityStateLabel?: string;
  activityTypeLabel?: string;
  activityPriorityLabel?: string;
};
export function ActivityFormModal({
  open,
  title,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  workerSenderLabel,
  activityStateLabel,
  activityTypeLabel,
  activityPriorityLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
    if (!open) return null;
  const formId = "activity-oppor";

  return (
    <Modal
    
      title={title}
      size="xl"
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
      <ActivityForm
        key={defaultValues.linkToken ?? "new"}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        saving={saving}
        formId={formId}
        showActions={false}
        workerSenderLabel={workerSenderLabel}
        activityStateLabel={activityStateLabel}
        activityTypeLabel={activityTypeLabel}
        activityPriorityLabel={activityPriorityLabel}
      />
    </Modal>
  );
}
