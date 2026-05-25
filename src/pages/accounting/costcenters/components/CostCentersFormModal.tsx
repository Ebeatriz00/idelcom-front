import type { CostCentersUpsertDto } from "@/application";
import { Modal, useModalHistoryLock } from "@/layouts";
import { CostCentersForm } from "./CostCentersForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: CostCentersUpsertDto;
  onClose: () => void;
  onSubmit: (dto: CostCentersUpsertDto) => Promise<void>;
  saving: boolean;
};

export function CostCentersFormModal({
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

  const formId = "CostCenters-form"; 

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
        <CostCentersForm
          key={defaultValues.costCentersId ?? "new"}
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