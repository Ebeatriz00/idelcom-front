import type { ClientsUpdateChangeSalesDto } from "@/application";
import { Modal, useModalHistoryLock } from "@/layouts";
import { VendorForm } from "./VendorForm";

type Props = {
  openSales: boolean;
  title: string;
  loadingDetail?: boolean;
  defaultValues: Partial<ClientsUpdateChangeSalesDto> & { [k: string]: any };
  onClose: () => void;
  onSubmit: (dto: ClientsUpdateChangeSalesDto) => Promise<void> | void;
  saving?: boolean;
  workerLabel?: string;
};

export function VendorFormModal({
  openSales,
  title,
  loadingDetail = false,
  defaultValues,
  onClose,
  onSubmit,
  saving = false,
  workerLabel,
}: Props) {
  useModalHistoryLock(openSales, onClose);
  if (!openSales) return null;

  const formId = "clients-vendor-crm-form";

  return (
    <Modal
      title={title}
      size="md"
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
          <VendorForm
            key={defaultValues?.warehouseId ?? "new"}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            saving={saving}
            formId={formId}
            showActions={false}
            workerLabel={workerLabel}
          />
        </div>
      )}
    </Modal>
  );
}
