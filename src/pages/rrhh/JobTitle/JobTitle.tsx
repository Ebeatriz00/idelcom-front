import { useEffect, useState } from "react";

import type { JobTitleResponseDto } from "@/application/";
import { AsyncState, Breadcrumb } from "@/layouts/";

import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  useJobTitleList,
  useJobTitleMutations,
} from "@/sharedKernel";
import { JobTitleFormModal } from "./components/JobTitleFormModal";
import { JobTitleTable } from "./components/table/JobTitleTable";
import { useHrJobTitlePerms } from "./hooks/jobTitle.perms";
import { useJobTitleFormModal } from "./hooks/useJobTitleFormModal";

export default function JobTitles() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useJobTitleList(
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
    areaLabel,
  } = useJobTitleFormModal();

  const {
    canCreateJobTitle,
    canEditJobTitle,
    canEditStatusJobTitle,
    canDeleteJobTitle,
    canExportJobTitle,
  } = useHrJobTitlePerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useJobTitleMutations();

  const rows: JobTitleResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: JobTitleResponseDto) {
    if (!canEditJobTitle) return;
    openEdit(row);
  }

  async function onToggleStatus(row: JobTitleResponseDto) {
    if (!canEditStatusJobTitle) return;
    const currentStatus = statusToBool(row.status);
    await statusMut.mutateAsync({
      jobTitleId: row.jobTitleId,
      status: boolToStatusString(!currentStatus),
    });
  }

  async function onDelete(_row: JobTitleResponseDto) {
    if (!canDeleteJobTitle) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando cargos…
          </div>
        )}
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Ocurrió un error al cargar los datos."}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "RRHH", href: "#" },
            { label: "Cargos", current: true },
          ]}
          createLabel="Nuevo Cargo"
          onCreate={canCreateJobTitle ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cargos registrados."
        >
          <JobTitleTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
            canEditJobTitle={canEditJobTitle}
            canEditStatusJobTitle={canEditStatusJobTitle}
            canExportJobTitle={canExportJobTitle}
          />
        </AsyncState>
      </section>

      <JobTitleFormModal
        open={open}
        title={editingId ? "Editar Cargo" : "Nuevo Cargo"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        areaLabel={areaLabel}
      />
    </div>
  );
}
