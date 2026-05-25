import { useEffect, useMemo, useState, Fragment } from "react";
import { Modal } from "@/layouts";
import { 
  useProjectObservationList, 
  useProjectObservationMutations 
} from "@/sharedKernel/hooks/observations/useObservations"; 
import { fmtDate } from "@/sharedKernel";
import { Check, Ban, Save, Loader2, CalendarOff, X, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

interface Props {
  open: boolean;
  onClose: () => void;
  projectToken: string | null;
}

const PAGE_SIZE = 5;

// Constantes
const OBS_TYPE_COMMERCIAL = 1; 

const STATUS_APPROVED = 4;
const STATUS_REJECTED = 5;
const STATUS_COMPLETED = 7; 

export function HistoryObservationsModal({ open, onClose, projectToken }: Props) {
  // Hook de carga de datos
  const { data, isLoading } = useProjectObservationList(0, 0, "", projectToken ?? "");
  const { updateObservationMut } = useProjectObservationMutations();
  
  // -----------------------------------------------------------------------
  // 1. FILTRO CORREGIDO (Solución Parte 1)
  // Filtramos para que solo pasen las que son ObsType 1 Y que NO tengan typeObsEconomic
  // -----------------------------------------------------------------------
  const historyItems = useMemo(() => {
    const items = data?.items ?? [];

    return items.filter((item: any) => {
      // Debe ser Tipo Comercial (1)
      const isCommercial = item.obsType === OBS_TYPE_COMMERCIAL;
      // Y el campo typeObsEconomic debe ser nulo (para excluir las del Caso B)
      const isNotEconomic = item.typeObsEconomic === null; 

      return isCommercial && isNotEconomic;
    });
  }, [data]);


  const internalDueDate = useMemo(() => {
    if (!historyItems || historyItems.length === 0) return null;

 
    const itemWithDate = historyItems.find((item: any) => 
        item.dueDate || item.finishDate || item.expirationDate
    );


    if (itemWithDate) {
        return itemWithDate.dueDate;
    }
    
    return null;
  }, [historyItems]);

  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionText, setRejectionText] = useState("");
  const [localUserId, setLocalUserId] = useState<number>(6);
  const [page, setPage] = useState(0);

  const totalItems = historyItems.length;
  const totalPages = Math.max(1, Math.ceil((totalItems || 1) / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [totalPages, page]);

  useEffect(() => {
    if (!open) {
      setRejectingId(null);
      setRejectionText("");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      try {
        const storedUser = localStorage.getItem("user") || localStorage.getItem("auth") || localStorage.getItem("session");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const foundId = parsed.id || parsed.userId || parsed.businessId || parsed.sub;
          if (foundId) setLocalUserId(Number(foundId));
        }
      } catch (error) {
        console.warn("No se pudo leer usuario, usando default (6).");
      }
    }
  }, [open]);

  const startIndex = page * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);

  const pagedItems = useMemo(
    () => historyItems.slice(startIndex, endIndex),
    [historyItems, startIndex, endIndex]
  );

  const handleApprove = (obsId: number) => {
    Swal.fire({
      title: "¿Aprobar observación?",
      text: "Esta acción es definitiva.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981", 
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        updateObservationMut.mutate({
          obsId,
          isApproved: true,
          usersBy: localUserId,
          rejectionReason: undefined 
        });
      }
    });
  };

  const handleStartReject = (obsId: number) => {
    if (rejectingId === obsId) {
      setRejectingId(null);
    } else {
      setRejectingId(obsId);
      setRejectionText(""); 
    }
  };

  const handleConfirmReject = (obsId: number) => {
    if (!rejectionText.trim()) {
      Swal.fire("Atención", "Debes ingresar el motivo.", "warning");
      return;
    }
    updateObservationMut.mutate({
      obsId,
      isApproved: false,
      rejectionReason: rejectionText,
      usersBy: localUserId
    }, {
      onSuccess: () => {
        setRejectingId(null);
        setRejectionText("");
      }
    });
  };

  if (!open) return null;

  return (
    <Modal
      title="Historial de Observaciones"
      size="full"
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
        ) : !internalDueDate ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 animate-in fade-in duration-300">
             <CalendarOff className="mb-3 opacity-50" size={40} />
             <p className="text-sm font-medium text-gray-500">No hay observaciones válidas o fecha asignada.</p>
          </div>
        ) : totalItems > 0 ? (
          <>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full table-fixed divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-[50%] px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Observación
                    </th>
                    <th className="w-[15%] px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                      Estado
                    </th>
                    <th className="w-[15%] px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                      Fecha
                    </th>
                    <th className="w-[20%] px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {pagedItems.map((item: any) => {
                    const label = item.stateDesc || item.statusLabel || "Pendiente";
                    const colorClass = item.stateColor || "bg-gray-100 text-gray-600";
                    const finalColorClass = colorClass.includes("-500") || colorClass.includes("-600") 
                      ? `${colorClass} text-white` 
                      : colorClass;
                    
                    const isRejectingThis = rejectingId === item.obsId;
                    const hasBoolDecision = item.isApproved !== null && item.isApproved !== undefined;
                    const hasStatusDecision = item.obsStatusId === STATUS_APPROVED || item.obsStatusId === STATUS_REJECTED;
                    const isResolved = hasBoolDecision || hasStatusDecision;

                    const isCompleted = item.obsStatusId === STATUS_COMPLETED;

                    return (
                      <Fragment key={item.obsId}>
                        <tr className={`transition-colors ${isRejectingThis ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                          
                          <td className="px-4 py-4 align-top">
                            <div className="text-sm font-medium text-gray-900 whitespace-pre-wrap">
                              {item.obsReason}
                            </div>
                            
                            <div className="mt-1 text-xs text-gray-400">
                              Por: {item.openedByName ?? "Sistema"}
                              {item.closedAt && (
                                <span className="ml-1 text-gray-500">
                                  — {fmtDate(item.closedAt)}
                                </span>
                              )}
                            </div>

                            {item.rejectionReason && (
                               <div className="mt-2 rounded bg-red-50 p-1.5 text-xs text-red-700 border border-red-100">
                                  <strong>Motivo Rechazo:</strong> {item.rejectionReason}
                               </div>
                            )}
                          </td>

                          <td className="px-4 py-4 align-middle text-center">
                             <span className={`inline-flex items-center rounded px-2 py-1 text-[10px] font-bold uppercase ${finalColorClass}`}>
                                {label}
                             </span>
                          </td>

                          <td className="px-4 py-4 align-middle text-center text-xs text-gray-500">
                             {fmtDate(item.dueDate)}
                          </td>

                          <td className="px-4 py-4 align-middle text-center">
                            {isResolved ? (
                              <span className={`text-[10px] font-medium italic ${
                                  (item.isApproved === true || item.obsStatusId === STATUS_APPROVED) 
                                    ? 'text-emerald-600' 
                                    : 'text-red-500'
                                }`}>
                                 { (item.isApproved === true || item.obsStatusId === STATUS_APPROVED) ? "— Aprobado —" : "— Rechazado —"}
                              </span>
                            ) : isCompleted ? (
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => handleApprove(item.obsId)}
                                  disabled={updateObservationMut.isPending || isRejectingThis}
                                  className="group flex items-center justify-center p-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Aprobar"
                                >
                                  <Check size={18} strokeWidth={2.5} />
                                </button>

                                <button
                                  onClick={() => handleStartReject(item.obsId)}
                                  disabled={updateObservationMut.isPending}
                                  className={`group flex items-center justify-center p-2 rounded-full border transition-all ${
                                    isRejectingThis 
                                      ? "bg-red-100 text-red-700 border-red-300 ring-2 ring-red-100" 
                                      : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-800"
                                  }`}
                                  title={isRejectingThis ? "Cancelar rechazo" : "Rechazar"}
                                >
                                  {isRejectingThis ? <X size={18} strokeWidth={2.5}/> : <Ban size={18} strokeWidth={2.5} />}
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-1 opacity-70">
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                  <AlertCircle size={12} />
                                  Actualizar estado de la tarea a COMPLETADO
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>

                        {isRejectingThis && (
                          <tr className="bg-gray-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <td colSpan={4} className="px-4 pb-4 pt-0 border-b border-gray-100">
                              <div className="relative mt-2 rounded-lg border border-red-200 bg-white p-3 shadow-sm">
                                <div className="absolute -top-1.5 right-[13%] h-3 w-3 rotate-45 border-l border-t border-red-200 bg-white sm:right-[15%]"></div>
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                  ¿Por qué rechazas esta observación?
                                </label>
                                <textarea
                                  autoFocus
                                  value={rejectionText}
                                  onChange={(e) => setRejectionText(e.target.value)}
                                  placeholder="Escribe el motivo aquí..."
                                  className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-200 outline-none resize-none min-h-[60px]"
                                />
                                <div className="mt-2 flex justify-end gap-2">
                                  <button
                                    onClick={() => setRejectingId(null)}
                                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => handleConfirmReject(item.obsId)}
                                    className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-medium px-4 py-1.5 rounded hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70"
                                    disabled={updateObservationMut.isPending}
                                  >
                                    {updateObservationMut.isPending ? <Loader2 size={12} className="animate-spin"/> : <Save size={12} />}
                                    Confirmar Rechazo
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalItems > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-4 border-t pt-4 border-gray-100">
                <span className="text-xs text-gray-500">
                  {startIndex + 1}–{endIndex} de {totalItems}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="rounded border border-gray-200 px-3 py-1 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    Ant
                  </button>
                  <span className="text-xs font-medium">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="rounded border border-gray-200 px-3 py-1 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sig
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-100">
            <p className="text-sm text-gray-400">No hay observaciones registradas.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}