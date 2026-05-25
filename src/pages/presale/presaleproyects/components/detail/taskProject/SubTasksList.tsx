import { useEffect, useMemo, useState } from "react";
import type { OptionItem } from "@/application";

import PriorityPickerDialog from "./states/priorityPickerDialog";
import StatusPickerDialog from "./states/statusPickerDialog";
import { useSubTasksList, useSubTasksMutations } from "@/sharedKernel/hooks/subtasks/useSubTasks";
import type { SubTasksResponseDto } from "@/application/dtos/subtasks/SubTasks.dto";
import { SubTaskRow } from "./SubTaskRow";
import type { TaskItem } from "../taskProject/taskRowInline"; // ajusta ruta si es diferente

type Props = {
  parentToken: string;
  workerOptions: OptionItem[];
  priorityOptions: OptionItem[];
  stateOptions: any[];
  onUpdate?: (task: any, changes: any) => void;
  onDelete?: (t: any) => void;
  onOpenStatus?: (t: any, el: HTMLElement) => void;
  onOpenPriority?: (t: any, el: HTMLElement) => void;
  projectEndDate?: string | Date;

  // ✅ NUEVO
  onLoaded?: (items: TaskItem[]) => void;
};

export function SubTasksList({
  parentToken,
  workerOptions,
  priorityOptions,
  stateOptions,
  onDelete: onDeleteProp,
  projectEndDate,
  onLoaded,
}: Props) {
  const { data: subTasks = [], isLoading } = useSubTasksList(parentToken);
  const { updateMut, deleteMut } = useSubTasksMutations();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedSubTask, setSelectedSubTask] = useState<SubTasksResponseDto | null>(null);
  const [pickerType, setPickerType] = useState<"none" | "priority" | "status">("none");

  const pickerPriorityOptions = priorityOptions.map((opt) => ({
    linkToken: String(opt.value),
    value: String(opt.value),
    priorityDesc: opt.label,
    color: (opt as any).color,
  }));

  const pickerStatusOptions = stateOptions.map((opt) => {
    const idVal = opt.value || opt.id || opt.stateTaskId;
    return {
      lineToken: String(idVal),
      value: String(idVal),
      stateDesc: opt.label || opt.stateDesc,
      stateColor: opt.stateColor,
      numPercPro: opt.numPercPro,
    };
  });

  const closePickers = () => {
    setPickerType("none");
    setAnchorEl(null);
    setSelectedSubTask(null);
  };

  const handleOpenPriority = (st: SubTasksResponseDto, anchor: HTMLElement) => {
    setSelectedSubTask(st);
    setAnchorEl(anchor);
    setPickerType("priority");
  };

  const handleOpenStatus = (st: SubTasksResponseDto, anchor: HTMLElement) => {
    setSelectedSubTask(st);
    setAnchorEl(anchor);
    setPickerType("status");
  };

  const handleRowUpdate = (task: any, changes: any) => {
    const payload = {
      linkToken: task.linkToken,
      title: changes.titleTasks ?? task.title,
      description: task.description ?? "-",
      workerId: changes.workerId ?? task.workerId ?? 0,
      stateTaskId: task.stateTaskId ?? 0,
      priorityStateId: task.priorityStateId ?? 0,
      endDate: changes.endRegister
        ? new Date(changes.endRegister).toISOString().split("T")[0]
        : task.endDate,
      time: task.time ?? "09:00:00",
      ...(changes.priorityStateId && { priorityStateId: changes.priorityStateId }),
      ...(changes.stateTaskId && { stateTaskId: changes.stateTaskId }),
    };
    updateMut.mutate(payload);
  };

  const handleDelete = (task: any) => {
    if (deleteMut) deleteMut.mutate(task.linkToken);
    else onDeleteProp?.(task);
  };

  const handleSelectPriority = (opt: any) => {
    const newPriorityId = Number(opt.linkToken || opt.value);

    if (selectedSubTask && !isNaN(newPriorityId)) {
      updateMut.mutate({
        linkToken: selectedSubTask.linkToken,
        priorityStateId: newPriorityId,
        title: selectedSubTask.title,
        description: selectedSubTask.description ?? "-",
        workerId: selectedSubTask.workerId ?? 0,
        stateTaskId: selectedSubTask.stateTaskId ?? 0,
        endDate: selectedSubTask.endDate,
        time: selectedSubTask.time ?? "09:00:00",
      });
    }
    closePickers();
  };

  const handleSelectStatus = (opt: any) => {
    const newStateId = Number(opt.lineToken || opt.value || opt.id);

    if (selectedSubTask && !isNaN(newStateId) && newStateId > 0) {
      updateMut.mutate({
        linkToken: selectedSubTask.linkToken,
        stateTaskId: newStateId,
        priorityStateId: selectedSubTask.priorityStateId ?? 0,
        title: selectedSubTask.title,
        description: selectedSubTask.description ?? "-",
        workerId: selectedSubTask.workerId ?? 0,
        endDate: selectedSubTask.endDate,
        time: selectedSubTask.time ?? "09:00:00",
      });
    }
    closePickers();
  };

  // ✅ Mapea SubTasksResponseDto -> TaskItem para el modal
  const mappedForModal: TaskItem[] = useMemo(() => {
    return (subTasks ?? []).map((st: any) => ({
      tasksId: String(st.linkToken),            // 👈 ID para seleccionar en el modal
      titleTasks: st.title ?? "-",
      statusTasks: st.stateDesc ?? "",          // si no existe, déjalo ""
      tasksResp: st.workerName ?? "",           // si no existe, déjalo ""
      endRegister: st.endDate ?? null,
      priorityDesc: st.priorityDesc ?? "",
      description: st.description ?? "-",
      status: "SUBTASK",
    }));
  }, [subTasks]);

  // ✅ dispara callback cuando termina de cargar
  useEffect(() => {
    if (isLoading) return;
    onLoaded?.(mappedForModal);
  }, [isLoading, onLoaded, mappedForModal]);

  if (isLoading) {
    return (
      <div className="pl-16 py-1 text-[10px] text-gray-400 animate-pulse">
        Cargando...
      </div>
    );
  }

  if (subTasks.length === 0) return null;

  return (
    <>
      <div className="flex flex-col w-full animate-in slide-in-from-top-1 duration-200">
        {subTasks.map((st) => (
          <SubTaskRow
            key={st.linkToken}
            subTask={st}
            workerOptions={workerOptions}
            priorityOptions={priorityOptions}
            stateOptions={stateOptions}
            onOpenPriority={handleOpenPriority}
            onOpenStatus={handleOpenStatus}
            onUpdate={handleRowUpdate}
            onDelete={handleDelete}
            projectEndDate={projectEndDate}
          />
        ))}
      </div>

      <PriorityPickerDialog
        open={pickerType === "priority"}
        anchorEl={anchorEl}
        options={pickerPriorityOptions}
        valueId={selectedSubTask ? String(selectedSubTask.priorityStateId) : null}
        onSelect={handleSelectPriority}
        onClose={closePickers}
        title="Cambiar prioridad"
      />

      <StatusPickerDialog
        open={pickerType === "status"}
        anchorEl={anchorEl}
        options={pickerStatusOptions as any}
        valueId={selectedSubTask ? String(selectedSubTask.stateTaskId) : null}
        onSelect={handleSelectStatus}
        onClose={closePickers}
        title="Cambiar estado"
      />
    </>
  );
}