import { Modal } from "@/layouts";
import { SsomaForm } from "./SsomaForm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { requeredSsoma: boolean; workerId: number[] }) => void;
  saving: boolean;
  defaultValues: { workerId?: number[] };
  opporNum?: string;
};

export function SsomaModal({ open, onClose, onSubmit, saving, defaultValues, opporNum }: Props) {
  if (!open) return null;

  const formId = "ssoma-change-form";

  return (
    <Modal
      title={`Asignar Especialistas SSOMA - Orden N° ${opporNum ?? ""}`}
      size="xl"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={formId}
            disabled={saving}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Guardando..." : "Guardar Equipo"}
          </button>
        </div>
      }
    >
      <div className="p-6">
        <SsomaForm
          formId={formId}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
        />
      </div>
    </Modal>
  );
}