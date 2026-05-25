import type { OpportunitiesUpsertDto } from "@/application";
import { Modal, useModalHistoryLock } from "@/layouts";
import { OpportunityForm } from "./opportunityForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail?: boolean;
  defaultValues: Partial<OpportunitiesUpsertDto> & { [k: string]: any };
  onClose: () => void;
  onSubmit: (
    dto: OpportunitiesUpsertDto,
  ) => Promise<{ Id: number; opporNum: string }>;

  saving?: boolean;
  clientsLabel?: string;
  businessLineLabel?: string;
  stateOpporLabel?: string;
  workerLabel?: string;
  currencyLabel?: string;
  contactsLabel?: string;
  negotiationStagesLabel?: string;
  canCreateOpporManager?: boolean;
  flowTypeLabel?: string;
  pmConditionLabel?: string;
};

export function OpportunityFormModal({
  open,
  title,
  loadingDetail = false,
  defaultValues,
  onClose,
  onSubmit,
  saving = false,
  clientsLabel,
  businessLineLabel,
  workerLabel,
  currencyLabel,
  negotiationStagesLabel,
  contactsLabel,
  flowTypeLabel,
  pmConditionLabel,
  canCreateOpporManager,
}: Props) {
  useModalHistoryLock(open, onClose);

  const isEdit =
    !!defaultValues?.opporNumber ||
    !!defaultValues?.opporInternalNumber ||
    defaultValues?.opporId != null;

  const isOpporManager = (() => {
    const v = defaultValues?.isOpporManager;
    if (v == null) return null;
    const n = Number(v);
    if (!Number.isNaN(n)) return n === 1;
    return v === true;
  })();

  const useManagerForm = isEdit
    ? isOpporManager === true
    : !!canCreateOpporManager;

  const stableKey =
    String(
      defaultValues?.opporId ??
        defaultValues?.opporNumber ??
        defaultValues?.opporInternalNumber ??
        "new",
    ) + (useManagerForm ? "-mgr" : "-seller");
  const formId = "opportunity-crm-form";
  if (!open) return null;

  return (
    <Modal
      title={title}
      size="full"
      onClose={() => {
        onClose();
      }}
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
            disabled={saving || loadingDetail}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      {loadingDetail ? (
        <div className="p-6 min-h-[200px] flex items-center justify-center text-sm text-gray-600">
          Cargando detalle…
        </div>
      ) : (
        <div className="p-4 min-h-[30vh]">
          <OpportunityForm
            key={stableKey}
            defaultValues={defaultValues}
            onSubmit={async (dto) => {
              const created = await onSubmit(dto);
              onClose();
              return created;
            }}
            saving={saving}
            formId={formId}
            showActions={false}
            clientsLabel={clientsLabel}
            businessLineLabel={businessLineLabel}
            workerLabel={workerLabel}
            currencyLabel={currencyLabel}
            negotiationStagesLabel={negotiationStagesLabel}
            contactsLabel={contactsLabel}
            flowTypeLabel={flowTypeLabel}
            pmConditionLabel={pmConditionLabel}
          />
        </div>
      )}
    </Modal>
  );
}
