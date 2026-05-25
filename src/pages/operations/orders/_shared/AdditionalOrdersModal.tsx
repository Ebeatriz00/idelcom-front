import { Modal } from "@/layouts";
import { ClipboardList } from "lucide-react";
import { useOrdersList } from "@/sharedKernel/hooks/operations/orders/useOrders";
import { useMemo } from "react";

interface AdditionalOrdersModalProps {
  open: boolean;
  onClose: () => void;
  opporId: number;
}

export function AdditionalOrdersModal({ open, onClose, opporId }: AdditionalOrdersModalProps) {
  const { data, isLoading } = useOrdersList(0, 500, "");

  const additionals = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter(order => order.parentOpportunityId === opporId);
  }, [data?.items, opporId]);

  if (!open) return null;

  return (
    <Modal
      title="Adicionales del Proyecto"
      onClose={onClose}
      size="md"
    >
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            Mostrando operaciones adicionales asociadas.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3673]" />
          </div>
        ) : additionals.length > 0 ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {additionals.map((add) => (
              <div key={add.opporId} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-[#1A3673] transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">
                    {add.opporDesc}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 font-medium">
                    N° {add.opporNum} | Cliente: <span className="font-bold text-slate-700">{add.clientsName || "Sin cliente"}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <ClipboardList className="size-10 text-slate-300 mb-3" />
            <p className="text-xs font-bold text-slate-500 text-center">
              Aún no hay adicionales registrados para este proyecto
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
