import { useState } from "react";
import { Trash2, User, Pencil, Paperclip } from "lucide-react";
import { cn } from "@/sharedKernel";

import type { OptionItem } from "@/application";
import { StatusChip } from "./ui/statusChip";
import { PriorityChip } from "./ui/priorityChip";
import Swal from "sweetalert2"; // <--- Importamos SweetAlert2
import type { SubTasksResponseDto } from "@/application/dtos/subtasks/SubTasks.dto";
import { useSubTasksMutations } from "@/sharedKernel/hooks/subtasks/useSubTasks";

const formatDateLong = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' });
};

type Props = {
    subTask: SubTasksResponseDto;
    workerOptions: OptionItem[];
    priorityOptions: OptionItem[];
    stateOptions: any[];
    onOpenPriority: (st: SubTasksResponseDto, anchor: HTMLElement) => void;
    onOpenStatus: (st: SubTasksResponseDto, anchor: HTMLElement) => void; 
    onUpdate?: (task: any, changes: any) => void;
    onDelete?: (t: any) => void;
    projectEndDate?: string | Date; 
};

export function SubTaskRow({ 
    subTask, 
    workerOptions, 
    priorityOptions, 
    stateOptions, 
    onOpenPriority, 
    onOpenStatus,
    onUpdate, 
    onDelete,
    projectEndDate 
}: Props) {
    const { updateMut, deleteMut } = useSubTasksMutations();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(subTask.title);

    const handleUpdate = (changes: Partial<any>) => {
        if (onUpdate) {
            const mappedChanges = {
                ...changes,
                titleTasks: changes.title,      
                endRegister: changes.endDate     
            };
            onUpdate(subTask, mappedChanges);
        } else {
            updateMut.mutate({
                linkToken: subTask.linkToken,
                title: changes.title ?? subTask.title,
                description: subTask.description ?? "-",
                workerId: changes.workerId ?? subTask.workerId ?? 0,
                priorityStateId: changes.priorityStateId ?? subTask.priorityStateId ?? 0,
                stateTaskId: changes.stateTaskId ?? subTask.stateTaskId ?? 0,
                endDate: changes.endDate ?? subTask.endDate,
                time: subTask.time ?? "09:00:00",
            });
        }
    };

    const saveTitle = () => {
        if (titleValue.trim() !== subTask.title && titleValue.trim() !== "") {
            handleUpdate({ title: titleValue });
        }
        setIsEditingTitle(false);
    };

    const handleDelete = () => {
        Swal.fire({
            title: "¿Eliminar sub-tarea?",
            text: "No podrás deshacer esta acción.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#10B981", 
            cancelButtonColor: "#EF4444",  
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            reverseButtons: true, 
            focusCancel: true
        }).then((result) => {
            if (result.isConfirmed) {
                if (onDelete) {
                    onDelete(subTask);
                } else {
                    deleteMut.mutate(subTask.linkToken);
                }
            }
        });
    };

    // ... lógica de visualización ...
    let stateOpt = stateOptions.find(o => {
        const optId = o.stateTaskId || o.id || o.value; 
        return Number(optId) === subTask.stateTaskId;
    });
    
    if (!stateOpt && subTask.stateTaskDescription) {
        stateOpt = stateOptions.find(o => 
            (o.label || o.stateDesc || "").trim().toLowerCase() === subTask.stateTaskDescription.trim().toLowerCase()
        );
    }

    const stateColor = stateOpt?.stateColor || "bg-gray-400";
    const percentage = stateOpt?.numPercPro ?? 0;
    const labelState = stateOpt?.label || stateOpt?.stateDesc || subTask.stateTaskDescription || "Pendiente";

    const priorityOption = priorityOptions.find(o => Number(o.value) === subTask.priorityStateId);
    const priorityColor = (priorityOption as any)?.color;
    
    const isDone = labelState.toLowerCase().includes("completad");

    return (
        <div className="group/sub grid grid-cols-[1fr_220px_120px_200px] gap-4 items-center px-3 py-1 text-sm border-b border-gray-100 bg-gray-50/40 hover:bg-gray-50 transition-colors">
            
            <div className="flex items-center gap-3 overflow-hidden pl-12 relative">
                
                <button 
                    onClick={(e) => onOpenStatus(subTask, e.currentTarget)}
                    className="flex-shrink-0 scale-75 origin-left opacity-80 focus:outline-none hover:opacity-100 transition-opacity"
                    title={`Estado: ${labelState} (${percentage}%)`}
                >
                      <StatusChip 
                        label={labelState} 
                        stateColor={stateColor} 
                        numPercPro={percentage}
                        onlyIcon={true} 
                      />
                </button>

                <div className="flex-1 min-w-0 relative flex items-center gap-2">
                    {isEditingTitle ? (
                        <div className="flex items-center gap-1 w-full">
                            <input 
                                autoFocus
                                value={titleValue} 
                                onChange={(e) => setTitleValue(e.target.value)} 
                                onBlur={saveTitle}
                                onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                                className="w-full px-2 py-0.5 text-xs border border-blue-500 rounded focus:outline-none bg-white shadow-sm" 
                            />
                        </div>
                    ) : (
                        <>
                            <span 
                                className={cn("font-medium text-gray-600 truncate cursor-pointer hover:text-blue-600 text-xs", isDone && "line-through text-gray-400")} 
                                onClick={() => setIsEditingTitle(true)}
                                title={subTask.title}
                            >
                                {subTask.title}
                            </span>
                            <button onClick={() => setIsEditingTitle(true)} className="text-gray-300 hover:text-blue-600 opacity-0 group-hover/sub:opacity-100 transition-all">
                                <Pencil size={10} />
                            </button>
                            <button onClick={() => setIsEditingTitle(true)} className="text-gray-300 hover:text-blue-600 opacity-0 group-hover/sub:opacity-100 transition-all">
                                <Paperclip size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center">
                 <div className="relative w-full group/select">
                    <select 
                        value={subTask.workerId || 0} 
                        onChange={(e) => handleUpdate({ workerId: Number(e.target.value) })}
                        className={cn("w-full appearance-none bg-transparent rounded px-2 py-1 pr-6 text-xs cursor-pointer truncate transition-colors outline-none", subTask.workerId ? "text-gray-600" : "text-gray-400 hover:text-gray-600")}
                    >
                        <option value={0}>- Sin Asignar -</option>
                        {workerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <User className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-gray-300 pointer-events-none" />
                 </div>
            </div>

            <div className="flex items-center justify-start"> 
                <div className="w-[110px]"> 
                    <input 
                        type="date" 
                        value={subTask.endDate ? String(subTask.endDate).split("T")[0] : ""} 
                        onChange={(e) => {
                            const val = e.target.value;
                            if (projectEndDate && val) {
                                const limitStr = String(projectEndDate).split("T")[0];
                                
                                if (val > limitStr) {
                                    const niceDate = formatDateLong(limitStr);
                                    
                                    Swal.fire({
                                        title: "Fecha fuera de rango",
                                        html: `El proyecto finaliza el <b>${niceDate}</b>.<br/>No puedes programar sub-tareas después de esa fecha.`,
                                        icon: "warning",
                                        confirmButtonColor: "#EF4444",
                                        confirmButtonText: "Entendido",
                                        focusConfirm: true,
                                        customClass: { popup: "rounded-2xl font-sans" }
                                    });
                                    
                                    e.target.value = subTask.endDate ? String(subTask.endDate).split("T")[0] : "";
                                    return;
                                }
                            }

                            handleUpdate({ endDate: val });
                        }}
                        className="w-full bg-transparent rounded px-2 py-1 text-xs cursor-pointer outline-none text-gray-500 hover:text-gray-800 hover:bg-white hover:border hover:border-gray-200 focus:ring-1 focus:ring-blue-500 transition-all border border-transparent" 
                    />
                </div>
            </div>

            <div className="flex items-center justify-between gap-1 pl-2 pr-1">
                <div className="relative group/prio">
                    <button 
                        onClick={(e) => onOpenPriority(subTask, e.currentTarget)}
                        className="focus:outline-none hover:bg-gray-200 rounded p-0.5 transition-colors"
                        title="Cambiar prioridad"
                    >
                        <PriorityChip desc={subTask.priorityStateDescription} color={priorityColor} />
                    </button>
                </div>

                <button 
                    onClick={handleDelete} 
                    className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover/sub:opacity-100 transition-all"
                    title="Eliminar Sub-tarea"
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    );
}