import { useState } from "react";
import { ChevronDown, ChevronRight, PieChart, ArrowDown, PlusCircle, Plus } from "lucide-react";
import { cn } from "@/sharedKernel";
import type { OptionItem } from "@/application";
import { TaskRowInline } from "./detail/taskProject/taskRowInline";
import { TaskColumnFooter } from "./detail/taskProject/taskColumnFooter"; 
import { SubTasksList } from "./detail/taskProject/SubTasksList";

type Props = {
  stateName: string;
  headerColors: { bg: string; text: string; border: string }; 
  stateId?: number; 
  tasks: any[]; 
  percentage?: number; 
  workerOptions: OptionItem[]; 
  priorityOptions: OptionItem[];
  stateOptions: any[]; 
  onUpdateTask: (task: any, changes: any) => void;
  onQuickCreate: (title: string, stateId: number, workerId?: number, date?: Date, priorityId?: number) => void;
  onQuickCreateSubTask?: (parentToken: string, title: string, stateId: number, workerId?: number, date?: Date, priorityId?: number) => void;
  isOpenDefault?: boolean;
  onAddTask: (stateId?: number) => void;
  onOpenStatus: (t: any, el: HTMLElement) => void;
  onOpenPriority: (t: any, el: HTMLElement) => void;
  onOpenFiles?: (t: any) => void; // Propiedad añadida en el tipo
  onDelete?: (t: any) => void;
  projectEndDate?: string | Date;
};

const textToBg = (textClass: string) => {
    if (!textClass) return "bg-gray-500";
    return textClass.replace("text-", "bg-");
};

export function TaskGroup({
  stateName,
  headerColors,
  stateId,
  tasks,
  percentage = 0, 
  workerOptions,
  priorityOptions,
  stateOptions,
  onUpdateTask,
  onQuickCreate, 
  onQuickCreateSubTask,
  isOpenDefault = true,
  onOpenStatus,
  onOpenPriority,
  onOpenFiles, // Destructuración de la nueva propiedad
  onDelete,
  projectEndDate 
}: Props) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const badgeBgColor = textToBg(headerColors.text);
  const [activeSubTaskParent, setActiveSubTaskParent] = useState<string | null>(null);
  
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  return (
    <div className="mb-8"> 
      <div className="flex items-center gap-3 mb-2 group select-none pl-1">
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-sm transition-colors cursor-default", badgeBgColor)}>
          <PieChart size={13} className="text-white/90 fill-white/20" strokeWidth={2.5} />
          <span className="uppercase tracking-wide">{stateName}</span>
        </div>

        <span className="text-xs text-gray-400 font-medium ml-1">{tasks.length}</span>
        
        <button 
            onClick={() => setIsCreatingTask(true)} 
            className="text-gray-300 hover:text-blue-600 p-1 rounded hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
            title="Crear tarea"
        >
             <Plus size={18} />
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col pl-0 border-l border-transparent"> 
            
            <div className="grid grid-cols-[1fr_220px_120px_200px] gap-4 items-center px-3 py-1 border-b border-gray-200 mb-1 group/header">
                <div className="text-xs text-gray-400 font-medium pl-2 group-hover/header:text-gray-600 transition-colors">Nombre</div>
                <div className="text-xs text-gray-400 font-medium pl-2 group-hover/header:text-gray-600 transition-colors">Persona asignada</div>
                <div className="text-xs text-gray-400 font-medium flex items-center gap-1 justify-start pl-2 group-hover/header:text-gray-600 transition-colors">Fecha límite <ArrowDown size={10} className="text-transparent group-hover/header:text-blue-500 transition-all" /></div>
                <div className="flex items-center justify-between text-xs text-gray-400 font-medium group-hover/header:text-gray-600 transition-colors pl-2 pr-1"><span>Prioridad</span><PlusCircle size={14} className="text-transparent group-hover/header:text-gray-400 cursor-pointer hover:!text-gray-600 transition-all"/></div>
            </div>

            {tasks.length > 0 && (
              <div className="flex flex-col">
                {tasks.map((task) => (
                    <div key={task.tasksToken} className="flex flex-col">
                        <TaskRowInline 
                            t={task} 
                            workerOptions={workerOptions} 
                            priorityOptions={priorityOptions} 
                            onUpdate={onUpdateTask} 
                            onToggle={() => {}} 
                            onOpenStatus={onOpenStatus} 
                            onOpenPriority={onOpenPriority}
                            onOpenFiles={onOpenFiles} // Pasar la propiedad al componente hijo
                            onDelete={onDelete}
                            onAddSubTask={(t) => setActiveSubTaskParent(activeSubTaskParent === t.tasksToken ? null : t.tasksToken)}
                            projectEndDate={projectEndDate}
                        />
                        
                        <SubTasksList 
                            parentToken={task.tasksToken} 
                            workerOptions={workerOptions} 
                            priorityOptions={priorityOptions} 
                            stateOptions={stateOptions}
                            onUpdate={onUpdateTask}
                            onOpenStatus={onOpenStatus}
                            onOpenPriority={onOpenPriority}
                            onDelete={onDelete}
                            projectEndDate={projectEndDate}
                        />

                        {activeSubTaskParent === task.tasksToken && (
                            <div className="pl-2 pr-4 md:pr-12 py-2 animate-in slide-in-from-top-2 duration-200 w-full box-border">
                                <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1 ml-1">
                                    Nueva Sub-tarea para: <span className="text-gray-600">{task.titleTasks}</span>
                                </p>
                                <div className="w-full relative">
                                    <TaskColumnFooter 
                                        stateId={stateId ?? 0} workerOptions={workerOptions} priorityOptions={priorityOptions} indicatorColor={headerColors.text} initialOpen={true} isSubtask={true}
                                        onClose={() => setActiveSubTaskParent(null)}
                                        onSave={(title, sId, wId, d, pId) => {
                                            if (onQuickCreateSubTask) onQuickCreateSubTask(task.tasksToken, title, sId, wId, d, pId);
                                            setActiveSubTaskParent(null);
                                        }}
                                        projectEndDate={projectEndDate} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
              </div>
            )}

            <div className="pl-0 mt-1"> 
                <TaskColumnFooter 
                    stateId={stateId ?? 0}
                    workerOptions={workerOptions}
                    priorityOptions={priorityOptions}
                    indicatorColor={headerColors.text} 
                    percentage={percentage}
                    onSave={onQuickCreate} 
                    isOpenExternal={isCreatingTask} 
                    onClose={() => setIsCreatingTask(false)}
                    projectEndDate={projectEndDate}
                />
            </div>
        </div>
      )}
    </div>
  );
}