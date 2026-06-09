import { Modal, useModalHistoryLock } from "@/layouts";
import type { PropsModal } from "../../utils/types";
import { ClinicForm } from "./ClinicForm";

export function ClinicFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
}: PropsModal) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "clinic-form";
  return (
    <Modal
      title={title}
      size="md"
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
        <ClinicForm
          key={defaultValues.clinicName ?? "new"}
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
