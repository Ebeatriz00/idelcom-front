import { Modal } from "@/layouts/components/ui/modal/Modal";
import { SeriesForm } from "./SeriesForm";
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";
import type { SeriesUpsertDto } from "@/application";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: Partial<SeriesUpsertDto>;
  onClose: () => void;
  onSubmit: (dto: SeriesUpsertDto) => Promise<void>;
  saving: boolean;
  paymentTypeLabel?: string;
};

export function SeriesFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  paymentTypeLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "series-form";
  return (
    <Modal
      title={title}
      subtitle="Crea o edita una serie para tus comprobantes."
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
        <SeriesForm
          key={defaultValues.seriesId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
          paymentTypeLabel={paymentTypeLabel}
        />
      )}
    </Modal>
  );
}