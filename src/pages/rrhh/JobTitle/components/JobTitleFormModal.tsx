import type { JobTitleUpsertDto } from "@/application";
import { Modal, useModalHistoryLock } from "@/layouts";
import { JobTitleForm } from "./JobTitleForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: Partial<JobTitleUpsertDto>;
  onClose: () => void;
  onSubmit: (dto: JobTitleUpsertDto) => Promise<void>;
  saving: boolean;
  areaLabel?: string;
};

export function JobTitleFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  areaLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "job-title-form";
  return (
    <Modal
      title={title}
      subtitle="Crea o edita un cargo para tu organización."
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
        <JobTitleForm
          key={defaultValues.jobTitleId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
          areaLabel={areaLabel}
        />
      )}
    </Modal>
  );
}
