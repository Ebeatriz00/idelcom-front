import { Modal, useModalHistoryLock } from "@/layouts";
import { AccountForm } from "./AccountForm";
import type { AccountUpsertDto } from "@/application";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: AccountUpsertDto;
  onClose: () => void;
  onSubmit: (dto: AccountUpsertDto) => Promise<void>;
  saving: boolean;
  currencyLabel?: string;
  bankLabel?: string;
  accountPlanLabel?: string;
};

export function AccountFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  currencyLabel,
  bankLabel,
  accountPlanLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "account-form";

  return (
    <Modal
      title={title}
      subtitle="Crea o edita una cuenta."
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
        <AccountForm
          key={defaultValues.accountId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
          currencyLabel={currencyLabel}
          bankLabel={bankLabel}
          accountPlanLabel={accountPlanLabel}
        />
      )}
    </Modal>
  );
}