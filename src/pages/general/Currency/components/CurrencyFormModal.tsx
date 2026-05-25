import { Modal } from "@/layouts/components/ui/modal/Modal";
import { CurrencyForm } from "./CurrencyForm"; // Importamos el formulario de moneda
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";
import type { CurrencyUpsertDto } from "@/application"; // Importamos el DTO

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: CurrencyUpsertDto; // Usamos el DTO de Currency
  onClose: () => void;
  onSubmit: (dto: CurrencyUpsertDto) => Promise<void>; // Usamos el DTO de Currency
  saving: boolean;
};

export function CurrencyFormModal({
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

  const formId = "currency-form"; // ID de formulario actualizado
  return (
    <Modal
      title={title}
      subtitle="Crea o edita una moneda." // Subtítulo actualizado
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
        <CurrencyForm // Componente de formulario actualizado
          key={defaultValues.currencyId ?? "new"} // Key actualizada a currencyId
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