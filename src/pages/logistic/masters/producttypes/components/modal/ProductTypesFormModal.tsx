import { Modal } from "@/layouts/components/ui/modal/Modal";
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";
import type { PropsModal } from "../../utils/productType.type";
import { ProductTypesForm } from "./ProductTypesForm";

export function ProductTypesFormModal({
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

  const formId = "productTypes-form";
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
      {loadingDetail ? (
        <div className="p-2 text-sm">Cargando detalle…</div>
      ) : (
        <ProductTypesForm
          key={defaultValues.productTypesId ?? "new"}
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
