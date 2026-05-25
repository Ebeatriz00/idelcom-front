import { useMemo, useState, useEffect, Fragment } from "react";
import { Modal } from "@/layouts"; 
import { useProjectObservationHiringList, useProjectObservationMutations } from "@/sharedKernel/hooks/observations/useObservations";
import { fmtDate } from "@/sharedKernel";
import { Loader2, MessageSquare, AlertCircle, CalendarIcon, /* PlusCircle, Save */ } from "lucide-react"; // Iconos comentados
import StatusPickerDialog from "../../opportunity/components/detail/taskOpp/states/statusPickerDialog";
import { StatusChip } from "../../opportunity/components/detail/taskOpp/ui/statusChip";
import { useTaskPickers } from "../../opportunity/components/detail/taskOpp/useTaskPickers";

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
  taskStateOptions: any[]; 
  hasAlreadyDerived?: boolean;
  onObservationCreated?: () => void;
  isReadOnly?: boolean;
}

const PAGE_SIZE = 5;

export function HiringViewObservationsModal({ 
  open, 
  onClose, 
  projectToken, 
  taskStateOptions,
  // hasAlreadyDerived = false, // Comentado para evitar warning de no usado
  // onObservationCreated,      // Comentado para evitar warning de no usado
  isReadOnly = false
}: Props) {
  const { data, isLoading } = useProjectObservationHiringList(0, 0, "", projectToken ?? "");
  
  // createObservationMut comentado porque solo se usaba en la sección eliminada
  const { updateObservationDateMut /*, createObservationMut*/ } = useProjectObservationMutations();
  
  const [editingDateId, setEditingDateId] = useState<number | null>(null);
  const [tempDate, setTempDate] = useState<string>("");
  const [page, setPage] = useState(0);

  /* --- SECCIÓN COMENTADA: ESTADOS PARA DERIVAR A PRE VENTA ---
  const [addObservation, setAddObservation] = useState(false);
  const [newObsReason, setNewObsReason] = useState("");
  ------------------------------------------------------------- */

  const historyItems = useMemo(() => {
    const allItems = data?.items ?? [];
    return allItems.filter((item: any) => item.obsType === 3);
  }, [data]);

  const totalItems = historyItems.length;

  const normalizedOptions = useMemo(() => {
    if (!taskStateOptions) return [];
    return taskStateOptions.map((opt: any) => ({
      ...opt,
      id: Number(opt.stateTaskId || opt.id || opt.value),     
      value: opt.linkToken || opt.token || opt.stateTaskId || opt.id || opt.value, 
      label: opt.stateDesc || opt.name || opt.label,
      name: opt.stateDesc || opt.name || opt.label,
      color: opt.stateColor || opt.color,
      percentage: opt.numPercPro || opt.percentage || 0 
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
    normalizedOptions, 
    [], 
    (obsIdAsString, newStatusValue) => {
      const obsId = Number(obsIdAsString);
      const item = historyItems.find((i: any) => i.obsId === obsId);
      if (item) {
         const isToken = typeof newStatusValue === 'string';

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
      closePicker();
      // setAddObservation(false); // Comentado
      // setNewObsReason("");      // Comentado
    }
  }, [open, closePicker]);

  /* 
  const handleSaveNewObservation = async () => {
    if (!newObsReason.trim() || !projectToken) return;

    try {
      await createObservationMut.mutateAsync({
         opporToken: projectToken,
         obsReason: [newObsReason], 
         obsType: 2,
         obsSeverity: 1,
         obsStatusId: 4,
         affectsQuotatation: true 
      } as any);

      setNewObsReason("");
      setAddObservation(false);
      
      if (onObservationCreated) {
        onObservationCreated();
      }

    } catch (error) {
      console.error("Error al crear observación", error);
    }
  };
  ------------------------------------------------ */

  const startIndex = page * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
  const totalPages = Math.max(1, Math.ceil((totalItems || 1) / PAGE_SIZE));

  const pagedItems = useMemo(
    () => historyItems.slice(startIndex, endIndex),
    [historyItems, startIndex, endIndex]
  );

  const handleStartEditDate = (item: any) => {
    closePicker(); 
    setEditingDateId(item.obsId);
    const dateValue = item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : "";
    setTempDate(dateValue);
  };

  const handleSaveDate = (obsId: number) => {
    const item = historyItems.find((i: any) => i.obsId === obsId);
    if (!item) return; 

    const originalDate = item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : "";
    
    if (tempDate !== originalDate) {
      updateObservationDateMut.mutate({ 
          obsId: obsId, 
          dueDate: tempDate,
          obsStatusId: item.obsStatusId 
      } as any);
    }
    setEditingDateId(null);
  };

  const handleKeyDownDate = (e: React.KeyboardEvent, obsId: number) => {
    if (e.key === 'Enter') handleSaveDate(obsId);
    else if (e.key === 'Escape') setEditingDateId(null);
  };

  const handleOpenStatusPicker = (e: React.MouseEvent<HTMLElement>, item: any) => {
    setEditingDateId(null);
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
      title="Observaciones de Contratación"
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
          
          {/* --- INICIO SECCIÓN COMENTADA (Derivar a Pre Venta) --- */}
          {/*
          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                id="chk-new-obs"
                type="checkbox"
                checked={addObservation}
                disabled={hasAlreadyDerived || isReadOnly}
                onChange={(e) => {
                  setAddObservation(e.target.checked);
                  if(!e.target.checked) setNewObsReason("");
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label 
                htmlFor="chk-new-obs" 
                className={`text-sm font-medium cursor-pointer select-none flex items-center gap-1.5 ${hasAlreadyDerived ? "text-gray-400" : "text-gray-800"}`}
              >
                <PlusCircle size={16} className={hasAlreadyDerived ? "text-gray-400" : "text-blue-600"}/>
                Derivar a Pre Venta
                {hasAlreadyDerived && (
                   <span className="text-xs text-orange-600 font-semibold ml-2 bg-orange-100 px-2 py-0.5 rounded-full">
                     (Ya derivado)
                   </span>
                )}
              </label>
            </div>

            {addObservation && (
              <div className="ml-6 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <textarea
                  value={newObsReason}
                  onChange={(e) => setNewObsReason(e.target.value)}
                  placeholder="Escriba el motivo de la observación..."
                  className="w-full rounded-md border border-gray-300 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveNewObservation}
                    disabled={createObservationMut.isPending || !newObsReason.trim()}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {createObservationMut.isPending ? (
                      <Loader2 className="animate-spin size-3.5" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    {createObservationMut.isPending ? "Registrando..." : "Registrar"}
                  </button>
                </div>
              </div>
            )}
          </div>
          */}
          {/* --- FIN SECCIÓN COMENTADA --- */}

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
                      const progress = item.numPercPro ?? matchedOption?.numPercPro ?? matchedOption?.percentage ?? 0;
                      
                      const isEditingDate = editingDateId === item.obsId;

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
                                      onClick={(e) => !isReadOnly && handleOpenStatusPicker(e, item)}
                                      className={`focus:outline-none transition-all ${
                                        isReadOnly 
                                        ? "cursor-not-allowed opacity-60" 
                                        : "hover:opacity-80 active:scale-95"}`}
                                      title={isReadOnly ? "No se puede editar en estado Entregado" : "Clic para cambiar estado"}
                                      disabled={updateObservationDateMut.isPending || isReadOnly} 
                                  >
                                      <StatusChip 
                                          label={label} 
                                          stateColor={displayColor}
                                          statusProgress={progress} 
                                      />
                                  </button>
                               )}
                            </td>

                            <td className="px-4 py-3 align-middle text-center">
                              {isEditingDate ? (
                                <div className="relative flex justify-center">
                                  <input 
                                    type="date"
                                    autoFocus
                                    value={tempDate}
                                    onChange={(e) => setTempDate(e.target.value)}
                                    onBlur={() => handleSaveDate(item.obsId)}
                                    onKeyDown={(e) => handleKeyDownDate(e, item.obsId)}
                                    className="w-[130px] rounded border border-blue-500 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                  {updateObservationDateMut.isPending && !anchorEl && (
                                    <div className="absolute right-[-25px] top-1.5">
                                      <Loader2 className="size-4 animate-spin text-blue-500" />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div 
                                onClick={() => !isReadOnly && handleStartEditDate(item)}
                                className={`rounded py-1.5 px-2 border border-transparent transition-colors ${
                                  isReadOnly 
                                  ? "cursor-not-allowed opacity-60" 
                                  : "cursor-pointer hover:bg-gray-100 hover:text-blue-600 hover:border-gray-200"}`}
                                title={isReadOnly ? "No se puede editar en estado Entregado" : "Click para cambiar fecha"}
                               >
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