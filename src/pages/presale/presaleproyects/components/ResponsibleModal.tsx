import { Modal } from "@/layouts";
import { ResponsibleForm } from "./ResponsibleForm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { linkToken: string; workerId: number; projectCategory: number }) => void;
  saving: boolean;
  defaultValues: { linkToken: string; workerId?: number; projectCategory?: number };
  currentResponsibleName?: string;
};

export function ResponsibleModal({
  open,
  onClose,
  onSubmit,
  saving,
  defaultValues,
  currentResponsibleName,
}: Props) {
  if (!open) return null;

  const formId = "responsible-change-form";

  return (
    <Modal
      title="Asignar especialista del Proyecto"
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
      <div className="p-6">
        <ResponsibleForm
          formId={formId}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          workerLabel={currentResponsibleName}
        />
      </div>
    </Modal>
  );
}