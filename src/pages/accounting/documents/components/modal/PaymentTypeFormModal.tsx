import type { PaymentTypeUpsertDto } from "@/application";
import { Modal, useModalHistoryLock } from "@/layouts";
import { PaymentTypeForm } from "./PaymentTypeForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: PaymentTypeUpsertDto;
  onClose: () => void;
  onSubmit: (dto: PaymentTypeUpsertDto) => Promise<void>;
  saving: boolean;
};

export function PaymentTypeFormModal({
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

  const formId = "PaymentType-form";
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
        <PaymentTypeForm
          key={defaultValues.paymentTypeId ?? "new"}
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
