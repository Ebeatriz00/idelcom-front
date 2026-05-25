import { useMemo, useEffect, useState } from "react";
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  type DropResult,
  type DroppableProvided,
  type DroppableStateSnapshot,
  type DraggableProvided,
  type DraggableStateSnapshot, 
} from "@hello-pangea/dnd";
import { 
  usePriorityState, 
  useStateTasks, 
  showApiError, 
  cn 
} from "@/sharedKernel";
import { useTasksProjectList } from "@/sharedKernel/hooks/presale/useTasksProject";
import { useWorkerOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTasksProject, createTasksProject } from "@/infrastructure";

import { TaskDialogs } from "./tasksDialog";
import { TasksProjectFormModal } from "@/pages/presale/tasks/components/TasksProjectFormModal";
import { useTasksProjectFormModal } from "@/pages/presale/tasks/hooks/useTasksProjectFormModal";
import { useTaskPickers } from "./useTasksPickers";
import { Plus, X, Check } from "lucide-react";

import { KanbanTaskCard } from "./KanbanTaskCard";

const BG_PASTEL_MAP: Record<string, string> = {
  "bg-gray-400": "bg-gray-400/20",
  "bg-blue-400": "bg-blue-400/20",
  "bg-indigo-500": "bg-indigo-500/20",
  "bg-red-500": "bg-red-500/20",
  "bg-amber-400": "bg-amber-400/20",
  "bg-orange-400": "bg-orange-400/20",
  "bg-emerald-500": "bg-emerald-500/20",
  "bg-gray-600": "bg-gray-600/20",
};

const bgToText = (bgClass?: string) => {
    if (!bgClass) return "text-gray-400";
    return bgClass.replace("bg-", "text-");
};

const bgToPastelBg = (bgClass?: string) => {
    if (!bgClass) return "bg-gray-100/50"; 
    return BG_PASTEL_MAP[bgClass] || "bg-gray-100/50";
};


const QuickAddForm = ({ 
    onCancel, 
    onSubmit 
}: { 
    onCancel: () => void; 
    onSubmit: (text: string) => void; 
}) => {
    const [text, setText] = useState("");

    const handleSubmit = () => {
        if (!text.trim()) {
            onCancel();
            return;
        }
        onSubmit(text);
        setText(""); 
    };

    return (
        <div className="bg-white p-2 rounded-lg border border-blue-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <textarea
                autoFocus
                placeholder="Escribe el nombre de la tarea..."
                className="w-full text-sm border-none outline-none focus:outline-none focus:ring-0 p-0 resize-none mb-2 text-gray-700 placeholder:text-gray-400 bg-transparent leading-relaxed"
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                    }
                    if (e.key === "Escape") onCancel();
                }}
            />
            <div className="flex items-center justify-end gap-2">
                <button 
                    onClick={onCancel}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                >
                    <X size={14} />
                </button>
                <button 
                    onClick={handleSubmit}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded flex items-center gap-1"
                >
                    Agregar <Check size={12} />
                </button>
            </div>
        </div>
    );
};

export default function TasksKanbanProject({
  opporToken,
  onChangeStatus,
  onChangePriority,
}: any) {
  
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);

  const [activeQuickAddColId, setActiveQuickAddColId] = useState<number | string | null>(null);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const { data: stateOptions = [] } = useStateTasks();
  const { data: rawPriorities = [] } = usePriorityState();
  const { data: workerResp, refetch: refetchWorkers } = useWorkerOptions();
  
  useEffect(() => { refetchWorkers(); }, [refetchWorkers]);

  const workerOptions = useMemo(() => workerResp?.items ?? [], [workerResp]);

  const priorityOptions = useMemo(() => {
    return rawPriorities.map((p: any) => ({
      value: p.priorityStateId, 
      label: p.priorityDesc,
      color: p.color 
    }));
  }, [rawPriorities]);

  const { data: apiResponse, isLoading } = useTasksProjectList(0, 500, "", opporToken);
  
  const {
    open: openForm,
    editingId,
    defaultValues,
    openCreate,
    openEdit,
    close: closeForm,
    submit: submitModal,
    saving,
    isFetching: isFetchingForm,
  } = useTasksProjectFormModal();

  const { mutateAsync: updateTaskInline } = useMutation({
    mutationFn: updateTasksProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasksproject"] });
    },
    onError: (error) => showApiError(error)
  });

  const { mutateAsync: createTaskInline } = useMutation({
    mutationFn: createTasksProject,
    onSuccess: (response: any) => {
      if (response && (response.status === 0 || response.status === false)) {
           showApiError({ response: { data: response } });
           return;
      }
      queryClient.invalidateQueries({ queryKey: ["tasksproject"] });
    },
    onError: (error) => showApiError(error)
  });

  const handleStartQuickAdd = (stateId: number | string) => {
      setActiveQuickAddColId(stateId);
  };

  const handleCancelQuickAdd = () => {
      setActiveQuickAddColId(null);
  };

  const handleConfirmQuickAdd = async (title: string, stateId: number | string) => {
      try {
          await createTaskInline({
              title: title,
              stateTaskId: Number(stateId),
              opporToken: opporToken,
              description: "-",
              workerId: 0,
              priorityStateId: 0,
              time: "09:00:00",
              endDate: new Date().toISOString().split("T")[0] // DateOnly safe
          } as any);
          
          setActiveQuickAddColId(null); 
      } catch (error) {
          console.error(error);
      }
  };

  const handleDragEnd = async (result: DropResult) => {
      const { destination, source, draggableId } = result;

      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      if (destination.droppableId !== source.droppableId) {
          const newStateId = Number(destination.droppableId);
          const taskToUpdate = mappedTaskList.find(t => t.tasksToken === draggableId);

          if (taskToUpdate) {
             try {
                 await updateTaskInline({
                     linkToken: taskToUpdate.tasksToken,
                     title: taskToUpdate.titleTasks,
                     description: taskToUpdate.description || "-",
                     workerId: taskToUpdate.workerId,
                     endDate: taskToUpdate.endRegister,
                     priorityStateId: taskToUpdate.priorityStateId,
                     stateTaskId: newStateId, 
                     time: taskToUpdate.time || "09:00:00",
                     opporToken: opporToken,
                     projectToken: null
                 } as any);
             } catch (error) {
                 console.error("Error al mover tarjeta", error);
             }
          }
      }
  };

  const handleInlineUpdate = async (task: any, changes: any) => {
      try {
          const payload = {
              linkToken: task.tasksToken,
              title: changes.titleTasks ?? task.titleTasks,
              description: task.description || "-",
              workerId: changes.workerId ?? task.workerId,
              endDate: changes.endRegister ?? task.endRegister,
              priorityStateId: changes.priorityStateId ?? task.priorityStateId,
              stateTaskId: changes.stateTaskId ?? task.stateTaskId,
              time: task.time || "09:00:00",
              opporToken: opporToken, 
              projectToken: null 
          };
          await updateTaskInline(payload as any);
      } catch (error) {
          console.error("Error inline", error);
      }
  };

  const stateColorMap = useMemo(() => {
    const map = new Map<string, string>();
    stateOptions.forEach(opt => {
        if (opt.stateDesc && opt.stateColor) {
            map.set(opt.stateDesc.trim(), opt.stateColor);
        }
    });
    return map;
  }, [stateOptions]);

  const mappedTaskList = useMemo(() => {
    if (!apiResponse?.items) return [];
    return apiResponse.items.map((item) => {
      const statusName = (item.stateTaskDescription || "").trim();
      const realBgColor = stateColorMap.get(statusName) || "bg-gray-400";
      const textColor = bgToText(realBgColor);

      return {
        tasksToken: item.linkToken ?? item.tasksId?.toString(),
        titleTasks: item.title,
        statusTasks: statusName,
        tasksResp: item.wprkerDescription,
        endRegister: item.endDate,
        priorityDesc: item.priorityStateDescription || "Normal",
        stateTaskId: item.stateTaskId,
        workerId: item.workerId ?? 0,
        priorityStateId: item.priorityStateId ?? 0,
        description: item.description,
        time: item.time,
        taskColor: textColor,
        numPercPro: item.numPercPro ?? 0,
        isDeliverable: (item.deliverableId && item.deliverableId > 0),
        stateColor: realBgColor, 
      };
    });
  }, [apiResponse, stateColorMap]);

  const groupedTasks = useMemo(() => {
    if (stateOptions.length === 0) return [];
    return stateOptions.map((stateOpt) => {
        const currentName = (stateOpt.stateDesc || "").trim();
        const tasksInGroup = mappedTaskList.filter(t => t.statusTasks === currentName);
        
        const badgeColorClass = stateOpt.stateColor || "bg-gray-500";
        const textColor = bgToText(badgeColorClass);
        const pastelBgClass = bgToPastelBg(badgeColorClass); 
        
        const realStateId = stateOpt.stateTaskId || (stateOpt as any).id || (stateOpt as any).value || 0;

        return {
            stateId: realStateId,
            stateName: currentName,
            headerColors: { bg: badgeColorClass, text: textColor, pastelBg: pastelBgClass },
            tasks: tasksInGroup,
        };
    });
  }, [mappedTaskList, stateOptions]);

  const pickers = useTaskPickers(stateOptions, rawPriorities, onChangeStatus, onChangePriority);

  if (!enabled) {
      return <div className="p-10 text-center text-gray-400">Cargando tablero...</div>;
  }

  return (
    <div className="h-full flex flex-col">
       {isLoading ? (
            <div className="p-10 text-center text-gray-400 animate-pulse">Cargando tablero...</div>
       ) : (
         <DragDropContext onDragEnd={handleDragEnd}>
           <div className="flex-1 overflow-x-auto overflow-y-hidden">
               <div className="flex h-full gap-4 pb-4 min-w-max">
                   {groupedTasks.map((group) => (
                   
                   <div 
                        key={group.stateName} 
                        className={cn(
                            "flex flex-col w-[300px] shrink-0 rounded-xl border border-gray-200/50 h-full max-h-full shadow-sm backdrop-blur-sm",
                            group.headerColors.pastelBg
                        )}
                   >
                       <div className="flex items-center justify-between p-3 pb-2">
                           <div className="flex items-center gap-2">
                               <div className={cn("px-2.5 py-1 rounded text-[11px] font-bold text-white uppercase tracking-wide shadow-sm", group.headerColors.bg)}>
                                   {group.stateName}
                               </div>
                               <span className="text-xs text-gray-600 font-semibold">{group.tasks.length}</span>
                           </div>
                           <div className="flex gap-1">
                               <button 
                                   onClick={() => openCreate({ opporToken: opporToken, stateTaskId: group.stateId })}
                                   className="text-gray-500 hover:text-gray-800 p-1.5 hover:bg-white/60 rounded-md transition-colors"
                               >
                                   <Plus size={16} />
                               </button>
                           </div>
                       </div>

                       <Droppable droppableId={String(group.stateId)}>
                           {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                               <div
                                   {...provided.droppableProps}
                                   ref={provided.innerRef}
                                   className={cn(
                                       "flex-1 overflow-y-auto px-2 pb-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent rounded-b-xl transition-colors",
                                       snapshot.isDraggingOver ? "bg-white/40" : ""
                                   )}
                               >
                                   {group.tasks.length === 0 && !snapshot.isDraggingOver && (
                                       <div className="border-2 border-dashed border-gray-300/50 rounded-xl p-6 text-center group/empty hover:border-gray-400/50 transition-colors m-2">
                                           <p className="text-xs text-gray-500 mb-2">Sin tareas</p>
                                       </div>
                                   )}

                                   {group.tasks.map((task: any, index: number) => (
                                       <Draggable 
                                           key={task.tasksToken} 
                                           draggableId={task.tasksToken} 
                                           index={index}
                                       >
                                           {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                               <div
                                                   ref={provided.innerRef}
                                                   {...provided.draggableProps}
                                                   {...provided.dragHandleProps}
                                                   style={{ ...provided.draggableProps.style }}
                                                   className={cn(snapshot.isDragging ? "opacity-90 rotate-2 scale-105 z-50" : "")}
                                               >
                                                   <KanbanTaskCard 
                                                       task={task}
                                                       workerOptions={workerOptions}
                                                       priorityOptions={priorityOptions}
                                                       onUpdate={handleInlineUpdate}
                                                       onOpenPriority={(t, anchor, cb) => pickers.openPriority(t, anchor, cb)}
                                                       onClick={() => {
                                                           if(openEdit) openEdit(task.tasksToken);
                                                       }}
                                                   />
                                               </div>
                                           )}
                                       </Draggable>
                                   ))}
                                   {provided.placeholder}
                               </div>
                           )}
                       </Droppable>

                       <div className="p-2 pt-0">
                           {activeQuickAddColId === group.stateId ? (
                               <QuickAddForm 
                                   onCancel={handleCancelQuickAdd}
                                   onSubmit={(title) => handleConfirmQuickAdd(title, group.stateId)}
                               />
                           ) : (
                               <button 
                                   onClick={() => handleStartQuickAdd(group.stateId)}
                                   className={cn(
                                       "w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-200 text-sm font-medium group",
                                       "text-gray-500 hover:text-gray-800 hover:bg-white/60"
                                   )}
                               >
                                   <Plus size={16} className="text-gray-400 group-hover:text-gray-600" />
                                   Agregar Tarea
                               </button>
                           )}
                       </div>

                   </div>
                   ))}
               </div>
           </div>
         </DragDropContext>
       )}
     
     <TaskDialogs 
       panel={pickers.panel} 
       anchorEl={pickers.anchorEl} 
       stateOptions={stateOptions} 
       currentStateId={pickers.currentStateId} 
       onSelectState={pickers.selectStatus} 
       priorityOptions={rawPriorities} 
       currentPriorityId={pickers.currentPriorityStateId} 
       onSelectPriority={pickers.selectPriority} 
       onClose={pickers.close} 
     />

     <TasksProjectFormModal 
       open={openForm} 
       title={editingId ? "Editar Tarea" : "Nueva Tarea"} 
       loadingDetail={Boolean(editingId) && isFetchingForm} 
       defaultValues={!editingId && opporToken ? { ...defaultValues, projectToken: opporToken } : defaultValues} 
       onClose={closeForm} 
       onSubmit={submitModal} 
       saving={saving} 
     />
    </div>
  );
}