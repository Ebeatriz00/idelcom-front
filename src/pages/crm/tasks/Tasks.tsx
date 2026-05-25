import type { TasksResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  useTasksList,
  useTasksMutations,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { TasksTable } from "./components/table/TasksTable";

import { TasksFormModal } from "./components/TasksFormModal";
import { useTasksFormModal } from "./hooks/useTasksFormModal";

export default function Tasks() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useTasksList(
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
  } = useTasksFormModal();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useTasksMutations();

  const rows: TasksResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: TasksResponseDto) {
    if (row.linkToken) openEdit(row.linkToken);
  }

  async function onToggleStatus(row: TasksResponseDto) {
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      linkToken: row.linkToken,
      status: boolToStatusString(!current),
    } as any);
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Tareas", current: true },
          ]}
          createLabel="Nueva Tarea"
          onCreate={openCreate}
        />
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay tareas registradas."
        >
          <TasksTable
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
        </AsyncState>
      </section>

      <TasksFormModal
        open={open}
        title={editingId ? "Editar Tarea" : "Nueva Tarea"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        opportunityLabel={detail?.opporDescription}
        stateTaskLabel={detail?.stateTaskDescription}
        workerLabel={detail?.wprkerDescription}
        priorityStateLabel={detail?.priorityStateDescription}
      />
    </div>
  );
}
