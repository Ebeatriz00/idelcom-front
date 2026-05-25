import type { TasksProjectUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { useTasksProjectById } from "@/sharedKernel/hooks/presale/useTasksProject";
import { useTasksProjectMutations } from "../mutations/useTasksProjectMutation"; 
import { useMemo, useState } from "react";

export function useTasksProjectFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [initialData, setInitialData] = useState<any>({});

  const { data: detail, isFetching } = useTasksProjectById(editingId);
  const { createMut, updateMut } = useTasksProjectMutations();

  const defaultValues = useMemo(() => {
    if (!editingId || !detail) {
      return {
        title: "",
        description: "",
        projectToken: null, 
        stateTaskId: 0,
        workerId: 0,
        endDate: undefined,
        time: "",
        ...initialData 
      } as unknown as TasksProjectUpsertDto;
    }

    const d = detail as any;
    const tokenFromDetail = d.projectToken ?? (d.projectId ? String(d.projectId) : null);

    return {
      tasksId: detail?.tasksId ?? editingId,
      title: detail?.title ?? "",
      description: detail?.description ?? "",
      projectToken: tokenFromDetail,
      stateTaskId: detail?.stateTaskId ?? 0,
      workerId: detail?.workerId ?? 0,
      priorityStateId: detail?.priorityStateId ?? 0,
      endDate: detail?.endDate,
      time: detail?.time ?? "",
    } as unknown as TasksProjectUpsertDto;
  }, [editingId, detail, initialData]); 

  function openCreate(overrides?: any) {
    setEditingId(null);
    setInitialData(overrides || {}); 
    setOpen(true);
  }

  function openEdit(id: number) {
    setEditingId(id);
    setInitialData({}); 
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
    setInitialData({}); 
  }

  async function submit(dto: TasksProjectUpsertDto) {
    try {
      showLoading("Guardando tarea...");
      console.log("Submitting task with data:", dto.tasksId);
      if (!dto.tasksId) {
        await createMut.mutateAsync(dto);
        showSuccess("Tarea creada.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Tarea actualizada.");
      }
      close();
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
    }
  }

  const saving = createMut.isPending || updateMut.isPending;

  return {
    open,
    isFetching,
    defaultValues,
    detail,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  };
}