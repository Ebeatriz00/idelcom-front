import { useEffect, useMemo, useState, Fragment } from "react";
import { Modal } from "@/layouts";
import { 
  useProjectObservationProjectList, 
  useProjectObservationMutations 
} from "@/sharedKernel/hooks/observations/useObservations"; 
import { fmtDate, useStateTasks } from "@/sharedKernel"; 
import { Loader2, MessageSquare, AlertCircle, CalendarIcon, Lock } from "lucide-react";
import StatusPickerDialog from "./detail/taskProject/states/statusPickerDialog";
import { StatusChip } from "./detail/taskProject/ui/statusChip";
import { useTaskPickers } from "./detail/taskProject/useTasksPickers";

const COLOR_MAP: Record<string, string> = {
  "bg-gray-400": "#9CA3AF",
  "bg-gray-100 text-gray-600": "#F3F4F6",
  "bg-blue-500": "#3B82F6",
  "bg-blue-600": "#2563EB",
  "bg-green-500": "#22C55E",
  "bg-green-600": "#16A34A",
  "bg-yellow-500": "#EAB308",
  "bg-amber-500": "#F59E0B",
  "bg-red-500": "#EF4444",
  "bg-rose-500": "#F43F5E",
};

interface Props {
  open: boolean;
  onClose: () => void;
  projectToken: string | null;
  finishDate?: string | null; 
}

const PAGE_SIZE = 5;
const OBS_TYPE_CONTRACT = 2; 

export function ContractingObservationsModal({ open, onClose, projectToken, finishDate }: Props) {
  const { data: projectData, isLoading: loadingProject } = useProjectObservationProjectList(0, 0, "", projectToken ?? "");
  

  const { updateObservationDateMut } = useProjectObservationMutations();
  const { data: taskStateOptions = [] } = useStateTasks(); 

  const [editingDateId, setEditingDateId] = useState<number | null>(null);
  const [tempDate, setTempDate] = useState<string>("");
  const [page, setPage] = useState(0);

  const [localErrorId, setLocalErrorId] = useState<number | null>(null);
  const [localErrorMessage, setLocalErrorMessage] = useState<string>("");

  const isLoading = loadingProject;

  const historyItems = useMemo(() => {
    const items = projectData?.items ?? [];

    return items.filter((item: any) => {

        return item.obsType === OBS_TYPE_CONTRACT; 
    });
  }, [projectData]);

  const totalItems = historyItems.length;
  const totalPages = Math.max(1, Math.ceil((totalItems || 1) / PAGE_SIZE));

  const normalizedOptions = useMemo(() => {
    if (!taskStateOptions) return [];
    return taskStateOptions.map((opt: any) => ({
      ...opt,
      lineToken: opt.linkToken || opt.token || opt.stateTaskId || opt.id || opt.value, 
      stateDesc: opt.stateDesc || opt.name || opt.label,
      stateColor: opt.stateColor || opt.color,
      numPercPro: opt.numPercPro || opt.percentage || 0 
    }));
  }, [taskStateOptions]);

  const { 
    panel, 
    anchorEl, 
    currentStateId, 
    openStatus, 
    close: closePicker, 
    selectStatus 
  } = useTaskPickers(
    normalizedOptions as any[], 
    [], 
    (obsIdAsString, newStatusValue) => {
      const obsId = Number(obsIdAsString);
      const item = historyItems.find((i: any) => i.obsId === obsId);
      
      if (item) {
         const isToken = typeof newStatusValue === 'string' && isNaN(Number(newStatusValue));
         
         updateObservationDateMut.mutate({
           obsId: obsId,
           obsStatusToken: isToken ? newStatusValue : undefined,
           obsStatusId: !isToken ? Number(newStatusValue) : undefined,
           dueDate: item.dueDate 
         } as any);
      }
    },
    () => {} 
  );

  useEffect(() => {
    if (!open) {
      setPage(0);
      setEditingDateId(null);
      setLocalErrorId(null);
      setLocalErrorMessage("");
      closePicker();
    }
  }, [open, closePicker]);

  const startIndex = page * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);

  const pagedItems = useMemo(
    () => historyItems.slice(startIndex, endIndex),
    [historyItems, startIndex, endIndex]
  );

  const handleStartEditDate = (item: any) => {
    if (item.dueDate) return; 
    closePicker(); 
    setLocalErrorId(null);
    setLocalErrorMessage("");
    setEditingDateId(item.obsId);
    const dateValue = item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : "";
    setTempDate(dateValue);
  };

  const handleSaveDate = (obsId: number) => {
    const item = historyItems.find((i: any) => i.obsId === obsId);
    if (!item) return; 

    const originalDate = item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : "";
    
    if (finishDate && tempDate) {
        const limitDate = new Date(finishDate).toISOString().split('T')[0];
        if (tempDate > limitDate) {
             setLocalErrorId(obsId);
             setLocalErrorMessage(`Máximo: ${fmtDate(finishDate)}`);
             return; 
        }
    }

    if (tempDate !== originalDate) {
      updateObservationDateMut.mutate({ 
          obsId: obsId, 
          dueDate: tempDate,
          obsStatusId: item.obsStatusId 
      } as any);
    }
    setEditingDateId(null);
    setLocalErrorId(null);
    setLocalErrorMessage("");
  };

  const handleKeyDownDate = (e: React.KeyboardEvent, obsId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSaveDate(obsId);
    } else if (e.key === 'Escape') {
      setEditingDateId(null);
      setLocalErrorId(null);
      setLocalErrorMessage("");
    }
  };

  const handleOpenStatusPicker = (e: React.MouseEvent<HTMLElement>, item: any) => {
    if (item.dueDate) return;
    setEditingDateId(null);
    setLocalErrorId(null);
    setLocalErrorMessage("");
    openStatus(
      {
        tasksToken: String(item.obsId), 
        statusTasks: item.stateDesc || item.statusLabel || "Pendiente",
        stateTaskId: item.obsStatusId 
      } as any, 
      e.currentTarget
    );
  };

  if (!open) return null;

  return (
    <Modal
      title="Observaciones derivadas a Pre - Venta"
      size="2xl"
      onClose={onClose}
      footer={null}
    >
      {isLoading ? (
        <div className="p-8 flex flex-col items-center justify-center text-gray-500 gap-2">
          <Loader2 className="animate-spin text-emerald-600" size={24} />
          <span className="text-sm">Cargando información...</span>
        </div>
      ) : (
        <div className="p-4 sm:p-6"> 
          
          {totalItems > 0 ? (
            <>
              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-[50%] px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                        Detalle
                      </th>
                      <th className="w-[20%] px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                        Estado
                      </th>
                      <th className="w-[30%] px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                        Fecha Límite
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {pagedItems.map((item: any) => {
                      const label = item.stateDesc || item.statusLabel || "Pendiente";
                      
                      const rawColor = item.stateColor || "bg-gray-100 text-gray-600";
                      const displayColor = COLOR_MAP[rawColor] || rawColor;

                      const matchedOption = taskStateOptions.find((opt: any) => 
                        (opt.stateTaskId || opt.id) === item.obsStatusId
                      );
                      const progress = item.numPercPro ?? matchedOption?.numPercPro ?? 0;
                      
                      const isEditingDate = editingDateId === item.obsId;
                      const hasError = localErrorId === item.obsId;
                      const isLocked = !!item.dueDate;

                      return (
                        <Fragment key={item.obsId}>
                          <tr className="hover:bg-gray-50 transition-colors group">
                            
                            <td className="px-4 py-3 align-top">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="size-4 text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 whitespace-pre-wrap break-words">
                                    {item.obsReason}
                                  </div>
                                  <div className="mt-1 text-xs text-gray-400">
                                    Por: <span className="text-gray-600">{item.openedByName ?? "Sistema"}</span>
                                  </div>
                                </div>
                              </div>
                              {item.rejectionReason && (
                                 <div className="mt-2 ml-6 rounded bg-red-50 p-2 text-xs text-red-700 border border-red-100 flex items-start gap-1.5">
                                   <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
                                   <span><strong>Motivo:</strong> {item.rejectionReason}</span>
                                 </div>
                              )}
                            </td>

                            <td className="px-2 py-3 align-middle text-center">
                               {updateObservationDateMut.isPending && anchorEl && currentStateId === String(item.obsId) ? (
                                  <Loader2 className="size-4 animate-spin text-blue-500 mx-auto" />
                               ) : (
                                  <button 
                                      onClick={(e) => handleOpenStatusPicker(e, item)}
                                      className={`focus:outline-none transition-all ${isLocked ? 'cursor-default opacity-90' : 'hover:opacity-80 active:scale-95'}`}
                                      title={isLocked ? "Información bloqueada" : "Clic para cambiar estado"}
                                      disabled={updateObservationDateMut.isPending || isLocked} 
                                  >
                                      <StatusChip 
                                          label={label} 
                                          stateColor={displayColor}
                                          numPercPro={progress} 
                                      />
                                  </button>
                               )}
                            </td>

                            <td className="px-4 py-3 align-middle text-center">
                              {isEditingDate ? (
                                <div className="relative flex flex-col items-center gap-1">
                                  <div className="relative flex justify-center">
                                    <input 
                                      type="date"
                                      autoFocus
                                      value={tempDate}
                                      onChange={(e) => {
                                          setTempDate(e.target.value);
                                          if (localErrorId) {
                                              setLocalErrorId(null);
                                              setLocalErrorMessage("");
                                          }
                                      }}
                                      onBlur={() => handleSaveDate(item.obsId)}
                                      onKeyDown={(e) => handleKeyDownDate(e, item.obsId)}
                                      className={`w-[130px] rounded border px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-blue-500 focus:ring-blue-500'}`}
                                    />
                                    {updateObservationDateMut.isPending && !anchorEl && (
                                      <div className="absolute right-[-25px] top-1.5">
                                        <Loader2 className="size-4 animate-spin text-blue-500" />
                                      </div>
                                    )}
                                  </div>
                                  {hasError && (
                                      <span className="text-[10px] text-red-500 font-medium leading-tight animate-in fade-in slide-in-from-top-1">
                                          {localErrorMessage}
                                      </span>
                                  )}
                                </div>
                              ) : (
                                <div 
                                  onClick={() => handleStartEditDate(item)}
                                  className={`rounded py-1.5 px-2 transition-colors border border-transparent ${isLocked ? 'bg-gray-50 text-gray-500 border-gray-100 flex items-center justify-center gap-1.5' : 'cursor-pointer hover:bg-gray-100 hover:text-blue-600 hover:border-gray-200'}`}
                                  title={isLocked ? "Fecha bloqueada" : "Click para cambiar fecha"}
                                >
                                  {isLocked && <Lock className="size-3 text-gray-400" />}
                                  <span className={`text-xs ${!item.dueDate ? 'text-gray-400 italic' : 'text-gray-700 font-medium'}`}>
                                    {item.dueDate ? fmtDate(item.dueDate) : "— Asignar fecha —"}
                                  </span>
                                </div>
                              )}
                            </td>

                          </tr>
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
                    <span className="text-xs font-medium">{page + 1} / {totalPages}</span>
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
            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-100">
              <CalendarIcon className="mb-2 text-emerald-500/50" size={40} />
              <p className="text-sm font-medium text-gray-600">Sin observaciones registradas</p>
            </div>
          )}
        </div>
      )}

      <StatusPickerDialog
        open={panel === "status"}
        anchorEl={anchorEl}
        options={normalizedOptions} 
        valueId={currentStateId}
        onSelect={selectStatus}
        onClose={closePicker}
      />
    </Modal>
  );
}