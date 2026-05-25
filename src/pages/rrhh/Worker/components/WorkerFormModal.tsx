import type { WorkerUpsertDto } from "@/application"; 
import { Modal, useModalHistoryLock } from "@/layouts";
import { WorkerForm } from "./WorkerForm"; 

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: WorkerUpsertDto;
  onClose: () => void;
  onSubmit: (dto: WorkerUpsertDto) => Promise<void>;
  saving: boolean;
  areaLabel: string;
  jobTitleLabel?: string,
  departmentLabel: string;
  provinceLabel: string;
  districtLabel: string;
};

export function WorkerFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  areaLabel,
  jobTitleLabel,
  departmentLabel,
  provinceLabel,
  districtLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "worker-form"; 

  return (
    <Modal
      title={title}
      size="full"
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
        <div className="p-4 text-center text-sm text-gray-500">
          Cargando detalle…
        </div>
      ) : (
        <WorkerForm
          key={defaultValues.workerId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
          areaLabel={areaLabel}
          jobTitleLabel={jobTitleLabel}
          departmentLabel={departmentLabel}
          provinceLabel={provinceLabel}
          districtLabel={districtLabel} 
        />
      )}
    </Modal>
  );
}
