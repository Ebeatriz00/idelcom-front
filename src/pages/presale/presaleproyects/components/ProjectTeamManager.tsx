import { useState, useMemo } from "react";
import { Trash2, UserPlus, Users, Lock } from "lucide-react"; 
import { type UseFormSetValue } from "react-hook-form";

import { SearchSelect } from "@/layouts";
import type { OptionItem } from "@/application";
import { useWorkerProyectOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import { ProjectTeamList } from "./table/ProjectTeamList";

interface Props {
  isVisible: boolean;
  setValue: UseFormSetValue<any>;
  projectToken?: string;
  businessId?: number;
  saving?: boolean;
  disabled?: boolean;
  blockMessage?: string;
}

export function ProjectTeamManager({ 
  isVisible, 
  setValue, 
  projectToken, 
  businessId, 
  saving,
  disabled = false,
  blockMessage
}: Props) {
  
  const { data: workerResp } = useWorkerProyectOptions();
  const workerOptions = useMemo(() => workerResp?.items ?? [], [workerResp]);

  const [stagedCollaborators, setStagedCollaborators] = useState<OptionItem[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<OptionItem | null>(null);

  const handleAddCollaborator = (opt: OptionItem | null) => {
    if (!opt) { setSelectedWorker(null); return; }
    if (stagedCollaborators.find((w) => w.value === opt.value)) { setSelectedWorker(null); return; }

    const newList = [...stagedCollaborators, opt];
    setStagedCollaborators(newList);
    setSelectedWorker(null);
    setValue("assignedWorkerId", newList.map(w => Number(w.value)));
  };

  const handleRemoveCollaborator = (valueToRemove: string | number) => {
    const newList = stagedCollaborators.filter((w) => w.value !== valueToRemove);
    setStagedCollaborators(newList);
    setValue("assignedWorkerId", newList.map(w => Number(w.value)));
  };

  if (!isVisible) return null;

  return (

    <div className="relative w-full h-full flex flex-col p-4 bg-blue-50/50 border border-blue-100 rounded-xl overflow-hidden">

       {disabled && (
         <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6">
            <div className="bg-white p-3 rounded-full shadow-sm mb-3 ring-1 ring-gray-100">
                <Lock className="size-6 text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-800">Asignación Bloqueada</p>
            <p className="text-xs text-gray-500 max-w-[220px] mt-1 leading-relaxed">
               {blockMessage || "Acción no disponible."}
            </p>
         </div>
       )}

       <div className={`flex-1 flex flex-col space-y-5 ${disabled ? "opacity-20 pointer-events-none" : ""}`}>
           
           <div className="flex items-center gap-2 pb-2 border-b border-blue-100 shrink-0">
              <Users className="size-4 text-blue-600" />
              <h4 className="text-sm font-bold text-gray-800">Gestión de Equipo</h4>
           </div>

           <div className="space-y-3 shrink-0">
               <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Agregar Nuevos Colaboradores
               </label>
               <div className="min-w-0 bg-white rounded-xl shadow-sm">
                  <SearchSelect
                    useOptions={() => ({ data: { items: workerOptions } } as any)}
                    value={selectedWorker}
                    onChange={handleAddCollaborator}
                    placeholder="Buscar colaborador..."
                    pageSize={10}
                    className="w-full"
                    disabled={saving || disabled} 
                  />
               </div>

               {stagedCollaborators.length > 0 && (
                 <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <table className="min-w-full divide-y divide-gray-100">
                      <tbody className="divide-y divide-gray-100">
                        {stagedCollaborators.map((worker) => (
                          <tr key={worker.value} className="group hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs text-gray-700">
                              <div className="flex items-center gap-2">
                                <div className="size-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                   <UserPlus className="size-3" />
                                </div>
                                <span className="font-medium">{worker.label}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button type="button" onClick={() => handleRemoveCollaborator(worker.value)} className="p-1 rounded-md text-gray-400 hover:text-red-600">
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

           {projectToken && businessId && (
              <div className="flex-1 min-h-0 pt-2">
                 <ProjectTeamList projectToken={projectToken} businessId={businessId} />
              </div>
           )}
       </div>
    </div>
  );
}