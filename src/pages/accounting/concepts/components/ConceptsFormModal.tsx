import { Modal, useModalHistoryLock } from "@/layouts";
import { ConceptsForm } from "./ConceptsForm";
import type { ConceptsUpsertDto } from "@/application";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: ConceptsUpsertDto;
  onClose: () => void;
  onSubmit: (dto: ConceptsUpsertDto) => Promise<void>;
  saving: boolean;
  conceptGroupsLabel?: string;
  accountPlanLabel?: string;
};

export function ConceptsFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  conceptGroupsLabel,
  accountPlanLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "concepts-form"; 

  return (
    <Modal
      title={title}
      subtitle="Crea o edita un concepto." 
      size="lg" 
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
        <ConceptsForm
          key={defaultValues.conceptsId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false} 
          conceptGroupsLabel={conceptGroupsLabel}
          accountPlanLabel={accountPlanLabel}
        />
      )}
    </Modal>
  );
}