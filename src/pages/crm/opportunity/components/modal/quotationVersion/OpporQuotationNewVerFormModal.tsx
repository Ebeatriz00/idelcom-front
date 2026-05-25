import type { OpportunitiesUploadNewVerDto } from "@/application";
import { Modal } from "@/layouts";
import { toast } from "sonner";
import { OpporQuotationNewVerForm } from "./OpporQuotationNewVerForm";

type Props = {
  open: boolean;
  title: string;
  uploadPct?: number;
  defaultValues: Partial<OpportunitiesUploadNewVerDto> & { [k: string]: any };
  onClose: () => void;
  onSubmit: (dto: OpportunitiesUploadNewVerDto) => Promise<void> | void;
  saving?: boolean;
};
export function OpporQuotationNewVerFormModal({
  open,
  title,
  defaultValues,
  onClose,
  onSubmit,
  saving = false,
  uploadPct = 0,
}: Props) {
  if (!open) return null;
  const formId = "opportunity-quotation-ver-new-form";
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
      size="2xl"
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
            disabled={busy}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {busy ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      <div className="p-4 min-h-[30vh]">
        <OpporQuotationNewVerForm
          key={defaultValues?.opporId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
          uploadPct={uploadPct}
        />
      </div>
    </Modal>
  );
}
