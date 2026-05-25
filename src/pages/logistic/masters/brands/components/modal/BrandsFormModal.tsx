import { Modal, useModalHistoryLock } from "@/layouts";
import type { PropsFormModal } from "../../utils/brands.type";
import { BrandsForm } from "./BrandsForm";

export function BrandsFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
}: PropsFormModal) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "brands-form";
  return (
    <Modal
      title={title}
      subtitle="Crea o edita una marca."
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
        <BrandsForm
          key={defaultValues.brandsId ?? "new"}
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
