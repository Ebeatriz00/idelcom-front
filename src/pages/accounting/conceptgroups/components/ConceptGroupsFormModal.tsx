import { Modal } from "@/layouts/components/ui/modal/Modal";
import { ConceptGroupsForm } from "./ConceptGroupsForm";
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";
import type { ConceptGroupsUpsertDto } from "@/application";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: Partial<ConceptGroupsUpsertDto>;
  onClose: () => void;
  onSubmit: (dto: ConceptGroupsUpsertDto) => Promise<void>;
  saving: boolean;
  conceptTypeLabel?: string;
};

export function ConceptGroupsFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  conceptTypeLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "concept-groups-form";
  return (
    <Modal
      title={title}
      subtitle="Crea o edita un grupo para tus conceptos."
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
        <ConceptGroupsForm
          key={defaultValues.conceptGroupsId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
          conceptTypeLabel={conceptTypeLabel}
        />
      )}
    </Modal>
  );
}