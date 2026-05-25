import type { ClientsUpsertDto } from "@/application";
import { Modal, useModalHistoryLock } from "@/layouts";
import { ClientsForm } from "./ClientsForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail?: boolean;
  defaultValues: Partial<ClientsUpsertDto> & { [k: string]: any };
  onClose: () => void;
  onSubmit: (dto: ClientsUpsertDto) => Promise<void> | void;
  saving?: boolean;
  documentTypeLabel?: string;
  workerLabel?: string;
  departmentLabel?: string;
  provinceLabel?: string;
  districtLabel?: string;
  processTypeLabel?: string;
  sectorLabel?: string;
  leadSourceLabel?: string;
  leadStatusLabel?: string;
  leadQualificationLabel?: string;
};

export function ClientsFormModal({
  open,
  title,
  loadingDetail = false,
  defaultValues,
  onClose,
  onSubmit,
  saving = false,
  documentTypeLabel,
  workerLabel,
  departmentLabel,
  provinceLabel,
  districtLabel,
  processTypeLabel,
  sectorLabel,
  leadSourceLabel,
  leadStatusLabel,
  leadQualificationLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "clients-crm-form";

  return (
    <Modal
      title={title}
      size="2xl"
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
          <ClientsForm
            key={defaultValues?.clientsId ?? "new"}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            saving={saving}
            formId={formId}
            showActions={false}
            departmentLabel={departmentLabel}
            provinceLabel={provinceLabel}
            districtLabel={districtLabel}
            documentTypeLabel={documentTypeLabel}
            workerLabel={workerLabel}
            processTypeLabel={processTypeLabel}
            sectorLabel={sectorLabel}
            leadSourceLabel={leadSourceLabel}
            leadStatusLabel={leadStatusLabel}
            leadQualificationLabel={leadQualificationLabel}
          />
        </div>
      )}
    </Modal>
  );
}
