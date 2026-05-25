import { useState, useRef, useMemo, useEffect } from "react";
import { 
  Calendar, 
  GitBranch, 
  ChevronDown, 
  ChevronRight, 
  User,
  Pencil
} from "lucide-react";
import { cn, showApiError } from "@/sharedKernel";
import { useSubTasksList } from "@/sharedKernel/hooks/subtasks/useSubTasks";
import type { OptionItem } from "@/application";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PriorityChip } from "./ui/priorityChip";
import PriorityPickerDialog from "./states/priorityPickerDialog";
import { updateSubTask } from "@/infrastructure/api-clients/subtask/subTask.client";

export type PriorityOption = {
    value: string | number;
    label: string;
    color?: string;
    [key: string]: any;
};

const getVisualDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = String(dateStr).split("T")[0].split("-");
    if (parts.length !== 3) return "";
    const localDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(localDate);
};

function SubTaskItem({ 
    sub, 
    workerOptions, 
    priorityOptions, 
    onOpenPriority, 
    parentTaskToken,
    parentTaskTitle
}: { 
    sub: any; 
    workerOptions: OptionItem[]; 
    priorityOptions: PriorityOption[]; 
    onOpenPriority: any; 
    parentTaskToken: string;
    parentTaskTitle: string;
}) {
    const queryClient = useQueryClient();
    const dateInputRef = useRef<HTMLInputElement>(null);

    const [localDate, setLocalDate] = useState(sub.endDate ? String(sub.endDate).split("T")[0] : "");
    const [localWorkerId, setLocalWorkerId] = useState(sub.workerId ? Number(sub.workerId) : 0);

    useEffect(() => { setLocalDate(sub.endDate ? String(sub.endDate).split("T")[0] : ""); }, [sub.endDate]);
    useEffect(() => { setLocalWorkerId(sub.workerId ? Number(sub.workerId) : 0); }, [sub.workerId]);

    const { mutateAsync: updateSubInline } = useMutation({
        mutationFn: (data: any) => updateSubTask(data), 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subtasks", parentTaskToken] }); 
            queryClient.invalidateQueries({ queryKey: ["tasksproject"] });
        },
        onError: (error) => showApiError(error)
    });

    const handleUpdate = async (changes: any) => {
        try {
            const payload = {
                linkToken: sub.linkToken,
                title: changes.title ?? sub.title,
                description: sub.description || "-", 
                workerId: changes.workerId ?? localWorkerId,
                priorityStateId: changes.priorityStateId ?? sub.priorityStateId ?? 0,
                stateTaskId: changes.stateTaskId ?? sub.stateTaskId ?? 0,
                endDate: changes.endDate ?? localDate,
                time: sub.time || "09:00:00"
            };
            await updateSubInline(payload);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        try { dateInputRef.current?.showPicker(); } catch { dateInputRef.current?.focus(); }
    };
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalDate(e.target.value); 
    };
    const handleDateBlur = () => {
        const original = sub.endDate ? String(sub.endDate).split("T")[0] : "";
        if (localDate !== original) handleUpdate({ endDate: localDate }); 
    };

    const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocalWorkerId(Number(e.target.value)); 
    };
    const handleWorkerBlur = () => {
        if (localWorkerId !== (sub.workerId ? Number(sub.workerId) : 0)) {
            handleUpdate({ workerId: localWorkerId });
        }
    };

    const selectedWorkerOption = (workerOptions || []).find((opt: any) => Number(opt.value) === localWorkerId);
    const displayName = selectedWorkerOption?.label || sub.workerName || "";
    const initials = displayName ? displayName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() : null;
    
    const currentPriorityId = sub.priorityStateId ? Number(sub.priorityStateId) : 0;
    
    let priorityOption = (priorityOptions || []).find((opt) => Number(opt.value) === currentPriorityId);
    
    if (!priorityOption && sub.priorityDesc) {
        priorityOption = priorityOptions.find(opt => opt.label.trim().toLowerCase() === sub.priorityDesc.trim().toLowerCase());
    }

    const priorityLabel = priorityOption?.label || sub.priorityDesc || "Normal";
    const priorityColor = priorityOption?.color || sub.priorityColor || "#9ca3af"; 

    const hasDate = !!localDate;
    const isOverdue = hasDate && localDate < new Date().toISOString().split("T")[0];

    return (
        <div className="p-2.5 rounded-xl border flex flex-col gap-1.5 group/sub relative transition-all hover:shadow-md bg-white border-gray-200 shadow-sm">
            <div className="w-full mb-0.5">
                 <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide truncate block">
                    {parentTaskTitle}
                 </span>
            </div>

            <div className="w-full">
                <span className="text-xs font-semibold leading-snug break-words text-gray-700">
                    {sub.title}
                </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
                <div className="relative group/subavatar cursor-pointer shrink-0" title={displayName || "Asignar responsable"}>
                    {initials ? (
                         <div className="size-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-white shadow-sm ring-1 ring-gray-100 uppercase">
                            {initials}
                        </div>
                    ) : (
                        <div className="size-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center border border-white shadow-sm ring-1 ring-gray-100 hover:bg-gray-200 hover:text-gray-600">
                             <User size={14} />
                        </div>
                    )}
                     <select 
                        value={localWorkerId} 
                        onChange={handleWorkerChange}
                        onBlur={handleWorkerBlur} 
                        onClick={(e) => e.stopPropagation()} 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    >
                        <option value={0} className="text-gray-900">- Sin Asignar -</option>
                        {workerOptions.map((opt: any) => (
                            <option key={opt.value} value={opt.value} className="text-gray-900">{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div onClick={handleDateClick} className={cn(
                    "relative flex items-center justify-center rounded-lg border bg-white transition-colors cursor-pointer select-none",
                    hasDate ? "h-7 px-2 gap-1.5 text-[11px] font-medium" : "size-7 text-gray-400 hover:text-gray-600 hover:border-gray-300", 
                    isOverdue ? "border-red-200 text-red-600 bg-red-50" : "border-gray-200 text-gray-600"
                )} title={hasDate ? "Cambiar fecha" : "Asignar fecha"}>
                    <Calendar size={12} className={isOverdue ? "text-red-600" : "text-current"} />
                    {hasDate && <span>{getVisualDate(localDate)}</span>}
                    <input 
                        ref={dateInputRef} 
                        type="date" 
                        value={localDate} 
                        onChange={handleDateChange} 
                        onBlur={handleDateBlur} 
                        onClick={(e) => e.stopPropagation()} 
                        className="absolute inset-0 opacity-0 w-full h-full" 
                        style={{ visibility: 'hidden', position: 'absolute' }} 
                    />
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenPriority(sub, e.currentTarget);
                    }}
                    className="focus:outline-none"
                    title={priorityLabel || "Cambiar prioridad"}
                >
                    <PriorityChip desc={priorityLabel} color={priorityColor} />
                </button>
            </div>
        </div>
    );
}

type Props = {
  task: any;
  workerOptions: OptionItem[];
  priorityOptions: PriorityOption[];
  statusColor?: string;
  onClick?: () => void;
  onUpdate: (task: any, changes: any) => void;
  onOpenPriority: (task: any, anchor: HTMLElement, optimisticCallback?: (id: number) => void) => void;};

export function KanbanTaskCard({ 
  task, 
  workerOptions, 
  priorityOptions, 
  onClick, 
  onUpdate, 
  onOpenPriority 
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const initialDate = task.endRegister ? String(task.endRegister).split("T")[0] : "";
  const [localDate, setLocalDate] = useState(initialDate);
  const [localWorkerId, setLocalWorkerId] = useState(task.workerId ? Number(task.workerId) : 0);

  useEffect(() => { setLocalDate(task.endRegister ? String(task.endRegister).split("T")[0] : ""); }, [task.endRegister]);
  useEffect(() => { setLocalWorkerId(task.workerId ? Number(task.workerId) : 0); }, [task.workerId]);
  
  const subTaskPriorityOptions = useMemo(() => {
      return (priorityOptions || []).map((opt) => ({
          linkToken: String(opt.value), 
          priorityDesc: opt.label,
          color: opt.color
      }));
  }, [priorityOptions]);

  const [subTaskPicker, setSubTaskPicker] = useState<{
      open: boolean;
      anchor: HTMLElement | null;
      target: any | null;
  }>({ open: false, anchor: null, target: null });

  const { data: subTasks = [], isLoading } = useSubTasksList(task.tasksToken);
  
  const { mutateAsync: updateSubInline } = useMutation({
      mutationFn: (data: any) => updateSubTask(data), 
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["subtasks", task.tasksToken] }); 
          queryClient.invalidateQueries({ queryKey: ["tasksproject"] });
      },
      onError: (error) => showApiError(error)
  });

  const subTaskCount = subTasks.length;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };


  const handleDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    try { dateInputRef.current?.showPicker(); } catch { dateInputRef.current?.focus(); }
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalDate(e.target.value);
  };
  const handleDateBlur = () => {
      const original = task.endRegister ? String(task.endRegister).split("T")[0] : "";
      if (localDate !== original) onUpdate(task, { endRegister: localDate });
  };

  const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLocalWorkerId(Number(e.target.value)); 
  };
  const handleWorkerBlur = () => {
      if (localWorkerId !== (task.workerId ? Number(task.workerId) : 0)) {
          onUpdate(task, { workerId: localWorkerId });
      }
  };
  const selectedWorkerOption = (workerOptions || []).find((opt: any) => Number(opt.value) === localWorkerId);
  const displayName = selectedWorkerOption?.label || task.tasksResp || "";
  const initials = displayName ? displayName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() : null;

  const currentPriorityId = task.priorityStateId ? Number(task.priorityStateId) : 0;
  
  let priorityOption = (priorityOptions || []).find((opt) => Number(opt.value) === currentPriorityId);

  if (!priorityOption && task.priorityDesc) {
       priorityOption = priorityOptions.find(opt => opt.label.trim().toLowerCase() === task.priorityDesc.trim().toLowerCase());
  }

  const priorityLabel = priorityOption?.label || task.priorityDesc || "Normal";
  const priorityColor = priorityOption?.color || task.priorityColor || "#9ca3af";

  const hasDate = !!localDate;
  const isOverdue = hasDate && localDate < new Date().toISOString().split("T")[0];

  const handleOpenSubTaskPriority = (sub: any, anchor: HTMLElement) => {
      setSubTaskPicker({ open: true, anchor, target: sub });
  };

  const handleSubTaskPrioritySelect = async (opt: any) => {
      const target = subTaskPicker.target;
      if (!target) return;
      const newPriorityId = opt ? Number(opt.linkToken) : 0;
      
      if (newPriorityId !== Number(target.priorityStateId)) {
          try {
            await updateSubInline({
                linkToken: target.linkToken,
                title: target.title,
                description: target.description || "-",
                workerId: target.workerId ?? 0,
                priorityStateId: newPriorityId,
                stateTaskId: target.stateTaskId ?? 0,
                endDate: target.endDate,
                time: target.time || "09:00:00"
            });
          } catch (e) {
            console.error(e);
          }
      }
      setSubTaskPicker({ open: false, anchor: null, target: null });
  };

  return (
    <div className="flex flex-col gap-1 select-none">
      
      <div className={cn(
          "bg-white rounded-xl border p-3 group transition-all relative overflow-hidden border-gray-200 hover:shadow-md",
          isOpen ? "ring-1 ring-gray-300 border-gray-300 bg-gray-50/50" : ""
      )}>
        <div className="flex justify-between items-start mb-3 gap-2">
          <h4 className="text-[13px] font-semibold leading-snug break-words line-clamp-2 cursor-default text-gray-800" title={task.titleTasks}>
            {task.titleTasks}
          </h4>
          <button className="text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1 p-1 hover:bg-gray-100 rounded cursor-pointer" onClick={(e) => { e.stopPropagation(); onClick?.(); }} title="Editar detalles">
             <Pencil size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
            <div className="relative group/avatar cursor-pointer" title={displayName || "Asignar responsable"}>
                {initials ? (
                  <div className="size-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold border border-white shadow-sm ring-1 ring-gray-100 uppercase">
                    {initials}
                  </div>
                ) : (
                   <div className="size-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center border border-white shadow-sm ring-1 ring-gray-100 hover:bg-gray-200 hover:text-gray-600">
                     <User size={14} />
                   </div>
                )}
                <select 
                    value={localWorkerId} 
                    onChange={handleWorkerChange} 
                    onBlur={handleWorkerBlur}
                    onClick={(e) => e.stopPropagation()} 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                >
                    <option value={0} className="text-gray-900">- Sin Asignar -</option>
                    {workerOptions.map(opt => <option key={opt.value} value={opt.value} className="text-gray-900">{opt.label}</option>)}
                </select>
            </div>

            <div onClick={handleDateClick} className={cn(
                "relative flex items-center justify-center rounded-lg border bg-white transition-colors cursor-pointer select-none", 
                hasDate ? "h-7 px-2 gap-1.5 text-[11px] font-medium" : "size-7 text-gray-400 hover:text-gray-600 hover:border-gray-300", 
                isOverdue ? "border-red-200 text-red-600 bg-red-50" : "border-gray-200 text-gray-600"
            )} title={hasDate ? "Cambiar fecha límite" : "Asignar fecha"}>
                <Calendar size={12} className={isOverdue ? "text-red-600" : "text-current"} />
                {hasDate && <span>{getVisualDate(localDate)}</span>}
                <input 
                    ref={dateInputRef} 
                    type="date" 
                    value={localDate} 
                    onChange={handleDateChange} 
                    onBlur={handleDateBlur} 
                    onClick={(e) => e.stopPropagation()} 
                    className="absolute inset-0 opacity-0 w-full h-full" 
                    style={{ visibility: 'hidden', position: 'absolute' }} 
                />
            </div>

            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onOpenPriority(task, e.currentTarget);
                }}
                className="focus:outline-none"
                title={priorityLabel || "Cambiar prioridad"}
            >
                <PriorityChip desc={priorityLabel} color={priorityColor} />
            </button>
        </div>

        <div className="flex items-center gap-2 pt-1 text-gray-400 hover:text-gray-700 transition-colors w-fit cursor-pointer" onClick={handleToggle}>
            <GitBranch size={14} className="rotate-180" />
            <span className="text-[11px] font-medium">{isLoading ? "..." : `${subTaskCount} subtarea${subTaskCount !== 1 ? 's' : ''}`}</span>
             {subTaskCount > 0 && <span className="text-gray-300">{isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>}
        </div>
      </div>

      {isOpen && subTaskCount > 0 && (
        <div className="ml-4 pl-3 border-l-2 border-gray-200 flex flex-col gap-2 animate-in slide-in-from-top-1 duration-200 pb-2">
           {subTasks.map((sub: any) => (
               <SubTaskItem 
                   key={sub.linkToken} 
                   sub={sub} 
                   workerOptions={workerOptions} 
                   priorityOptions={priorityOptions}
                   onOpenPriority={handleOpenSubTaskPriority} 
                   parentTaskToken={task.tasksToken}
                   parentTaskTitle={task.titleTasks}
               />
           ))}
        </div>
      )}

      <PriorityPickerDialog
          open={subTaskPicker.open}
          anchorEl={subTaskPicker.anchor}
          options={subTaskPriorityOptions as any} 
          valueId={subTaskPicker.target ? String(subTaskPicker.target.priorityStateId) : null}
          onSelect={handleSubTaskPrioritySelect}
          onClose={() => setSubTaskPicker({ ...subTaskPicker, open: false })}
          title="Cambiar prioridad de subtarea"
      />
    </div>
  );
}