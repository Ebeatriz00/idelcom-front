import { Modal, useModalHistoryLock } from "@/layouts";
import { PreSaleProyectsForm } from "./PreSaleProyectsForm";
import type { PreSaleProyectsUpsertDto } from "@/application/dtos/presale/PreSaleProyects.dto";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: Partial<PreSaleProyectsUpsertDto> & { [k: string]: any };
  onClose: () => void;
  onSubmit: (dto: PreSaleProyectsUpsertDto) => Promise<void>; 
  saving: boolean;
  clientsLabel?: string;
  contactsCrmLabel?: string;
  responsibleLabel?: string;
  supervisorLabel?: string;
  ssomaLabel?: string;
  tecLeaderLabel?: string;
  opportunityLabel?: string;
  statePreSaleLabel?: string;
  quotationNumberLabel?: string;
  orderNumberLabel?: string;
};

export function PreSaleProyectsFormModal({ 
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  clientsLabel,
  contactsCrmLabel,
  responsibleLabel,
  supervisorLabel,
  ssomaLabel,
  tecLeaderLabel,
  opportunityLabel,
  statePreSaleLabel,
  quotationNumberLabel,
  orderNumberLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "pre-sale-proyects-form"; 

  return (
    <div className="max-w-5xl mx-auto"> 
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
          <div className="p-2 text-sm">Cargando detalle…</div>
        ) : (
          <PreSaleProyectsForm
            key={defaultValues?.warehouseId ?? "new"} 
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            saving={saving}
            formId={formId}
            showActions={false}
            clientsLabel={clientsLabel}
            contactsCrmLabel={contactsCrmLabel}
            responsibleLabel={responsibleLabel}
            supervisorLabel={supervisorLabel}
            ssomaLabel={ssomaLabel}
            tecLeaderLabel={tecLeaderLabel}
            opportunityLabel={opportunityLabel}
            statePreSaleLabel={statePreSaleLabel}
            quotationNumberLabel={quotationNumberLabel}
            orderNumberLabel={orderNumberLabel}
          />
        )}
      </Modal>
    </div>
  );
}
