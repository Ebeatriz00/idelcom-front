import { Modal } from "@/layouts/components/ui/modal/Modal";
import { UomForm } from "./UomForm"; 
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";
import type { UomUpsertDto } from "@/application"; 

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: UomUpsertDto; 
  onClose: () => void;
  onSubmit: (dto: UomUpsertDto) => Promise<void>; 
  saving: boolean;
};

export function UomFormModal({
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

  const formId = "uom-form"; 
  return (
    <Modal
      title={title}
      subtitle="Crea o edita una unidad de medida." 
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
        <UomForm 
          key={defaultValues.uomId ?? "new"} 
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