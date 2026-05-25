import type { TasksProjectResponseDto } from "@/application";
import { Breadcrumb, EntitySidebar } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
} from "@/sharedKernel";
import {
  useTasksProjectList,
  useTasksProjectMutations,
} from "@/sharedKernel/hooks/presale/useTasksProject";
import { CheckSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { TasksProjectTable } from "./components/table/TasksProjectTable";
import { TasksProjectFormModal } from "./components/TasksProjectFormModal";
import { useTasksProjectFormModal } from "./hooks/useTasksProjectFormModal";

export default function TasksProject() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useTasksProjectList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch
  );

  const {
    open,
    isFetching,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
    detail,
  } = useTasksProjectFormModal();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useTasksProjectMutations();

  const rows: TasksProjectResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: TasksProjectResponseDto) {
    if (row.tasksId) openEdit(row.tasksId);
  }

  async function onToggleStatus(row: TasksProjectResponseDto) {
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      tasksId: row.tasksId,
      status: boolToStatusString(!current),
    });
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <EntitySidebar
        icon={<CheckSquare className="size-4" />}
        title="Tareas"
        description="Gestiona las tareas y actividades del sistema."
        stats={[{ label: "Total", value: total }]}
        createLabel="Nueva Tarea"
        onCreate={openCreate}
      />

      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando…
          </div>
        )}
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Error"}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "Pre-Venta", href: "#" },
            { label: "Tareas", current: true },
          ]}
        />

        {!isLoading && !error && (
          <TasksProjectTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
          />
        )}
      </section>

      <TasksProjectFormModal
        open={open}
        title={editingId ? "Editar Tarea" : "Nueva Tarea"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        projectLabel={detail?.projectDescription}
        stateTaskLabel={detail?.stateTaskDescription}
        workerLabel={detail?.wprkerDescription}
        priorityStateLabel={detail?.priorityStateDescription}
      />
    </div>
  );
}
