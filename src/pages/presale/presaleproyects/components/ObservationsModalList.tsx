import { useMemo, useState, useEffect } from "react";
import { Modal } from "@/layouts";
import { useProjectObservationList } from "@/sharedKernel/hooks/observations/useObservations"; 
import { Loader2, MessageSquare, AlertCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  projectToken: string | null;
}

const PAGE_SIZE = 5;
const OBS_TYPE_COMMERCIAL = 1; 

export function ObservationsModalList({ open, onClose, projectToken }: Props) {
  const { data, isLoading } = useProjectObservationList(0, 0, "", projectToken ?? "");
  const [page, setPage] = useState(0);

  const historyItems = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter((item: any) => 
      item.obsType === OBS_TYPE_COMMERCIAL && item.typeObsEconomic === null
    );
  }, [data]);

  const totalItems = historyItems.length;
  const totalPages = Math.max(1, Math.ceil((totalItems || 1) / PAGE_SIZE));

  useEffect(() => {
    if (!open) setPage(0);
  }, [open]);

  const startIndex = page * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
  const pagedItems = useMemo(() => historyItems.slice(startIndex, endIndex), [historyItems, startIndex, endIndex]);

  if (!open) return null;

  return (
    <Modal
      title="Vista General de Observaciones"
      size="2xl"
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-xs">Cargando observaciones...</span>
          </div>
        ) : totalItems > 0 ? (
          <>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white">
              <table className="min-w-full table-fixed divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-full px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Detalle de la observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pagedItems.map((item: any) => {
                    return (
                      <tr key={item.obsId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="size-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 whitespace-pre-wrap break-words">{item.obsReason}</div>
                              <div className="mt-1 text-xs text-gray-400">
                                Por: <span className="text-gray-600">{item.openedByName ?? "Sistema"}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {totalItems > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-4 border-t pt-4 border-gray-100">
                <span className="text-xs text-gray-500">{startIndex + 1}–{endIndex} de {totalItems}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded border border-gray-200 px-3 py-1 text-xs font-medium hover:bg-gray-50 disabled:opacity-50">Ant</button>
                  <span className="text-xs font-medium">{page + 1} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="rounded border border-gray-200 px-3 py-1 text-xs font-medium hover:bg-gray-50 disabled:opacity-50">Sig</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-100">
            <AlertCircle className="mb-2 text-gray-400" size={32} />
            <p className="text-sm text-gray-500">No hay observaciones registradas en este proyecto.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}