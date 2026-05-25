import { Modal, useModalHistoryLock } from "@/layouts";
import { StatesForm } from "./StateOpportunityForm";

type FormValues = {
  stateOpportunityId?: number;
  stateColor: string;
  stateDesc: string;
  numPercPro: number;
  numOrder: number;
};

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues?: Partial<FormValues>;
  onClose: () => void;
  onSubmit: (dto: FormValues) => Promise<void>;
  saving: boolean;
};

const ensureDefaults = (v?: Partial<FormValues>): FormValues => ({
  stateOpportunityId: v?.stateOpportunityId,
  stateColor: v?.stateColor ?? "",
  stateDesc: v?.stateDesc ?? "",
  numPercPro: v?.numPercPro ?? 0,
  numOrder: v?.numOrder ?? 0,
});

export function StatesFormModal({
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

  const normalized = ensureDefaults(defaultValues);
  const formId = "states-opportunity-form";

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
        <StatesForm
          key={normalized.stateOpportunityId ?? "new"}
          defaultValues={normalized}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
        />
      )}
    </Modal>
  );
}
