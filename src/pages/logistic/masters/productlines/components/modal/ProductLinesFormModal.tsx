import type { ProductLinesUpsertDto } from "@/application";
import { Modal } from "@/layouts/components/ui/modal/Modal";
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";
import { ProductLinesForm } from "./ProductLinesForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: Partial<ProductLinesUpsertDto>;
  onClose: () => void;
  onSubmit: (dto: ProductLinesUpsertDto) => Promise<void>;
  saving: boolean;
  categoriesLabel?: string;
};

export function ProductLinesFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  categoriesLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "product-lines-form";
  return (
    <Modal
      title={title}
      subtitle="Crea o edita una línea de producto."
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
        <ProductLinesForm
          key={defaultValues.productLinesId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
          categoriesLabel={categoriesLabel}
        />
      )}
    </Modal>
  );
}
