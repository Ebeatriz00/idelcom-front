import type { LeadsSourcesResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  useLeadsSourcesList,
  useLeadsSourcesMutations,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { SourcesFormModal } from "./components/modal/SourcesFormModal";
import { SourcesTable } from "./components/table/SourcesTable";
import { useCrmSourcesPerms } from "./hooks/permissions/sources.perms";
import { useLeadsSourcesFormModal } from "./hooks/useSourcesModal";

export default function Sources() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useLeadsSourcesList(
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
  } = useLeadsSourcesFormModal();

  const {
    canCreateSources,
    canEditSources,
    canEditStatusSources,
    canDeleteSources,
    canExportSources,
  } = useCrmSourcesPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useLeadsSourcesMutations();

  const rows: LeadsSourcesResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: LeadsSourcesResponseDto) {
    if (!canEditSources) return;
    if (row.leadsSourcesId) openEdit(row.leadsSourcesId);
  }

  async function onToggleStatus(row: LeadsSourcesResponseDto) {
    if (!canEditStatusSources) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      leadsSourcesId: row.leadsSourcesId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: LeadsSourcesResponseDto) {
    if (!canDeleteSources) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Leads", href: "#" },
            { label: "Fuentes", current: true },
          ]}
          createLabel="Nuevo fuente"
          onCreate={canCreateSources ? openCreate : undefined}
        />
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay fuentes registradas."
        >
          <SourcesTable
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
            canEditSources={canEditSources}
            canEditStatusSources={canEditStatusSources}
            canExportSources={canExportSources}
          />
        </AsyncState>
      </section>

      <SourcesFormModal
        open={open}
        title={editingId ? "Editar Fuente" : "Nueva Fuente"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
