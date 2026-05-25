import type { ClientActivityResponseDto } from "@/application";
import { useClientsActivityList, useClientsActivityMutations } from "@/sharedKernel";
import { CalendarClock, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import { ClientsActivityFormModal } from "./ClientsActivityFormModal";
import { getActivityIcon } from "./iconMap";
import { TimelineStatusSelector } from "./TimelineStatusSelector";

export async function showWarningConfirm(
  title = "¿Estás seguro?",
  text = "No podrás revertir esta acción.",
  confirmText = "Sí, continuar",
  cancelText = "No, cancelar"
): Promise<boolean> {
  const swalWithTailwindButtons = Swal.mixin({
    customClass: {
      confirmButton:
        "bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-4 rounded text-[11px] mr-2",
      cancelButton:
        "bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-4 rounded text-[11px]",
    },
    buttonsStyling: false,
  });

  const result = await swalWithTailwindButtons.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });

  return result.isConfirmed;
}

interface Props {
  clientsId: number;
  onActivityAdded?: () => void;
}

const ITEMS_PER_PAGE = 5;

export function ClientsDetailTimeline({ clientsId, onActivityAdded }: Props) {
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);

  const { data, isLoading } = useClientsActivityList(clientsId, page, ITEMS_PER_PAGE);
  const { deleteMut } = useClientsActivityMutations(clientsId);

  const response = data as any;
  const activities: ClientActivityResponseDto[] = response?.items ?? [];

  let rawTotal = response?.totalCount 
              ?? response?.totalItems 
              ?? response?.count 
              ?? response?.total 
              ?? response?.totalRecords 
              ?? response?.TotalRecords  
              ?? 0;
  if (rawTotal === 0 && activities.length > 0) {
     rawTotal = activities.length;
  }
  
  const totalItems = rawTotal;
  const totalPages = response?.totalPages ?? Math.ceil(totalItems / ITEMS_PER_PAGE) ?? 1;

  const from = totalItems === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const to = Math.min(page * ITEMS_PER_PAGE, totalItems);

  const handleDelete = async (activity: ClientActivityResponseDto) => {
    const isConfirmed = await showWarningConfirm(
      "¿Eliminar?",
      "Esta acción es permanente.",
      "Eliminar",
      "Cancelar"
    );

    if (isConfirmed) {
      deleteMut.mutate(activity.clientsActivityId, {
        onSuccess: () => {
          if (onActivityAdded) onActivityAdded();
        },
      });
    }
  };

  const fmtDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr.replace('Z', '')); 
    return (
      date.toLocaleDateString("es-PE", { day: "2-digit", month: "short" }) +
      " " +
      date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false })
    );
  };

  return (
    <div className="flex h-[480px] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden relative">
      
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-tight">
          <CalendarClock className="size-4 text-slate-400" />
          Línea de Tiempo
        </h3>
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600 transition hover:bg-blue-100"
        >
          <Plus className="size-3" /> Nuevo
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
             <p className="text-[10px] text-slate-400 font-medium italic animate-pulse">Cargando...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs italic text-slate-400">
            No hay actividades registradas.
          </div>
        ) : (
          <div className="relative ml-2.5 h-full border-l border-slate-100 flex flex-col justify-start gap-2">
            {activities.map((act) => (
              <div key={act.clientsActivityId} className="group relative pl-4 shrink-0">
                <div className="absolute -left-[13.5px] top-1 flex size-6 items-center justify-center rounded-full border border-white bg-slate-50 text-slate-500 shadow-sm z-10">
                  {getActivityIcon(act.activityIcon, "size-3")}
                </div>

                <div className="relative rounded-lg border border-slate-50 bg-slate-50/30 p-2 transition-all hover:bg-white hover:shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      <div className="relative">
                        <TimelineStatusSelector
                          clientsActivityId={act.clientsActivityId}
                          currentClientId={clientsId}
                          initialStateId={act.activityStateId}
                          initialStateColor={act.stateColor}
                          initialStateDesc={act.stateDesc}
                        />
                      </div>
                      <h4 className="truncate text-[11px] font-bold text-slate-800 leading-none">
                        {act.activity}
                      </h4>
                    </div>
                    <span className="shrink-0 text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                      {fmtDate(act.finishDate)} | {act.workerName}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-1 whitespace-pre-wrap text-[10px] font-medium leading-tight text-slate-600">
                    {act.description}
                  </p>

                  <div className="absolute bottom-1 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => handleDelete(act)} className="text-rose-400 hover:text-rose-600">
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto flex shrink-0 items-center justify-between border-t border-slate-100 pt-3 bg-white z-20 relative">
        
        <p className="text-[10px] text-slate-500">
            {totalItems > 0 ? (
               <>
                 <span className="font-semibold">{from}-{to}</span> de {totalItems}
               </>
            ) : (
               <span className="italic opacity-50">0 registros</span>
            )}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm hover:bg-blue-100 hover:text-blue-600 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="size-3" />
            </button>
            
            <span className="text-[10px] font-bold text-slate-600">
                {page}/{totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm hover:bg-blue-100 hover:text-blue-600 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="size-3" />
            </button>
          </div>
        )}
      </div>

      <ClientsActivityFormModal 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        clientsId={clientsId} 
        onSuccess={onActivityAdded} 
      />
    </div>
  );
}