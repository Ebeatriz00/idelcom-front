import { useState, useEffect } from "react"; 
import { Trash2, Plus, MessageSquare, CheckCircle2, Circle, AlertCircle, Info, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  type Control,
  type FieldValues,
  type Path,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { useProjectObservationList } from "@/sharedKernel/hooks/observations/useObservations";
import { fmtDate } from "@/sharedKernel";

interface Props<T extends FieldValues> {
  isVisible: boolean;
  value: string[];
  setValue: UseFormSetValue<T>;
  control: Control<T>;
  error?: string; 
  disabled?: boolean;
  projectToken?: string;
}

export function ProjectObservationStager<T extends FieldValues>({ 
  isVisible, 
  value = [], 
  setValue, 
  control,
  error,
  disabled,
  projectToken
}: Props<T>) {
  
  const [currentReason, setCurrentReason] = useState("");
  const [localError, setLocalError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const currentSeverity = useWatch({
    control,
    name: "obsSeverity" as Path<T>,
  }); 

  const ID_URGENTE = 1;
  const ID_NORMAL = 3;
  const OBS_TYPE_GENERAL = 1;

  const { data: historyData, isLoading } = useProjectObservationList(0, 0, "", projectToken ?? "");
  
  const rawItems = historyData?.items ?? [];
  const validHistoryItems = rawItems.filter((obs: any) => 
      obs.obsType === OBS_TYPE_GENERAL && 
      obs.typeObsEconomic == null
  );

  const historyHasUrgent = validHistoryItems.some((obs: any) => obs.obsSeverity === ID_URGENTE);
  const historyHasNormal = validHistoryItems.some((obs: any) => obs.obsSeverity === ID_NORMAL);

  const stagedHasItems = value.length > 0;

  
  const isLockedToUrgent = historyHasUrgent || (stagedHasItems && currentSeverity === ID_URGENTE);
  const isLockedToNormal = (historyHasNormal && !historyHasUrgent) || (stagedHasItems && currentSeverity === ID_NORMAL);

  useEffect(() => {
    if (isLoading) return;

    if (historyHasUrgent && currentSeverity !== ID_URGENTE) {
        setValue("obsSeverity" as Path<T>, ID_URGENTE as any);
    }
    else if (historyHasNormal && !historyHasUrgent && currentSeverity !== ID_NORMAL) {
        setValue("obsSeverity" as Path<T>, ID_NORMAL as any);
    }
    else if (!historyHasUrgent && !historyHasNormal && !currentSeverity) {
        setValue("obsSeverity" as Path<T>, ID_NORMAL as any);
    }
  }, [historyHasUrgent, historyHasNormal, currentSeverity, setValue, isLoading]);

  const handleAdd = () => {
    if (!currentReason.trim()) {
        setLocalError("Debe escribir un motivo para agregarlo.");
        return;
    }
    
    setLocalError("");
    
    const newList = [...value, currentReason.trim()];
    setValue("obsReason" as Path<T>, newList as any, { shouldValidate: true });
    setCurrentReason(""); 
  };

  const handleRemoveStaged = (indexToRemove: number) => {
    const newList = value.filter((_, index) => index !== indexToRemove);
    setValue("obsReason" as Path<T>, newList as any, { shouldValidate: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleSeverityChange = (newSeverity: number) => {
    if (newSeverity === ID_NORMAL && isLockedToUrgent) return;
    if (newSeverity === ID_URGENTE && isLockedToNormal) return;
    
    setValue("obsSeverity" as Path<T>, newSeverity as any);
  };

  const totalItems = validHistoryItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentHistoryItems = validHistoryItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPrev = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };
  const goToNext = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };

  if (!isVisible) return null;

  return (
    <div className="relative p-4 bg-orange-50/50 border border-orange-100 rounded-xl space-y-5 h-full flex flex-col">
       
       <div className="flex items-center gap-2 pb-2 border-b border-orange-100 shrink-0">
          <MessageSquare className="size-4 text-orange-600" />
          <h4 className="text-sm font-bold text-gray-800">Gestión de Observaciones</h4>
       </div>

       <div className="space-y-3 shrink-0">
           <div className="flex justify-between items-center">
             <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Agregar Nueva Observación
             </label>
             {isLockedToUrgent && (
                 <span className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                     <LockIconMini /> Solo Urgente
                 </span>
             )}
             {isLockedToNormal && (
                 <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                     <LockIconMini /> Solo Normal
                 </span>
             )}
           </div>

           <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => handleSeverityChange(ID_NORMAL)}
                disabled={isLockedToUrgent} 
                className={`
                    flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all
                    ${currentSeverity === ID_NORMAL 
                        ? "bg-white border-blue-500 ring-1 ring-blue-500 text-blue-700 shadow-sm" 
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
                    ${isLockedToUrgent ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400" : ""}
                `}
              >
                {currentSeverity === ID_NORMAL ? <CheckCircle2 size={14} /> : <Circle size={14} />} Normal
              </button>
              
              <button 
                type="button" 
                onClick={() => handleSeverityChange(ID_URGENTE)} 
                disabled={isLockedToNormal} 
                className={`
                    flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all
                    ${currentSeverity === ID_URGENTE 
                        ? "bg-white border-red-500 ring-1 ring-red-500 text-red-700 shadow-sm" 
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
                    ${isLockedToNormal ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400" : ""}
                `}
              >
                {currentSeverity === ID_URGENTE ? <CheckCircle2 size={14} /> : <Circle size={14} />} Urgente
              </button>
           </div>

           <div className="flex gap-2 relative">
              <input
                type="text"
                value={currentReason}
                onChange={(e) => {
                    setCurrentReason(e.target.value);
                    if (localError) setLocalError(""); 
                }}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder={currentSeverity === ID_URGENTE ? "Motivo URGENTE requerido..." : "Escriba una observación..."}
                className={`flex-1 block w-full rounded-md border px-3 py-2.5 text-sm shadow-sm focus:ring-1 bg-white disabled:bg-gray-50
                    ${localError ? "border-red-300 focus:border-red-500 focus:ring-red-500 placeholder:text-red-300" : "border-gray-300 focus:border-orange-500 focus:ring-orange-500 placeholder:text-gray-400"}
                `}
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={disabled} 
                className="absolute right-1.5 top-1.5 p-1.5 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 disabled:opacity-50 transition-colors"
                title="Agregar"
              >
                <Plus className="size-5" />
              </button>
           </div>
           
           {(localError || error) && (
               <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">
                   {localError || error}
               </p>
           )}

           {value.length > 0 && (
             <div className="border border-orange-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-100">
                  <tbody className="divide-y divide-gray-100">
                    {value.map((reason, index) => (
                      <tr key={index} className="group hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-700 break-words">
                           <span className="font-bold text-orange-500 mr-2">•</span>{reason}
                        </td>
                        <td className="px-3 py-2 text-right w-10 align-top">
                          <button type="button" onClick={() => handleRemoveStaged(index)} className="text-gray-400 hover:text-red-600 p-1 rounded">
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           )}
       </div>

       {projectToken && <hr className="border-orange-200/60 border-dashed" />}

       {projectToken && (
         <div className="flex-1 flex flex-col min-h-0">
             <div className="flex justify-between items-center mb-2 shrink-0">
                 <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                   Historial ({totalItems})
                 </h4>
             </div>

             <div className="flex-1 flex flex-col justify-between">
                 {isLoading ? (
                   <div className="text-xs text-gray-400 text-center py-4">Cargando...</div>
                 ) : totalItems === 0 ? (
                   <div className="text-xs text-gray-400 italic text-center py-8 bg-white/50 rounded-lg border border-dashed border-orange-200">
                      No hay observaciones registradas.
                   </div>
                 ) : (
                   <>
                       <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mb-2">
                          <table className="min-w-full divide-y divide-gray-100">
                            <tbody className="divide-y divide-gray-100">
                              {currentHistoryItems.map((obs: any) => {
                                const isUrgent = obs.obsSeverity === 1;
                                return (
                                  <tr key={obs.obsId} className="hover:bg-gray-50 transition-colors">
                                     <td className="px-3 py-2 align-top w-16">
                                        <div className={`flex items-center justify-center size-6 rounded-full border ${isUrgent ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`} title={isUrgent ? "Urgente" : "Normal"}>
                                            {isUrgent ? <AlertCircle size={12}/> : <Info size={12}/>}
                                        </div>
                                     </td>
                                     <td className="px-2 py-2 text-xs text-gray-700">
                                        <div className="whitespace-pre-wrap leading-snug break-words">{obs.obsReason}</div>
                                        <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                                            <span className="flex items-center gap-1"><Calendar size={9} /> {fmtDate(obs.openedAt)}</span>
                                            <span className="font-medium uppercase">• {obs.openedByName ?? "Sistema"}</span>
                                        </div>
                                     </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                       </div>

                       {totalItems > ITEMS_PER_PAGE && (
                           <div className="flex items-center justify-between px-1 pt-1 border-t border-orange-100/50">
                               <div className="text-[10px] text-gray-500 font-medium">
                                   Página {currentPage} de {totalPages}
                               </div>
                               <div className="flex gap-1">
                                   <button type="button" onClick={goToPrev} disabled={currentPage === 1} className="p-1 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all border border-transparent hover:border-gray-200">
                                           <ChevronLeft size={14} className="text-gray-600"/>
                                   </button>
                                   <button type="button" onClick={goToNext} disabled={currentPage === totalPages} className="p-1 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all border border-transparent hover:border-gray-200">
                                           <ChevronRight size={14} className="text-gray-600"/>
                                   </button>
                               </div>
                           </div>
                       )}
                   </>
                 )}
             </div>
         </div>
       )}
    </div>
  );
}

function LockIconMini() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    )
}
