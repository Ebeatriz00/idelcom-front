import { Modal } from "@/layouts";

interface Props {
  open: boolean;
  onClose: () => void;
  sellersRaw?: string;
}

export function AccountSellersModal({
  open,
  onClose,
  sellersRaw,
}: Props) {
  if (!open) return null;

  const sellersList = sellersRaw && sellersRaw.includes(":")
    ? sellersRaw.split(":")[1].split(",").map(s => s.trim()).filter(Boolean)
    : sellersRaw ? [sellersRaw] : [];

  return (
    <Modal
      title="Vendedores Asignados"
      onClose={onClose}
      size="md"
      footer={
        <button
          onClick={onClose}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
        >
          Cerrar
        </button>
      }
    >
      <div className="py-2">
        {sellersList.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              No hay vendedores asignados detallados en el listado.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
            {sellersList.map((name, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">
                    {name}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Comercial
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
