import type { OpportunitiesDetailDto } from "@/application";
import { CardContentDetail } from "@/layouts";
import { TasksFormModal } from "@/pages/crm/tasks/components/TasksFormModal";
import { useTasksFormModal } from "@/pages/crm/tasks/hooks/useTasksFormModal";
import { cn, usePriorityState, useStateTasks } from "@/sharedKernel";
import { useMemo, useState } from "react";
import { useCrmOpporPerms } from "../../../hooks/oppor.perms";
import { TaskDialogs } from "./taskDialogs";
import { TasksFilters } from "./tasksFilters";
import { TasksHeader } from "./tasksHeader";
import { TasksList } from "./tasksList";
import { TasksPagination } from "./tasksPagination";
import { useTaskPickers } from "./useTaskPickers";

type TaskItem = NonNullable<OpportunitiesDetailDto["tasksList"]>[number];

type Props = {
  taskList?: TaskItem[];
  onToggle: (id: string) => void;
  pageSize?: number;
  onChangeStatus: (taskToken: string, lineToken: string | null) => void;
  onChangePriority: (taskToken: string, lineToken: string | null) => void;
  onDelete?: (t: TaskItem) => void;

  // Props para pre-llenar el modal al crear
  opporToken?: string;
  opporDesc?: string;
};

export default function TasksOpportunity({
  taskList = [],
  onToggle,
  pageSize = 5,
  onChangeStatus,
  onChangePriority,
  onDelete,
  opporToken,
  opporDesc,
}: Props) {
  const [open, setOpen] = useState(false);

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
    detail,
    isFetching,
  } = useTasksFormModal();

  const [status, setStatus] = useState<string>("Todos");
  const [owner, setOwner] = useState<string>("Todos");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const resetToFirst = () => setPage(1);

  const pickers = useTaskPickers(
    stateOptions,
    priorityOptions,
    onChangeStatus,
    onChangePriority
  );

  const toDate = (d?: string | Date) => {
    if (!d) return undefined;
    const dt = typeof d === "string" ? new Date(d) : d;
    return isNaN(dt.getTime()) ? undefined : dt;
  };

  const owners = useMemo(() => {
    const set = new Set<string>();
    taskList.forEach((t) => t.tasksResp && set.add(t.tasksResp));
    return Array.from(set).sort();
  }, [taskList]);

  const filtered = useMemo(() => {
    const f = taskList.filter((t) => {
      const current = (t.statusTasks ?? "").toString();
      if (status !== "Todos" && current !== status) return false;
      if (owner !== "Todos" && t.tasksResp !== owner) return false;

      const end = t.endRegister ? toDate(t.endRegister) : undefined;
      const fromD = from ? new Date(from + "T00:00:00") : undefined;
      const toD = to ? new Date(to + "T23:59:59") : undefined;
      if (fromD && (!end || end < fromD)) return false;
      if (toD && (!end || end > toD)) return false;
      return true;
    });

    return f.sort((a, b) => {
      const aDone = (a.statusTasks ?? "") === "Completado" ? 1 : 0;
      const bDone = (b.statusTasks ?? "") === "Completado" ? 1 : 0;
      const ad = toDate(a.endRegister)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bd = toDate(b.endRegister)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aDone - bDone || ad - bd;
    });
  }, [taskList, status, owner, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);

  const { canAddTasksComm, canDeleteTasksComm } = useCrmOpporPerms();

  return (
    <CardContentDetail className="p-0">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div
          className="h-1.5"
          style={{
            background: "linear-gradient(90deg, var(--brand,#FF6F00), #FFB74D)",
          }}
        />

        <TasksHeader
          open={open}
          count={filtered.length}
          onToggle={() => setOpen((v) => !v)}
          onAdd={canAddTasksComm ? openCreate : undefined}
        />

        <div
          id="panel-tasks"
          className={cn(
            "transition-all duration-300 overflow-hidden",
            open
              ? "max-h-[4000px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          )}
        >
          <TasksFilters
            status={status}
            setStatus={setStatus}
            owner={owner}
            setOwner={setOwner}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            owners={owners}
            stateOptions={stateOptions}
            onAnyChange={resetToFirst}
          />

          <TasksList
            data={pageData}
            onToggle={onToggle}
            onOpenStatus={pickers.openStatus}
            onOpenPriority={pickers.openPriority}
            onDelete={canDeleteTasksComm ? onDelete : undefined}
          />
          <div className="mt-3">
            <TasksPagination
              total={filtered.length}
              pageSize={pageSize}
              page={currentPage}
              setPage={setPage}
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

      <TasksFormModal
        open={openForm}
        title={editingId ? "Editar Tarea" : "Nueva Tarea"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={
          !editingId
            ? { ...defaultValues, opporToken: opporToken }
            : defaultValues
        }
        onClose={closeForm}
        onSubmit={submit}
        saving={saving}
        opportunityLabel={!editingId ? opporDesc : detail?.opporDescription}
        stateTaskLabel={detail?.stateTaskDescription}
        workerLabel={detail?.wprkerDescription}
        priorityStateLabel={detail?.priorityStateDescription}
      />
    </CardContentDetail>
  );
}
