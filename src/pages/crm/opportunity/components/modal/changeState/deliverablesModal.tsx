import type { OpportunitiesStateUpdateDto } from "@/application";
import { Modal } from "@/layouts";
import { DeliverablesForm } from "./deliverablesForm";

type Props = {
  open: boolean;
  loadingDetail?: boolean;
  stateOpporDesc: string;
  defaultValues: Partial<OpportunitiesStateUpdateDto>;
  onClose: () => void;
  onSubmit: (dto: OpportunitiesStateUpdateDto) => Promise<void> | void;
  saving?: boolean;
};

export function DeliverablesModal({
  open,
  loadingDetail,
  stateOpporDesc,
  defaultValues,
  onClose,
  onSubmit,
  saving,
}: Props) {
  if (!open) return null;

  const isOppor =
    (stateOpporDesc ?? "").trim().toUpperCase() === "OPORTUNIDAD";

  const canSave = isOppor;

  return (
    <Modal
      title="Gestión de Entregables"
      size="xl"
      onClose={onClose}
      footer={null}
    >
      {loadingDetail ? (
        <div className="p-10 flex justify-center text-sm text-gray-500">
          Cargando entregables...
        </div>
      ) : (
        <div className="p-6">
          <DeliverablesForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            saving={saving}
            onClose={onClose}
            formId="deliverables-only-form"
             disabled={!canSave}
          />
        </div>
      )}
    </Modal>
  );
}
