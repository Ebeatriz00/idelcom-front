import { CardContentDetail } from "@/layouts";
import { cn, usePriorityState, useStateTasks } from "@/sharedKernel";
import { useMemo, useState } from "react";
import { useTasksProjectFormModal } from "@/pages/presale/tasks/hooks/useTasksProjectFormModal";
import { TasksProjectFormModal } from "@/pages/presale/tasks/components/TasksProjectFormModal";
import type { PreSaleProyectsDetailDto } from "@/application/dtos/presale/PreSaleProyectsDetail.dto";
import { useTaskPickers } from "./useTasksPickers";
import { TaskDialogs } from "./tasksDialog";
import { TasksFilters } from "./tasksFilters";
import { TasksHeader } from "./tasksHeader";
import { TasksList } from "./tasksList";
import { usePreSaleProyectsPerms } from "../../../hooks/project.perms";

// Importaciones para la invalidación de caché
import { useQueryClient } from "@tanstack/react-query";
import { qkPreSaleProyects } from "@/sharedKernel/hooks/presale/usePreSaleProyects";

type TaskItem = NonNullable<PreSaleProyectsDetailDto["tasksList"]>[number];

type Props = {
  taskList?: TaskItem[]; 
  onToggle: (id: string) => void;
  onChangeStatus: (taskToken: string, lineToken: string | null) => void;
  onChangePriority: (taskToken: string, lineToken: string | null) => void;
  onDelete?: (t: TaskItem) => void;
  projectId: number;
  opporToken?: string; 
};

export default function TasksProjectSimple({
  taskList = [],
  onToggle,
  onChangeStatus,
  onChangePriority,
  onDelete,
  opporToken 
}: Props) {
  const [open, setOpen] = useState(true);
  const queryClient = useQueryClient(); // Instancia para manejar la caché
  
  const { data: stateOptions = [] } = useStateTasks();
  const { data: priorityOptions = [] } = usePriorityState();

  const {
    open: openForm,
    editingId,
    defaultValues,
    openCreate,
    close: closeForm,
    submit, 
    saving,
    isFetching,
  } = useTasksProjectFormModal();

  const [status, setStatus] = useState<string>("Todos");
  const [owner, setOwner] = useState<string>("Todos");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const pickers = useTaskPickers(stateOptions, priorityOptions, onChangeStatus, onChangePriority);

  const filteredTasks = useMemo(() => {
    return taskList.filter((t) => {
      if (status !== "Todos" && String(t.statusTasks) !== status && String(t.endRegister) !== status) {
         if (t.statusTasks !== status) return false;
      }

      if (owner !== "Todos" && t.tasksResp !== owner) {
        return false;
      }

      if (from || to) {
        if (!t.endRegister) return false; 
        
        const d = new Date(t.endRegister);
        if (isNaN(d.getTime())) return false; 
        
        const taskDate = d.toISOString().split("T")[0];

        if (from && taskDate < from) return false;
        if (to && taskDate > to) return false;
      }

      return true;
    });
  }, [taskList, status, owner, from, to]);

  const owners = useMemo(() => {
    const set = new Set<string>();
    taskList.forEach((t) => t.tasksResp && set.add(t.tasksResp));
    return Array.from(set).sort();
  }, [taskList]);

  const { canAddTasksProject, canDeleteTasksProject } = usePreSaleProyectsPerms();

  const handleCustomSubmit = async (formData: any) => {
      const finalData = {
          ...formData,
          opporToken: opporToken, 
          projectToken: undefined 
      };      
      
      try {
          await submit(finalData); 

          await queryClient.invalidateQueries({
              queryKey: qkPreSaleProyects.all 
          });
      } catch (error) {
          console.error("Error al procesar la tarea:", error);
      }
  };

  return (
    <CardContentDetail className="p-0">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="h-1.5" style={{ background: "linear-gradient(90deg, var(--brand,#FF6F00), #FFB74D)" }} />

        <TasksHeader
          open={open}
          count={filteredTasks.length} 
          onToggle={() => setOpen((v) => !v)}
          onAdd={canAddTasksProject ? openCreate : undefined}
        />

        <div id="panel-tasks" className={cn("transition-all duration-300 overflow-hidden", open ? "max-h-[4000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none")}>
          <TasksFilters
             status={status} setStatus={setStatus} 
             owner={owner} setOwner={setOwner} 
             from={from} setFrom={setFrom} 
             to={to} setTo={setTo} 
             owners={owners} 
             stateOptions={stateOptions} 
             onAnyChange={() => {}}
          />

          <div className="p-4 bg-white min-h-[200px]">
             <TasksList 
                data={filteredTasks} 
                onToggle={onToggle}
                onOpenStatus={pickers.openStatus}
                onOpenPriority={pickers.openPriority}
                onDelete={canDeleteTasksProject ? onDelete : undefined}
             />
          </div>
        </div>
      </div>

      <TaskDialogs
        panel={pickers.panel}
        anchorEl={pickers.anchorEl}
        stateOptions={stateOptions}
        currentStateId={pickers.currentStateId}
        onSelectState={pickers.selectStatus}
        priorityOptions={priorityOptions}
        currentPriorityId={pickers.currentPriorityStateId}
        onSelectPriority={pickers.selectPriority}
        onClose={pickers.close}
      />

      <TasksProjectFormModal
        open={openForm}
        title={editingId ? "Editar Tarea" : "Nueva Tarea"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={closeForm}
        onSubmit={handleCustomSubmit}
        saving={saving}
      />
    </CardContentDetail>
  );
}