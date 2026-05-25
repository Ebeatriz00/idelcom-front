import type { TasksUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  useTasksById,
  useTasksMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useTasksFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: detail, isFetching } = useTasksById(editingId as any);
  const { createMut, updateMut } = useTasksMutations();

  const defaultValues = useMemo(() => {
    if (!editingId && !detail) {
      return {
        title: "",
        description: "",
        opporToken: null,
        stateTaskId: 0,
        workerId: 0,
        endDate: undefined,
        time: "",
      } as unknown as TasksUpsertDto;
    }

    return {
      linkToken: detail?.linkToken ?? editingId,
      title: detail?.title ?? "",
      description: detail?.description ?? "",
      opporToken: detail?.opporToken ?? null,
      stateTaskId: detail?.stateTaskId ?? 0,
      workerId: detail?.workerId ?? 0,
      priorityStateId: detail?.priorityStateId ?? 0,

      endDate: detail?.endDate,
      time: detail?.time ?? "",
    } as unknown as TasksUpsertDto;
  }, [editingId, detail]);

  function openCreate() {
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
  }

  async function submit(dto: TasksUpsertDto) {
    try {
      if (!dto.linkToken) {
        await createMut.mutateAsync(dto);
      } else {
        await updateMut.mutateAsync(dto);
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
