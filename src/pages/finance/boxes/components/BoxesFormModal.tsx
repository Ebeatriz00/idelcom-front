import { Modal, useModalHistoryLock } from "@/layouts";
import { BoxesForm } from "./BoxesForm";
import type { BoxesUpsertDto } from "@/application";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: BoxesUpsertDto;
  onClose: () => void;
  onSubmit: (dto: BoxesUpsertDto) => Promise<void>;
  saving: boolean;
  currencyLabel?: string;
};

export function BoxesFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  currencyLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "boxes-form";

  return (
    <Modal
      title={title}
      subtitle="Crea o edita una caja."
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
        <BoxesForm
          key={defaultValues.boxesId ??defaultValues.boxesId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
          currencyLabel={currencyLabel}
        />
      )}
    </Modal>
  );
}