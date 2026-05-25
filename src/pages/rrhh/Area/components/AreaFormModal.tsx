import type { AreaUpsertDto } from "@/application";
import { Modal, useModalHistoryLock } from "@/layouts";
import { AreaForm } from "./AreaForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: AreaUpsertDto;
  onClose: () => void;
  onSubmit: (dto: AreaUpsertDto) => Promise<void>;
  saving: boolean;
};

export function AreaFormModal({
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

  const formId = "area-form";

  return (
    <Modal
      title={title}
      subtitle="Crea o edita un área."
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
        <AreaForm
          key={defaultValues.areaId ?? "new"}
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
