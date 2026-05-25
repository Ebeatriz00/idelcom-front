import { Modal } from "@/layouts/components/ui/modal/Modal";
import { DocumentTypeForm } from "./DocumentTypeForm";
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  // Se define el tipo de los datos aquí, igual que en el formulario
  defaultValues: {
    documentTypeId?: number;
    description: string;
    codeSunat: string;
  };
  onClose: () => void;
  onSubmit: (dto: {
    documentTypeId?: number;
    description: string;
    codeSunat: string;
  }) => Promise<void>;
  saving: boolean;
};

export function DocumentTypeFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "document-types-form";
  return (
    <Modal
      title={title}
      subtitle="Crea o edita un tipo de documento."
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
      {loadingDetail ? (
        <div className="p-2 text-sm">Cargando detalle…</div>
      ) : (
        <DocumentTypeForm
          key={defaultValues.documentTypeId ?? "new"}
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