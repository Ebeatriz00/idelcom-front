import { Modal, useModalHistoryLock } from "@/layouts";
import { AccountPlanForm } from "./AccountPlanForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: {
    accountPlanId?: number;
    accountCode: string;
    accountName: string;
    accountTypeId?: number;
    accountLevelId?: number;
    typeAnalysisId?: number;
    currencyId?: number;
    auxiliaryTypeId?: number;
    difereceChange?: string;
    docControl?: string;
    accountAmarreDebit?: number;
    accountAmarreCredit?: number;
  };

  onClose: () => void;
  onSubmit: (dto: {
    accountPlanId?: number;
    accountCode: string;
    accountName: string;
    accountTypeId?: number;
    accountLevelId?: number;
    typeAnalysisId?: number;
    currencyId?: number;
    auxiliaryTypeId?: number;
    difereceChange?: string;
    docControl?: string;
    accountAmarreDebit?: number;
    accountAmarreCredit?: number;
  }) => Promise<void>;
  saving: boolean;
  accountTypeLabel?: string;
  accountLevelLabel?: string;
  typeAnalysisLabel?: string;
  auxiliaryTypeLabel?: string;
  currencyLabel?: string;
  accountAmarreDebitLabel?: string;
  accountAmarreCreditLabel?: string;
};

export function AccountPlanFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  accountTypeLabel,
  accountLevelLabel,
  typeAnalysisLabel,
  auxiliaryTypeLabel,
  currencyLabel,
  accountAmarreDebitLabel,
  accountAmarreCreditLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "account-plan-form";
  return (
    <Modal
      title={title}
      size="2xl"
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
        <AccountPlanForm
          key={
            defaultValues.accountPlanId ?? defaultValues.accountPlanId ?? "new"
          }
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
          accountTypeLabel={accountTypeLabel}
          accountLevelLabel={accountLevelLabel}
          typeAnalysisLabel={typeAnalysisLabel}
          currencyLabel={currencyLabel}
          accountAmarreDebitLabel={accountAmarreDebitLabel}
          accountAmarreCreditLabel={accountAmarreCreditLabel}
          auxiliaryTypeLabel={auxiliaryTypeLabel}
        />
      )}
    </Modal>
  );
}
