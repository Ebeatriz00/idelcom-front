import { CardContentDetail } from "@/layouts";
import {
  parseYMDLocal,
  qkPreSaleProyects,
  showApiError,
  showSuccess,
  showWarning,
  toYMD,
  usePriorityState,
  useStateTasks,
} from "@/sharedKernel";
import { useTasksProjectList } from "@/sharedKernel/hooks/presale/useTasksProject";
import { useWorkerProyectOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import { useEffect, useMemo, useState } from "react";

import { createTasksProject, updateTasksProject } from "@/infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TasksProjectFormModal } from "@/pages/presale/tasks/components/TasksProjectFormModal";
import { useTasksProjectFormModal } from "@/pages/presale/tasks/hooks/useTasksProjectFormModal";
import { useSubTasksMutations } from "@/sharedKernel/hooks/subtasks/useSubTasks";
import { TaskGroup } from "../../TaskGroup";
import { TaskDialogs } from "./tasksDialog";
import { useTaskPickers } from "./useTasksPickers";
import { TaskFilesModal } from "./TaskFilesModal";

const bgToText = (bgClass?: string) => {
  if (!bgClass) return "text-gray-400";
  return bgClass.replace("bg-", "text-");
};

export default function TasksProject({
  opporToken,
  onChangeStatus,
  onChangePriority,
  onDelete,
  projectEndDate,
  projectData,
}: any) {
  const queryClient = useQueryClient();

  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const { data: stateOptions = [] } = useStateTasks();
  const { data: rawPriorities = [] } = usePriorityState();

  const priorityOptions = useMemo(() => {
    return rawPriorities.map((p: any) => ({
      value: p.priorityStateId,
      label: p.priorityDesc,
      color: p.color,
    }));
  }, [rawPriorities]);

  const { data: apiResponse, isLoading } = useTasksProjectList(
    0,
    500,
    "",
    opporToken,
  );
  const { createMut: createSubTaskMut } = useSubTasksMutations();

  const { data: workerResp, refetch: refetchWorkers } =
    useWorkerProyectOptions();
  useEffect(() => {
    refetchWorkers();
  }, [refetchWorkers]);

  const workerOptions = useMemo(() => workerResp?.items ?? [], [workerResp]);

  const {
    open: openForm,
    editingId,
    defaultValues,
    openCreate,
    close: closeForm,
    submit: submitModal,
    saving,
    isFetching: isFetchingForm,
  } = useTasksProjectFormModal();

  const { mutateAsync: updateTaskInline } = useMutation({
    mutationFn: updateTasksProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasksproject"] });
      queryClient.invalidateQueries({ queryKey: qkPreSaleProyects.all });
      showSuccess("Tarea actualizada");
    },
    onError: (error) => showApiError(error),
  });

  const { mutateAsync: createTaskInline } = useMutation({
    mutationFn: createTasksProject,
    onSuccess: (response: any) => {
      if (response && (response.status === 0 || response.status === false)) {
        showApiError({ response: { data: response } });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["tasksproject"] });
      showSuccess("Tarea creada");
    },
    onError: (error) => showApiError(error),
  });

  const stateProgressMap = useMemo(() => {
    const map = new Map<string, number>();
    stateOptions.forEach((opt) => {
      if (opt.stateDesc) {
        map.set(opt.stateDesc.trim(), (opt as any).numPercPro ?? 0);
      }
    });
    return map;
  }, [stateOptions]);

  const stateColorMap = useMemo(() => {
    const map = new Map<string, string>();
    stateOptions.forEach((opt) => {
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
      const stateProgress = stateProgressMap.get(statusName) ?? 0;
      const finalProgress = item.numPercPro ?? stateProgress;

      return {
        tasksToken: item.linkToken ?? item.tasksId?.toString(),
        tasksId: item.tasksId,
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
        numPercPro: finalProgress,
        statusProgress: finalProgress,
        isDeliverable: item.deliverableId && item.deliverableId > 0,
      };
    });
  }, [apiResponse, stateColorMap, stateProgressMap]);

  const isValidTaskEndDate = (taskEndStr: string) => {
    if (!taskEndStr) return true;

    const startStr = toYMD(projectData?.createDate); 
    const endStr = toYMD(projectData?.endDate);

    if (!startStr || !endStr) return true;

    const taskEnd = parseYMDLocal(taskEndStr);
    const start = parseYMDLocal(startStr);
    const end = parseYMDLocal(endStr);

    if (!taskEnd || !start || !end) return true;

    return (
      taskEnd.getTime() >= start.getTime() && taskEnd.getTime() <= end.getTime()
    );
  };

  const handleInlineUpdate = async (task: any, changes: any) => {
    try {
      const newTitle =
        changes.titleTasks !== undefined
          ? changes.titleTasks.trim()
          : task.titleTasks;

      if (!newTitle) return;

      if (changes.endRegister !== undefined) {
        if (!isValidTaskEndDate(changes.endRegister)) {
          showWarning('Fecha fuera de rango',`La fecha fin debe estar entre ${toYMD(projectData?.createDate)} y ${toYMD(projectData?.endDate)}`);
          return;
        }
      }

      const descriptionToSend =
        task.description && task.description.trim().length > 0
          ? task.description
          : "-";

      const payload = {
        linkToken: task.tasksToken,
        title: newTitle,
        description: descriptionToSend,
        workerId:
          changes.workerId !== undefined ? changes.workerId : task.workerId,
        endDate:
          changes.endRegister !== undefined
            ? changes.endRegister
            : task.endRegister,
        priorityStateId: task.priorityStateId || 0,
        stateTaskId: task.stateTaskId || 0,
        time: task.time || "09:00:00",
        opporToken,
        projectToken: null,
      };

      await updateTaskInline(payload as any);
    } catch (error) {
      console.error("Error al guardar inline:", error);
    }
  };

  const handleOpenFiles = (task: any) => {
    setSelectedTask(task);
    setFileModalOpen(true);
  };

  const handleQuickCreate = async (
    title: string,
    stateId: number,
    workerId?: number,
    dateObj?: Date,
    priorityId?: number,
  ) => {
    try {
      if (!stateId || stateId === 0) {
        alert("Error: No se ha detectado un ID de estado válido.");
        return;
      }

      if (dateObj) {
        const dateStr = dateObj.toISOString().split("T")[0];
        if (!isValidTaskEndDate(dateStr)) {
          showWarning(`No puedes crear una tarea con fecha posterior al cierre del proyecto (${String(projectEndDate).split("T")[0]})`);
          return;
        }
      }

      const payload = {
        title: title,
        stateTaskId: stateId,
        opporToken: opporToken,
        description: "-",
        workerId: workerId ?? 0,
        priorityStateId: priorityId ?? 0,
        endDate: dateObj ? dateObj.toISOString().split("T")[0] : null,
        time: "09:00:00",
        projectToken: null,
      };
      await createTaskInline(payload as any);
    } catch (error) {
      console.error("Error al crear rápido:", error);
    }
  };

  const handleQuickCreateSubTask = async (
    parentToken: string,
    title: string,
    stateId: number,
    workerId?: number,
    dateObj?: Date,
    priorityId?: number,
  ) => {
    try {
      if (dateObj) {
        const dateStr = dateObj.toISOString().split("T")[0];
        if (!isValidTaskEndDate(dateStr)) {
          alert(
            `No puedes crear una sub-tarea con fecha posterior al cierre del proyecto (${String(projectEndDate).split("T")[0]})`,
          );
          return;
        }
      }

      await createSubTaskMut.mutateAsync({
        taskToken: parentToken,
        title: title,
        stateTaskId: stateId,
        priorityStateId: priorityId ?? 0,
        workerId: workerId ?? 0,
        endDate: dateObj ? dateObj.toISOString().split("T")[0] : null,
        time: "09:00:00",
        description: "-",
      });
    } catch (error) {
      console.error("Error al crear sub-tarea:", error);
    }
  };

  const groupedTasks = useMemo(() => {
    if (stateOptions.length === 0) return [];
    return stateOptions.map((stateOpt) => {
      const currentName = (stateOpt.stateDesc || "").trim();
      const tasksInGroup = mappedTaskList.filter(
        (t) => t.statusTasks === currentName,
      );
      const badgeColorClass = stateOpt.stateColor || "bg-gray-500";
      const textColor = bgToText(badgeColorClass);
      const realStateId =
        stateOpt.stateTaskId ||
        (stateOpt as any).id ||
        (stateOpt as any).value ||
        0;
      const percentage = (stateOpt as any).numPercPro ?? 0;

      return {
        stateId: realStateId,
        stateName: currentName,
        headerColors: {
          bg: "bg-white",
          text: textColor,
          border: `border ${badgeColorClass.replace("bg-", "border-").replace("500", "200").replace("600", "200")}`,
        },
        tasks: tasksInGroup,
        rawColor: stateOpt.stateColor,
        percentage,
      };
    });
  }, [mappedTaskList, stateOptions]);

  const pickers = useTaskPickers(
    stateOptions,
    rawPriorities,
    onChangeStatus,
    onChangePriority,
  );

  return (
    <CardContentDetail className="p-0">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden min-h-[400px]">
        <div
          className="h-1.5"
          style={{
            background: "linear-gradient(90deg, var(--brand,#FF6F00), #FFB74D)",
          }}
        />
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 animate-pulse">
            Cargando entregables...
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {groupedTasks.map((group) => (
              <TaskGroup
                key={group.stateName}
                stateName={group.stateName}
                headerColors={group.headerColors}
                stateId={group.stateId}
                tasks={group.tasks as any[]}
                percentage={group.percentage}
                workerOptions={workerOptions}
                priorityOptions={priorityOptions}
                stateOptions={stateOptions}
                onUpdateTask={handleInlineUpdate}
                onQuickCreate={handleQuickCreate}
                onQuickCreateSubTask={handleQuickCreateSubTask}
                onAddTask={(idState) => {
                  openCreate({ opporToken: opporToken, stateTaskId: idState });
                }}
                onOpenStatus={pickers.openStatus}
                onOpenPriority={pickers.openPriority}
                onOpenFiles={handleOpenFiles}
                onDelete={onDelete}
                projectEndDate={projectEndDate}
              />
            ))}
            {groupedTasks.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                No se encontraron estados configurados.
              </div>
            )}
          </div>
        )}
      </div>

      <TaskFilesModal
        open={fileModalOpen}
        onClose={() => setFileModalOpen(false)}
        task={selectedTask}
        opporNumber={projectData?.opporNumber || projectData?.proyectNum || ""}
        projectData={projectData}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["tasksproject"] });
        }}
      />

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
        defaultValues={
          !editingId && opporToken
            ? { ...defaultValues, projectToken: opporToken }
            : defaultValues
        }
        onClose={closeForm}
        onSubmit={submitModal}
        saving={saving}
      />
    </CardContentDetail>
  );
}