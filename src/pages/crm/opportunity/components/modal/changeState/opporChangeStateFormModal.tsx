import type { OpportunitiesStateUpdateDto } from "@/application";
import { Modal } from "@/layouts";
import { toast } from "sonner";
import { OpporChangeStateForm } from "./opporChangeStateForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail?: boolean;
  uploadPct?: number;
  defaultValues: Partial<OpportunitiesStateUpdateDto> & { [k: string]: any };
  onClose: () => void;
  onSubmit: (dto: OpportunitiesStateUpdateDto) => Promise<void> | void;
  saving?: boolean;
  stateOpporLabel?: string;
  reasonRejectionLabel?: string;
  quotationVerNoLabel?: string;
  pmConditionLabel?: string;
};

export function OpporChangeStateFormModal({
  open,
  title,
  loadingDetail = false,
  defaultValues,
  onClose,
  onSubmit,
  saving = false,
  uploadPct = 0,
  stateOpporLabel,
  reasonRejectionLabel,
  quotationVerNoLabel,
  pmConditionLabel,
}: Props) {
  if (!open) return null;

  const formId = "opportunity-change-state-form";
  const handleClose = () => {
    if (saving) {
      toast.info("Espera, el Excel se esta procesando…");
      return;
    }
    onClose();
  };
  const busy = saving || (uploadPct > 0 && uploadPct < 100);
  return (
    <Modal
      title={title}
      size="full"
      onClose={onClose}
      closeOnEsc={!busy}
      closeOnBackdrop={!busy}
      hideCloseButton={busy}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
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
          <OpporChangeStateForm
            key={defaultValues?.warehouseId ?? "new"}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            saving={saving}
            formId={formId}
            showActions={false}
            stateOpporLabel={stateOpporLabel}
            reasonRejectionLabel={reasonRejectionLabel}
            quotationVerNoLabel={quotationVerNoLabel}
            uploadPct={uploadPct}
            pmConditionLabel={pmConditionLabel}
          />
        </div>
      )}
    </Modal>
  );
}
