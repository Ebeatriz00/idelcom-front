
import { Modal } from "@/layouts/components/ui/modal/Modal";
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";
import type { WarehousesUpsertDto } from "@/application";
import { WarehousesForm } from "./WarehousesForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail?: boolean;
  defaultValues: Partial<WarehousesUpsertDto> & { [k: string]: any };
  onClose: () => void;
  onSubmit: (dto: WarehousesUpsertDto) => Promise<void> | void;
  saving?: boolean;
  departmentLabel?: string;
  provinceLabel?: string;
  districtLabel?: string;
};

export function WarehousesFormModal({
  open,
  title,
  loadingDetail = false,
  defaultValues,
  onClose,
  onSubmit,
  saving = false,
  departmentLabel,
  provinceLabel,
  districtLabel,
}: Props) {

  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "warehouses-form";

  return (
    <Modal
      title={title}
      subtitle="Crea o edita un almacén dentro del sistema de inventario."
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
        <div className="p-4 min-h-[30vh]"> {}
          <WarehousesForm
            key={defaultValues?.warehousesId ?? "new"}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            saving={saving}
            formId={formId}
            showActions={false}
            departmentLabel={departmentLabel}
            provinceLabel={provinceLabel}
            districtLabel={districtLabel}
          />
        </div>
      )}
    </Modal>
  );
}
