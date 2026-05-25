import { Modal } from "@/layouts/components/ui/modal/Modal";
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";
import type { PropsFormModal } from "../../utils/categories.type";
import { CategoriesForm } from "./CategoriesForm";

export function CategoriesFormModal({
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

  const formId = "categories-form";
  return (
    <Modal
      title={title}
      subtitle="Crea o edita una categoría."
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
        <CategoriesForm
          key={defaultValues.categoriesId ?? "new"}
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
